import React, { useEffect, useState } from 'react'
import { UserList } from '../components/UserList'
import { UserModal } from '../components/UserModal'
import { ConfirmModal } from '../components/ConfirmModal'
import toastr from 'toastr'
import 'toastr/build/toastr.min.css'

export function UsersPage({ getUsersUseCase, createUserUseCase, updateUserUseCase, deleteUserUseCase }) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editing, setEditing] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [targetUser, setTargetUser] = useState(null)

  // Configure toastr (once)
  useEffect(() => {
    toastr.options = {
      positionClass: 'toast-top-right',
      timeOut: 3000,
      closeButton: true,
      progressBar: true,
      newestOnTop: true,
    }
  }, [])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await getUsersUseCase.execute()
        if (mounted) setUsers(res)
      } catch (err) {
        console.error(err)
        if (mounted) setError(err?.message || 'Failed to load users')
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => (mounted = false)
  }, [getUsersUseCase])

  // no local success banner; we use toasts instead

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="mb-0">Users</h3>
        <button
          className="btn btn-primary"
          onClick={() => { setEditing(null); setModalOpen(true) }}
        >
          Add User
        </button>
      </div>

      {loading && <div>Loading...</div>}
      {/* Errors and successes are reported via toasts */}
      {!loading && !error && (
        <UserList
          users={users}
          onEdit={(u) => { setEditing(u); setModalOpen(true) }}
          onDelete={(id) => {
            const user = users.find(u => u.id === id)
            setTargetUser(user || { id })
            setConfirmOpen(true)
          }}
        />
      )}

      <UserModal
        show={modalOpen}
        title={editing ? 'Edit User' : 'Add User'}
        initialUser={editing}
        onClose={() => { setModalOpen(false); setEditing(null) }}
        onSubmit={async (payload) => {
          try {
            setError(null)
            if (editing?.id) {
              const updated = await updateUserUseCase.execute(editing.id, payload)
              setUsers(prev => prev.map(u => (u.id === updated.id ? updated : u)))
              toastr.success('User updated successfully')
            } else {
              const created = await createUserUseCase.execute(payload)
              setUsers(prev => [...prev, created])
              toastr.success('User created successfully')
            }
            setModalOpen(false)
            setEditing(null)
          } catch (e) {
            const msg = e?.message || 'Failed to save user'
            setError(msg)
            toastr.error(msg)
          }
        }}
      />

      <ConfirmModal
        show={confirmOpen}
        title="Delete User"
        message={`Are you sure you want to delete ${targetUser?.name || 'this user'}?`}
        confirmText="Delete"
        cancelText="Cancel"
        onCancel={() => { setConfirmOpen(false); setTargetUser(null) }}
        onConfirm={async () => {
          try {
            setError(null)
            const id = targetUser?.id
            await deleteUserUseCase.execute(id)
            setUsers(prev => prev.filter(u => u.id !== id))
            if (editing?.id === id) setEditing(null)
            toastr.success('User deleted successfully')
          } catch (e) {
            const msg = e?.message || 'Failed to delete user'
            setError(msg)
            toastr.error(msg)
          } finally {
            setConfirmOpen(false)
            setTargetUser(null)
          }
        }}
      />
    </>
  )
}
