import React, { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toastr from 'toastr'
import 'toastr/build/toastr.min.css'
import { UserList } from '../components/UserList'
import { UserModal } from '../components/UserModal'
import { fetchUsers, createUser, updateUser, deleteUser } from '../api/usersApi'
import { fetchRoles } from '../../roles/api/rolesApi'
import { ConfirmModal } from '../../../shared/components/ConfirmModal'
import { usePermissions } from '../../../shared/hooks/usePermissions'
import { getUserDisplayName } from '../../../shared/lib/userDisplayName'

export function UsersPage() {
  const qc = useQueryClient()
  const [editing, setEditing] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [targetUser, setTargetUser] = useState(null)
  const [formErrors, setFormErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const { data: users = [], isLoading: loading, isError, error } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
  })
  const { can } = usePermissions()
  // Prefer cached roles if present; only fetch when needed
  const cachedRoles = qc.getQueryData(['roles'])
  const { data: roles = [], isLoading: rolesLoading } = useQuery({
    queryKey: ['roles'],
    queryFn: fetchRoles,
    // Enable fetching if the modal is open (needs options), or user can change users, or we already have cache
    enabled: modalOpen || !!cachedRoles || can('users:create') || can('users:update'),
    // Seed from cache to avoid empty select while query resolves
    initialData: cachedRoles,
    // Roles change rarely; keep fresh for longer to avoid refetches
    staleTime: 5 * 60 * 1000,
    refetchOnMount: false,
  })

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
    mutationFn: (payload) => createUser(payload),
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
    mutationFn: ({ id, payload }) => updateUser(id, payload),
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
    mutationFn: (id) => deleteUser(id),
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
        <div>
          <button
            className="btn btn-outline-secondary mr-2"
            onClick={() => qc.invalidateQueries({ queryKey: ['roles'] })}
            disabled={rolesLoading}
            title="Refresh role options"
          >
            Refresh Roles
          </button>
          <button
            className="btn btn-primary"
            onClick={() => { setEditing({}); setFormErrors({}); setModalOpen(true) }}
            disabled={!can('users:create')}
            title={!can('users:create') ? 'Not allowed' : undefined}
          >
            Add User
          </button>
        </div>
      </div>

      {loading && <div>Loading...</div>}
      {/* Errors and successes are reported via toasts; show initial load error inline */}
      {!loading && !isError && (
        <UserList
          users={users}
          rolesById={Object.fromEntries((roles || []).map(r => [r.id, r]))}
          onEdit={(u) => { if (!can('users:update')) return; setEditing(u); setFormErrors({}); setModalOpen(true) }}
          onDelete={(id) => {
            if (!can('users:delete')) return
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
        roles={roles}
        rolesLoading={rolesLoading}
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
        message={`Are you sure you want to delete ${getUserDisplayName(targetUser) || 'this user'}?`}
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
