import React from 'react'
import { formatPermissionsForDisplay } from '../constants/permissionDefinitions'

export function RoleList({ roles, onEdit, onDelete, canEdit = true, canDelete = true }) {
  return (
    <table className="table table-striped">
      <thead>
        <tr>
          <th>#</th>
          <th>Name</th>
          <th>Permissions</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {roles.map(r => {
          const displayPermissions = formatPermissionsForDisplay(r.permissions)
          return (
            <tr key={r.id}>
              <td>{r.id}</td>
              <td>{r.name}</td>
              <td>
                {displayPermissions.length ? (
                  <ul className="list-unstyled mb-0">
                    {displayPermissions.map((line) => (
                      <li key={`${r.id}-${line}`}>{line}</li>
                    ))}
                  </ul>
                ) : (
                  <span className="text-muted">No permissions</span>
                )}
              </td>
              <td>
                <button
                  className="btn btn-sm btn-outline-primary mr-2"
                  onClick={() => { if (canEdit) onEdit(r) }}
                  disabled={!canEdit}
                >
                  Edit
                </button>
                <button
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => { if (canDelete) onDelete(r.id) }}
                  disabled={!canDelete}
                >
                  Delete
                </button>
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
