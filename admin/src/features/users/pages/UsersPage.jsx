import React, { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { UserList } from '../components/UserList'
import { UserModal } from '../components/UserModal'
import { fetchRoles } from '../../roles/api/rolesApi'
import { ConfirmModal } from '../../../shared/components/ConfirmModal'
import { usePermissions } from '../../../shared/hooks/usePermissions'
import { getUserDisplayName } from '../../../shared/lib/userDisplayName'
import { useUsers } from '../hooks/useUsers'

const isValidationErrorMap = (err) => {
  if (!err || typeof err !== 'object' || Array.isArray(err)) return false
  return Object.values(err).every((value) => typeof value === 'string')
}

export function UsersPage() {
  const qc = useQueryClient()
  const [editing, setEditing] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [targetUser, setTargetUser] = useState(null)
  const [formErrors, setFormErrors] = useState({})

  const {
    users = [],
    isLoading: loading,
    isError,
    error,
    createUserMutation,
    updateUserMutation,
    deleteUserMutation,
    handleCreateUser,
    handleUpdateUser,
    handleDeleteUser,
  } = useUsers()

  const submitting = createUserMutation.isPending || updateUserMutation.isPending
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

  return (
    <>
      <div className="page-card">
        <div className="page-header">
          <div>
            <h2 className="page-title">Users</h2>
            <p className="page-subtitle">Manage workspace members, permissions, and access.</p>
          </div>
          <div className="page-actions">
            <button
              className="btn btn-outline-secondary"
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

        <div className="page-body">
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
        </div>
      </div>
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
          setFormErrors({})
          try {
            if (editing?.id) {
              await handleUpdateUser(editing.id, payload)
            } else {
              await handleCreateUser(payload)
            }
            setModalOpen(false)
            setEditing(null)
          } catch (e) {
            if (isValidationErrorMap(e)) {
              setFormErrors(e)
            }
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
          await handleDeleteUser(id)
          if (editing?.id === id) setEditing(null)
          setConfirmOpen(false)
          setTargetUser(null)
        }}
      />
    </>
  )
}
