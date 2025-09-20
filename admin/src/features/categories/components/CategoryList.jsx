import React from 'react'

export function CategoryList({ categories, onEdit, onDelete, canEdit = true, canDelete = true }) {
  return (
    <table className="table table-hover align-middle mb-0">
      <thead>
        <tr>
          <th>#</th>
          <th>Name</th>
          <th>Parent</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {categories.map(category => (
          <tr key={category.id}>
            <td>{category.id}</td>
            <td>{category.name}</td>
            <td>{category.parentName ?? '—'}</td>
            <td>
              <button
                className="btn btn-sm btn-outline-primary mr-2"
                onClick={() => { if (canEdit) onEdit(category) }}
                disabled={!canEdit}
              >
                Edit
              </button>
              <button
                className="btn btn-sm btn-outline-danger"
                onClick={() => { if (canDelete) onDelete(category.id) }}
                disabled={!canDelete}
              >
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
