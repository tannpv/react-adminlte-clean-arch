import React from 'react'
import { formatPermissionsForDisplay } from '../constants/permissionDefinitions'

export function RoleList({ roles, onEdit, onDelete, canEdit = true, canDelete = true }) {
  return (
    <div className="roles-list-container">
      <div className="table-responsive">
        <table className="table table-hover roles-table align-middle mb-0">
          <thead className="table-dark">
            <tr>
              <th className="role-id-column">
                <i className="fas fa-hashtag mr-2"></i>
                ID
              </th>
              <th className="role-name-column">
                <i className="fas fa-tag mr-2"></i>
                Role Name
              </th>
              <th className="role-permissions-column">
                <i className="fas fa-shield-alt mr-2"></i>
                Permissions
              </th>
              <th className="role-actions-column text-center">
                <i className="fas fa-cogs mr-2"></i>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {roles.map((role, index) => {
              const displayPermissions = formatPermissionsForDisplay(role.permissions)
              const permissionCount = role.permissions ? role.permissions.length : 0
              const isSystemRole = role.name === 'Administrator' || role.name === 'User'

              return (
                <tr key={role.id} className="role-row">
                  <td className="role-id-cell">
                    <span className="role-id-badge">{role.id}</span>
                  </td>
                  <td className="role-name-cell">
                    <div className="role-name-info">
                      <div className="role-name">
                        <strong>{role.name}</strong>
                        {isSystemRole && (
                          <span className="badge badge-info ml-2">
                            <i className="fas fa-lock mr-1"></i>
                            System
                          </span>
                        )}
                      </div>
                      <small className="text-muted">
                        {permissionCount} permission{permissionCount !== 1 ? 's' : ''}
                      </small>
                    </div>
                  </td>
                  <td className="role-permissions-cell">
                    <div className="permissions-display">
                      {displayPermissions.length > 0 ? (
                        <div className="permissions-list">
                          {displayPermissions.slice(0, 3).map((line, idx) => (
                            <div key={`${role.id}-${idx}`} className="permission-item">
                              <i className="fas fa-check-circle text-success mr-2"></i>
                              <span className="permission-text">{line}</span>
                            </div>
                          ))}
                          {displayPermissions.length > 3 && (
                            <div className="permission-more">
                              <i className="fas fa-ellipsis-h text-muted mr-2"></i>
                              <span className="text-muted">
                                +{displayPermissions.length - 3} more permission{displayPermissions.length - 3 !== 1 ? 's' : ''}
                              </span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="no-permissions">
                          <i className="fas fa-exclamation-triangle text-warning mr-2"></i>
                          <span className="text-muted">No permissions assigned</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="role-actions-cell text-center">
                    <div className="action-buttons">
                      <button
                        className="btn btn-sm btn-outline-primary mr-2"
                        onClick={() => { if (canEdit) onEdit(role) }}
                        disabled={!canEdit}
                        title="Edit role permissions"
                      >
                        <i className="fas fa-edit mr-1"></i>
                        Edit
                      </button>
                      {!isSystemRole && (
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => { if (canDelete) onDelete(role.id) }}
                          disabled={!canDelete}
                          title="Delete role"
                        >
                          <i className="fas fa-trash mr-1"></i>
                          Delete
                        </button>
                      )}
                      {isSystemRole && (
                        <span className="text-muted" title="System roles cannot be deleted">
                          <i className="fas fa-lock"></i>
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {roles.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-content">
            <i className="fas fa-user-shield empty-state-icon"></i>
            <h4 className="empty-state-title">No Roles Found</h4>
            <p className="empty-state-description">
              Get started by creating your first role to define user permissions.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}