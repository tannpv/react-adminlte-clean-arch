import React, { useState } from 'react'
import { RoleList } from '../components/RoleList'
import { RoleModal } from '../components/RoleModal'
import { ConfirmModal } from '../../../shared/components/ConfirmModal'
import { usePermissions } from '../../../shared/hooks/usePermissions'
import { useRoles } from '../hooks/useRoles'

const isValidationErrorMap = (err) => {
  if (!err || typeof err !== 'object' || Array.isArray(err)) return false
  return Object.values(err).every((value) => typeof value === 'string')
}

export function RolesPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [targetRole, setTargetRole] = useState(null)
  const [formErrors, setFormErrors] = useState({})
  const { can } = usePermissions()
  const [editing, setEditing] = useState(null)

  const canViewRoles = can('roles:read')
  const canCreateRole = can('roles:create')
  const canUpdateRole = can('roles:update')
  const canDeleteRole = can('roles:delete')

  const {
    roles = [],
    isLoading: loading,
    isError,
    error,
    createRoleMutation,
    updateRoleMutation,
    deleteRoleMutation,
    handleCreateRole,
    handleUpdateRole,
    handleDeleteRole,
  } = useRoles({ enabled: canViewRoles })

  const submitting = createRoleMutation.isPending || updateRoleMutation.isPending

  return (
    <>
      <div className="page-card">
        <div className="page-header">
          <div>
            <h2 className="page-title">Roles</h2>
            <p className="page-subtitle">Define permission sets and control what teams can access.</p>
          </div>
          <div className="page-actions">
            <button
              className="btn btn-primary"
              onClick={() => { setEditing({}); setFormErrors({}); setModalOpen(true) }}
              disabled={!canCreateRole}
              title={!canCreateRole ? 'Not allowed' : undefined}
            >
              Add Role
            </button>
          </div>
        </div>

        <div className="page-body">
          {!canViewRoles && (
            <div className="alert alert-warning" role="alert">
              You do not have permission to view roles.
            </div>
          )}

          {canViewRoles && loading && <div>Loading...</div>}
          {canViewRoles && !loading && !isError && (
            <RoleList
              roles={roles}
              canEdit={canUpdateRole}
              canDelete={canDeleteRole}
              onEdit={(role) => {
                setEditing(role)
                setFormErrors({})
                setModalOpen(true)
              }}
              onDelete={(id) => {
                const role = roles.find(x => x.id === id)
                setTargetRole(role || { id })
                setConfirmOpen(true)
              }}
            />
          )}
          {canViewRoles && !loading && isError && (
            <div className="alert alert-danger" role="alert">{error?.message || 'Failed to load roles'}</div>
          )}
        </div>
      </div>

      <RoleModal
        show={modalOpen}
        title={editing?.id ? 'Edit Role' : 'Add Role'}
        initialRole={editing}
        errors={formErrors}
        submitting={submitting}
        onClose={() => { setModalOpen(false); setEditing(null); setFormErrors({}) }}
        onSubmit={async (payload) => {
          setFormErrors({})
          try {
            if (editing?.id) {
              await handleUpdateRole(editing.id, payload)
            } else {
              await handleCreateRole(payload)
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
        title="Delete Role"
        message={`Are you sure you want to delete ${targetRole?.name || 'this role'}?`}
        confirmText="Delete"
        cancelText="Cancel"
        onCancel={() => { setConfirmOpen(false); setTargetRole(null) }}
        onConfirm={async () => {
          const id = targetRole?.id
          await handleDeleteRole(id)
          if (editing?.id === id) setEditing(null)
          setConfirmOpen(false)
          setTargetRole(null)
        }}
      />
    </>
  )
}
