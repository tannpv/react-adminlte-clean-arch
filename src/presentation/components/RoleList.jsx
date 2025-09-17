import React from 'react'

export function RoleList({ roles, onEdit, onDelete }) {
  return (
    <table className="table table-striped">
      <thead>
        <tr>
          <th>#</th>
          <th>Name</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {roles.map(r => (
          <tr key={r.id}>
            <td>{r.id}</td>
            <td>{r.name}</td>
            <td>
              <button className="btn btn-sm btn-outline-primary mr-2" onClick={() => onEdit(r)}>Edit</button>
              <button className="btn btn-sm btn-outline-danger" onClick={() => onDelete(r.id)}>Delete</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

