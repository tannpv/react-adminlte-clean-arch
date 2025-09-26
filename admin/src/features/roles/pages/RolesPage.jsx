import React, { useState } from 'react'
import { ConfirmModal } from '../../../shared/components/ConfirmModal'
import Button from '../../../shared/components/ui/Button'
import Card from '../../../shared/components/ui/Card'
import { usePermissions } from '../../../shared/hooks/usePermissions'
import { useLanguage, useTranslation } from '../../../shared/hooks/useTranslation'
import { RoleList } from '../components/RoleList'
import { RoleModal } from '../components/RoleModal'
import { useRoles } from '../hooks/useRoles'

const isValidationErrorMap = (err) => {
  if (!err || typeof err !== 'object' || Array.isArray(err)) return false
  return Object.values(err).every((value) => typeof value === 'string')
}

export function RolesPage() {
  const { can } = usePermissions()
  const { languageCode } = useLanguage()
  const { t } = useTranslation(languageCode, 'roles')
  const [modalOpen, setModalOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [targetRole, setTargetRole] = useState(null)
  const [formErrors, setFormErrors] = useState({})
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
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <i className="fas fa-user-shield mr-3 text-blue-600"></i>
                {t('roles_permissions', 'Roles & Permissions')}
              </h1>
              <p className="mt-2 text-gray-600 max-w-2xl">
                {t('page_subtitle', 'Define permission sets and control what teams can access. Create custom roles to match your organization\'s needs.')}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="primary"
                onClick={() => { setEditing({}); setFormErrors({}); setModalOpen(true) }}
                disabled={!canCreateRole}
                title={!canCreateRole ? t('not_allowed', 'Not allowed') : undefined}
              >
                <i className="fas fa-plus mr-2"></i>
                {t('add_new_role', 'Add New Role')}
              </Button>
            </div>
          </div>
        </div>

        {/* Permission Warning */}
        {!canViewRoles && (
          <Card className="mb-6">
            <Card.Body>
              <div className="flex items-center p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                <i className="fas fa-exclamation-triangle text-yellow-600 mr-3"></i>
                <span className="text-yellow-800">{t('no_permission_view_roles', 'You do not have permission to view roles.')}</span>
              </div>
            </Card.Body>
          </Card>
        )}

        {/* Loading State */}
        {canViewRoles && loading && (
          <Card>
            <Card.Body>
              <div className="text-center py-12">
                <i className="fas fa-spinner fa-spin text-4xl text-gray-400 mb-4"></i>
                <h4 className="text-lg font-medium text-gray-900 mb-2">{t('loading_roles', 'Loading Roles')}</h4>
                <p className="text-gray-600">{t('loading_roles_description', 'Please wait while we fetch the role information...')}</p>
              </div>
            </Card.Body>
          </Card>
        )}

        {/* Statistics Cards */}
        {canViewRoles && !loading && !isError && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
              <div className="flex items-center">
                <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                  <i className="fas fa-users text-2xl"></i>
                </div>
                <div className="ml-4">
                  <div className="text-3xl font-bold">{roles.length}</div>
                  <div className="text-blue-100">{t('total_roles', 'Total Roles')}</div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
              <div className="flex items-center">
                <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                  <i className="fas fa-shield-alt text-2xl"></i>
                </div>
                <div className="ml-4">
                  <div className="text-3xl font-bold">
                    {roles.reduce((acc, role) => acc + (role.permissions?.length || 0), 0)}
                  </div>
                  <div className="text-green-100">{t('total_permissions', 'Total Permissions')}</div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
              <div className="flex items-center">
                <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                  <i className="fas fa-lock text-2xl"></i>
                </div>
                <div className="ml-4">
                  <div className="text-3xl font-bold">
                    {roles.filter(role => role.name === 'Administrator' || role.name === 'User').length}
                  </div>
                  <div className="text-purple-100">{t('system_roles', 'System Roles')}</div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white">
              <div className="flex items-center">
                <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                  <i className="fas fa-user-plus text-2xl"></i>
                </div>
                <div className="ml-4">
                  <div className="text-3xl font-bold">
                    {roles.filter(role => role.name !== 'Administrator' && role.name !== 'User').length}
                  </div>
                  <div className="text-orange-100">{t('custom_roles', 'Custom Roles')}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Roles Content */}
        {canViewRoles && !loading && !isError && (
          <div className="space-y-6">

            <Card>
              <Card.Header>
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <i className="fas fa-list mr-2 text-blue-600"></i>
                      {t('role_management', 'Role Management')}
                    </h3>
                    <p className="mt-1 text-sm text-gray-600">
                      {t('role_management_description', 'Manage existing roles and their permissions. System roles cannot be deleted.')}
                    </p>
                  </div>
                </div>
              </Card.Header>
              <Card.Body>
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
              </Card.Body>
            </Card>
          </div>
        )}

        {/* Error State */}
        {canViewRoles && !loading && isError && (
          <Card>
            <Card.Body>
              <div className="text-center py-12">
                <i className="fas fa-exclamation-circle text-4xl text-red-400 mb-4"></i>
                <h4 className="text-lg font-medium text-gray-900 mb-2">{t('failed_to_load_roles', 'Failed to Load Roles')}</h4>
                <p className="text-gray-600 mb-6">
                  {error?.message || t('unexpected_error_loading_roles', 'An unexpected error occurred while loading roles.')}
                </p>
                <Button
                  variant="outline-primary"
                  onClick={() => window.location.reload()}
                >
                  <i className="fas fa-redo mr-2"></i>
                  {t('try_again', 'Try Again')}
                </Button>
              </div>
            </Card.Body>
          </Card>
        )}
      </div>

      <RoleModal
        show={modalOpen}
        title={editing?.id ? t('edit_role', 'Edit Role') : t('add_role', 'Add Role')}
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
        title={t('delete_role', 'Delete Role')}
        message={`${t('confirm_delete_role', 'Are you sure you want to delete')} ${targetRole?.name || t('this_role', 'this role')}?`}
        confirmText={t('delete', 'Delete')}
        cancelText={t('cancel', 'Cancel')}
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

export default RolesPage;