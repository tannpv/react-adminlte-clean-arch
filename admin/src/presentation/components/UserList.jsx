import React from 'react'

export function UserList({ users, onEdit, onDelete, rolesById }) {
  return (
    <table className="table table-striped">
      <thead>
        <tr>
          <th>#</th>
          <th>Name</th>
          <th>Email</th>
          <th>Roles</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {users.map(u => (
          <tr key={u.id}>
            <td>{u.id}</td>
            <td>{u.name}</td>
            <td>{u.email}</td>
            <td>{Array.isArray(u.roles) && rolesById ? u.roles.map(id => rolesById[id]?.name || id).join(', ') : ''}</td>
            <td>
              <button className="btn btn-sm btn-outline-primary mr-2" onClick={() => onEdit(u)}>Edit</button>
              <button className="btn btn-sm btn-outline-danger" onClick={() => onDelete(u.id)}>Delete</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
