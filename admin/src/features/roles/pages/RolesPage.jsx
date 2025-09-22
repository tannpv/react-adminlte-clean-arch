import React, { useState } from 'react'
import { ConfirmModal } from '../../../shared/components/ConfirmModal'
import { usePermissions } from '../../../shared/hooks/usePermissions'
import { RoleList } from '../components/RoleList'
import { RoleModal } from '../components/RoleModal'
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
            <h2 className="page-title">
              <i className="fas fa-user-shield mr-2"></i>
              Roles & Permissions
            </h2>
            <p className="page-subtitle">
              Define permission sets and control what teams can access.
              Create custom roles to match your organization's needs.
            </p>
          </div>
          <div className="page-actions">
            <button
              className="btn btn-primary"
              onClick={() => { setEditing({}); setFormErrors({}); setModalOpen(true) }}
              disabled={!canCreateRole}
              title={!canCreateRole ? 'Not allowed' : undefined}
            >
              <i className="fas fa-plus mr-2"></i>
              Add New Role
            </button>
          </div>
        </div>

        <div className="page-body">
          {!canViewRoles && (
            <div className="alert alert-warning" role="alert">
              <i className="fas fa-exclamation-triangle mr-2"></i>
              You do not have permission to view roles.
            </div>
          )}

          {canViewRoles && loading && (
            <div className="loading-state">
              <div className="loading-content">
                <i className="fas fa-spinner fa-spin loading-icon"></i>
                <h4 className="loading-title">Loading Roles</h4>
                <p className="loading-description">Please wait while we fetch the role information...</p>
              </div>
            </div>
          )}

          {canViewRoles && !loading && !isError && (
            <div className="roles-content">
              <div className="roles-stats mb-4">
                <div className="row">
                  <div className="col-md-3">
                    <div className="stat-card">
                      <div className="stat-icon">
                        <i className="fas fa-users"></i>
                      </div>
                      <div className="stat-content">
                        <div className="stat-number">{roles.length}</div>
                        <div className="stat-label">Total Roles</div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="stat-card">
                      <div className="stat-icon">
                        <i className="fas fa-shield-alt"></i>
                      </div>
                      <div className="stat-content">
                        <div className="stat-number">
                          {roles.reduce((acc, role) => acc + (role.permissions?.length || 0), 0)}
                        </div>
                        <div className="stat-label">Total Permissions</div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="stat-card">
                      <div className="stat-icon">
                        <i className="fas fa-lock"></i>
                      </div>
                      <div className="stat-content">
                        <div className="stat-number">
                          {roles.filter(role => role.name === 'Administrator' || role.name === 'User').length}
                        </div>
                        <div className="stat-label">System Roles</div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="stat-card">
                      <div className="stat-icon">
                        <i className="fas fa-user-plus"></i>
                      </div>
                      <div className="stat-content">
                        <div className="stat-number">
                          {roles.filter(role => role.name !== 'Administrator' && role.name !== 'User').length}
                        </div>
                        <div className="stat-label">Custom Roles</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="roles-table-section">
                <div className="section-header">
                  <h5 className="section-title">
                    <i className="fas fa-list mr-2"></i>
                    Role Management
                  </h5>
                  <p className="section-description">
                    Manage existing roles and their permissions. System roles cannot be deleted.
                  </p>
                </div>

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
              </div>
            </div>
          )}

          {canViewRoles && !loading && isError && (
            <div className="error-state">
              <div className="error-content">
                <i className="fas fa-exclamation-circle error-icon"></i>
                <h4 className="error-title">Failed to Load Roles</h4>
                <p className="error-description">
                  {error?.message || 'An unexpected error occurred while loading roles.'}
                </p>
                <button
                  className="btn btn-outline-primary"
                  onClick={() => window.location.reload()}
                >
                  <i className="fas fa-redo mr-2"></i>
                  Try Again
                </button>
              </div>
            </div>
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