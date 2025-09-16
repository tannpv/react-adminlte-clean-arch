import React, { useEffect, useState } from 'react'
import { UserList } from '../components/UserList'
import { UserModal } from '../components/UserModal'
import { ConfirmModal } from '../components/ConfirmModal'
import toastr from 'toastr'
import 'toastr/build/toastr.min.css'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export function UsersPage({ getUsersUseCase, createUserUseCase, updateUserUseCase, deleteUserUseCase }) {
  const qc = useQueryClient()
  const { data: users = [], isLoading: loading, isError, error } = useQuery({
    queryKey: ['users'],
    queryFn: () => getUsersUseCase.execute(),
  })
  const [editing, setEditing] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [targetUser, setTargetUser] = useState(null)
  const [formErrors, setFormErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

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

  // Mutations for CRUD
  const createMutation = useMutation({
    mutationFn: (payload) => createUserUseCase.execute(payload),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['users'] })
      toastr.success('User created successfully')
    },
    onError: (e) => {
      const status = e?.response?.status
      if (status !== 400) toastr.error(e?.message || 'Failed to create user')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => updateUserUseCase.execute(id, payload),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['users'] })
      toastr.success('User updated successfully')
    },
    onError: (e) => {
      const status = e?.response?.status
      if (status !== 400) toastr.error(e?.message || 'Failed to update user')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteUserUseCase.execute(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['users'] })
      toastr.success('User deleted successfully')
    },
    onError: (e) => toastr.error(e?.message || 'Failed to delete user'),
  })

  // no local success banner; we use toasts instead

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="mb-0">Users</h3>
        <button
          className="btn btn-primary"
          onClick={() => { setEditing(null); setFormErrors({}); setModalOpen(true) }}
        >
          Add User
        </button>
      </div>

      {loading && <div>Loading...</div>}
      {/* Errors and successes are reported via toasts; show initial load error inline */}
      {!loading && !isError && (
        <UserList
          users={users}
          onEdit={(u) => { setEditing(u); setFormErrors({}); setModalOpen(true) }}
          onDelete={(id) => {
            const user = users.find(u => u.id === id)
            setTargetUser(user || { id })
            setConfirmOpen(true)
          }}
        />
      )}
      {!loading && isError && (
        <div className="alert alert-danger" role="alert">
          {error?.message || 'Failed to load users'}
        </div>
      )}

      <UserModal
        show={modalOpen}
        title={editing ? 'Edit User' : 'Add User'}
        initialUser={editing}
        errors={formErrors}
        submitting={submitting}
        onClose={() => { setModalOpen(false); setEditing(null); setFormErrors({}) }}
        onSubmit={async (payload) => {
          setSubmitting(true)
          setFormErrors({})
          try {
            if (editing?.id) {
              await updateMutation.mutateAsync({ id: editing.id, payload })
            } else {
              await createMutation.mutateAsync(payload)
            }
            setModalOpen(false)
            setEditing(null)
          } catch (e) {
            const status = e?.response?.status
            const vErrors = e?.response?.data?.errors || e?.response?.data?.error?.details?.fieldErrors
            if (status === 400 && vErrors && typeof vErrors === 'object') {
              // Normalize values to strings
              const norm = Object.fromEntries(
                Object.entries(vErrors).map(([k, v]) => [k, typeof v === 'string' ? v : v?.message || 'Invalid'])
              )
              setFormErrors(norm)
            }
          } finally {
            setSubmitting(false)
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
          const id = targetUser?.id
          await deleteMutation.mutateAsync(id)
          if (editing?.id === id) setEditing(null)
          setConfirmOpen(false)
          setTargetUser(null)
        }}
      />
    </>
  )
}
