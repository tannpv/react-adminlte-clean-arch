import React from 'react'
import { getUserDisplayName } from '../../../shared/lib/userDisplayName'

export function UserList({ users, onEdit, onDelete, rolesById }) {
  return (
    <div className="users-list-container">
      <div className="table-responsive">
        <table className="table table-hover users-table align-middle mb-0">
          <thead className="table-dark">
            <tr>
              <th className="user-id-column">
                <i className="fas fa-hashtag mr-2"></i>
                ID
              </th>
              <th className="user-avatar-column">
                <i className="fas fa-user-circle mr-2"></i>
                Avatar
              </th>
              <th className="user-name-column">
                <i className="fas fa-user mr-2"></i>
                Name
              </th>
              <th className="user-email-column">
                <i className="fas fa-envelope mr-2"></i>
                Email
              </th>
              <th className="user-roles-column">
                <i className="fas fa-shield-alt mr-2"></i>
                Roles
              </th>
              <th className="user-status-column">
                <i className="fas fa-info-circle mr-2"></i>
                Status
              </th>
              <th className="user-actions-column text-center">
                <i className="fas fa-cogs mr-2"></i>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              const displayName = getUserDisplayName(user)
              const userRoles = Array.isArray(user.roles) && rolesById
                ? user.roles.map(id => rolesById[id]).filter(Boolean)
                : []
              const isAdmin = userRoles.some(role => role.name === 'Administrator')
              const hasProfile = user.profile && (user.profile.firstName || user.profile.lastName)
              const isActive = user.isActive !== false

              return (
                <tr key={user.id} className="user-row">
                  <td className="user-id-cell">
                    <span className="user-id-badge">{user.id}</span>
                  </td>
                  <td className="user-avatar-cell">
                    <div className="user-avatar">
                      {user.profile?.pictureUrl ? (
                        <img
                          src={user.profile.pictureUrl}
                          alt={displayName}
                          className="avatar-image"
                        />
                      ) : (
                        <div className="avatar-placeholder">
                          <i className="fas fa-user"></i>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="user-name-cell">
                    <div className="user-name-info">
                      <div className="user-name">
                        <strong>{displayName}</strong>
                        {isAdmin && (
                          <span className="badge badge-warning ml-2">
                            <i className="fas fa-crown mr-1"></i>
                            Admin
                          </span>
                        )}
                      </div>
                      <small className="text-muted">
                        {hasProfile ? 'Profile Complete' : 'Basic Info Only'}
                      </small>
                    </div>
                  </td>
                  <td className="user-email-cell">
                    <div className="user-email">
                      <i className="fas fa-envelope mr-2 text-muted"></i>
                      <span>{user.email}</span>
                    </div>
                  </td>
                  <td className="user-roles-cell">
                    <div className="user-roles">
                      {userRoles.length > 0 ? (
                        <div className="roles-list">
                          {userRoles.slice(0, 2).map((role, idx) => (
                            <span key={idx} className="role-badge">
                              {role.name}
                            </span>
                          ))}
                          {userRoles.length > 2 && (
                            <span className="role-more">
                              +{userRoles.length - 2} more
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted">
                          <i className="fas fa-exclamation-triangle mr-1"></i>
                          No roles
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="user-status-cell">
                    <div className="user-status">
                      <span className={`status-badge ${isActive ? 'status-active' : 'status-inactive'}`}>
                        <i className={`fas ${isActive ? 'fa-check-circle' : 'fa-times-circle'} mr-1`}></i>
                        {isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </td>
                  <td className="user-actions-cell text-center">
                    <div className="action-buttons">
                      <button
                        className="btn btn-sm btn-outline-primary mr-2"
                        onClick={() => onEdit(user)}
                        title="Edit user information"
                      >
                        <i className="fas fa-edit mr-1"></i>
                        Edit
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => onDelete(user.id)}
                        title="Delete user"
                      >
                        <i className="fas fa-trash mr-1"></i>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}