import React, { useEffect, useState } from 'react'
import { UserList } from '../components/UserList'
import { UserModal } from '../components/UserModal'

export function UsersPage({ getUsersUseCase, createUserUseCase, updateUserUseCase, deleteUserUseCase }) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editing, setEditing] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)

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
      {!loading && error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}
      {!loading && !error && (
        <UserList
          users={users}
          onEdit={(u) => { setEditing(u); setModalOpen(true) }}
          onDelete={async (id) => {
            try {
              setError(null)
              await deleteUserUseCase.execute(id)
              setUsers(prev => prev.filter(u => u.id !== id))
              if (editing?.id === id) setEditing(null)
            } catch (e) {
              setError(e?.message || 'Failed to delete user')
            }
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
            } else {
              const created = await createUserUseCase.execute(payload)
              setUsers(prev => [...prev, created])
            }
            setModalOpen(false)
            setEditing(null)
          } catch (e) {
            setError(e?.message || 'Failed to save user')
          }
        }}
      />
    </>
  )
}
