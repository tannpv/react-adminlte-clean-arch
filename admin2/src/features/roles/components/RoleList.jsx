import React from 'react'
import Button from '../../../shared/components/ui/Button'
import Table from '../../../shared/components/ui/Table'
import { useLanguage, useTranslation } from '../../../shared/hooks/useTranslation'
import { formatPermissionsForDisplay } from '../constants/permissionDefinitions'

export function RoleList({ roles, onEdit, onDelete, canEdit = true, canDelete = true }) {
  const { languageCode } = useLanguage()
  const { t } = useTranslation(languageCode, 'roles')
  return (
    <>
      <Table hover darkHeader>
        <Table.Header>
          <Table.HeaderCell>
            <i className="fas fa-hashtag mr-2"></i>
            {t('id', 'ID')}
          </Table.HeaderCell>
          <Table.HeaderCell>
            <i className="fas fa-tag mr-2"></i>
            {t('role_name', 'Role Name')}
          </Table.HeaderCell>
          <Table.HeaderCell>
            <i className="fas fa-shield-alt mr-2"></i>
            {t('permissions', 'Permissions')}
          </Table.HeaderCell>
          <Table.HeaderCell className="text-center">
            <i className="fas fa-cogs mr-2"></i>
            {t('actions', 'Actions')}
          </Table.HeaderCell>
        </Table.Header>
        <Table.Body>
          {roles.map((role, index) => {
            const displayPermissions = formatPermissionsForDisplay(role.permissions)
            const permissionCount = role.permissions ? role.permissions.length : 0
            const isSystemRole = role.name === 'Administrator' || role.name === 'User'

            return (
              <Table.Row key={role.id}>
                <Table.Cell className="font-medium text-gray-900">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {role.id}
                  </span>
                </Table.Cell>
                <Table.Cell>
                  <div className="flex flex-col">
                    <div className="flex items-center">
                      <span className="font-medium text-gray-900">{role.name}</span>
                      {isSystemRole && (
                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          <i className="fas fa-lock mr-1"></i>
                          {t('system', 'System')}
                        </span>
                      )}
                    </div>
                    <span className="text-sm text-gray-500">
                      {t('permission_count', '{{count}} permission', { count: permissionCount })}
                    </span>
                  </div>
                </Table.Cell>
                <Table.Cell>
                  <div className="space-y-1">
                    {displayPermissions.length > 0 ? (
                      <>
                        {displayPermissions.slice(0, 3).map((line, idx) => (
                          <div key={`${role.id}-${idx}`} className="flex items-center text-sm">
                            <i className="fas fa-check-circle text-green-500 mr-2"></i>
                            <span className="text-gray-700">{line}</span>
                          </div>
                        ))}
                        {displayPermissions.length > 3 && (
                          <div className="flex items-center text-sm text-gray-500">
                            <i className="fas fa-ellipsis-h mr-2"></i>
                            <span>
                              +{displayPermissions.length - 3} {t('more_permissions', 'more permission')}
                            </span>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="flex items-center text-sm text-gray-500">
                        <i className="fas fa-exclamation-triangle text-yellow-500 mr-2"></i>
                        <span>{t('no_permissions_assigned', 'No permissions assigned')}</span>
                      </div>
                    )}
                  </div>
                </Table.Cell>
                <Table.Cell className="whitespace-nowrap">
                  <div className="flex justify-center gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => { if (canEdit) onEdit(role) }}
                      disabled={!canEdit}
                      title={t('edit_role_permissions', 'Edit role permissions')}
                    >
                      <i className="fas fa-edit mr-1"></i>
                      {t('edit', 'Edit')}
                    </Button>
                    {!isSystemRole && (
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => { if (canDelete) onDelete(role.id) }}
                        disabled={!canDelete}
                        title={t('delete_role', 'Delete role')}
                      >
                        <i className="fas fa-trash mr-1"></i>
                        {t('delete', 'Delete')}
                      </Button>
                    )}
                    {isSystemRole && (
                      <span className="text-gray-400" title={t('system_roles_cannot_be_deleted', 'System roles cannot be deleted')}>
                        <i className="fas fa-lock"></i>
                      </span>
                    )}
                  </div>
                </Table.Cell>
              </Table.Row>
            )
          })}
        </Table.Body>
      </Table>

      {roles.length === 0 && (
        <div className="text-center py-12">
          <i className="fas fa-user-shield text-4xl text-gray-400 mb-4"></i>
          <h4 className="text-lg font-medium text-gray-900 mb-2">{t('no_roles_found', 'No Roles Found')}</h4>
          <p className="text-gray-600">
            {t('get_started_roles', 'Get started by creating your first role to define user permissions.')}
          </p>
        </div>
      )}
    </>
  )
}