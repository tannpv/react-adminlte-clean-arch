import React from 'react'

export function ProductAttributeList({ attributes, onEdit, onDelete, onManageTerms, canUpdate = true, canDelete = true }) {
  return (
    <table className="table table-hover align-middle mb-0">
      <thead>
        <tr>
          <th>Name</th>
          <th>Slug</th>
          <th>Input Type</th>
          <th>Terms</th>
          <th className="text-right">Actions</th>
        </tr>
      </thead>
      <tbody>
        {attributes.length === 0 ? (
          <tr>
            <td colSpan={5} className="text-center text-muted">No attributes defined.</td>
          </tr>
        ) : (
          attributes.map((attribute) => (
            <tr key={attribute.id}>
              <td>{attribute.name}</td>
              <td><code>{attribute.slug}</code></td>
              <td className="text-capitalize">{attribute.inputType}</td>
              <td>
                {attribute.terms?.length ? (
                  <span className="badge badge-pill badge-secondary">{attribute.terms.length} term{attribute.terms.length === 1 ? '' : 's'}</span>
                ) : (
                  <span className="text-muted">None</span>
                )}
              </td>
              <td className="text-right text-nowrap">
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary mr-2"
                  onClick={() => onManageTerms(attribute)}
                  disabled={!canUpdate}
                  title={!canUpdate ? 'Not allowed' : undefined}
                >
                  Terms
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-primary mr-2"
                  onClick={() => onEdit(attribute)}
                  disabled={!canUpdate}
                  title={!canUpdate ? 'Not allowed' : undefined}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => onDelete(attribute)}
                  disabled={!canDelete}
                  title={!canDelete ? 'Not allowed' : undefined}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  )
}
