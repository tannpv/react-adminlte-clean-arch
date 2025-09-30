import React from 'react'
import Button from '../../../shared/components/ui/Button'
import Table from '../../../shared/components/ui/Table'
import { formatPermissionsForDisplay } from '../constants/permissionDefinitions'

export function RoleList({ roles, onEdit, onDelete, canEdit = true, canDelete = true }) {
  return (
    <div className="overflow-x-auto">
      <Table hover darkHeader>
        <Table.Header>
          <Table.HeaderCell>
            <i className="fas fa-hashtag mr-2"></i>
            ID
          </Table.HeaderCell>
          <Table.HeaderCell>
            <i className="fas fa-tag mr-2"></i>
            Role Name
          </Table.HeaderCell>
          <Table.HeaderCell>
            <i className="fas fa-shield-alt mr-2"></i>
            Permissions
          </Table.HeaderCell>
          <Table.HeaderCell className="text-center">
            <i className="fas fa-cogs mr-2"></i>
            Actions
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
                      <span className="font-semibold text-gray-900 text-base">{role.name}</span>
                      {isSystemRole && (
                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          <i className="fas fa-lock mr-1"></i>
                          System
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-400 mt-1">
                      {permissionCount} permission{permissionCount !== 1 ? 's' : ''}
                    </span>
                  </div>
                </Table.Cell>
                <Table.Cell>
                  <div className="max-w-xs">
                    {displayPermissions.length > 0 ? (
                      <div className="flex items-center text-sm">
                        <i className="fas fa-check-circle text-green-500 mr-2 flex-shrink-0"></i>
                        <span className="text-gray-700 truncate">
                          {displayPermissions.length} permission{displayPermissions.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center text-sm text-gray-500">
                        <i className="fas fa-exclamation-triangle text-yellow-500 mr-2 flex-shrink-0"></i>
                        <span className="truncate">No permissions</span>
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
                      title="Edit role permissions"
                    >
                      <i className="fas fa-edit mr-1"></i>
                      Edit
                    </Button>
                    {!isSystemRole && (
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => { if (canDelete) onDelete(role.id) }}
                        disabled={!canDelete}
                        title="Delete role"
                      >
                        <i className="fas fa-trash mr-1"></i>
                        Delete
                      </Button>
                    )}
                    {isSystemRole && (
                      <span className="text-gray-400" title="System roles cannot be deleted">
                        <i className="fas fa-lock"></i>
                      </span>
                    )}
                  </div>
                </Table.Cell>
              </Table.Row>
            )
          })}
          {roles.length === 0 && (
            <tr>
              <td colSpan="4" className="text-center py-12">
                <i className="fas fa-user-shield text-4xl text-gray-400 mb-4"></i>
                <h4 className="text-lg font-medium text-gray-900 mb-2">No Roles Found</h4>
                <p className="text-gray-600">
                  Get started by creating your first role to define user permissions.
                </p>
              </td>
            </tr>
          )}
        </Table.Body>
      </Table>
    </div>
  )
}

export default RoleList;