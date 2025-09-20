import React from 'react'

const formatPrice = (priceCents, currency = 'USD') => {
  const value = Number(priceCents || 0) / 100
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(value)
}

export function ProductList({ products, onEdit, onDelete }) {
  return (
    <table className="table table-hover align-middle mb-0">
      <thead>
        <tr>
          <th>#</th>
          <th>SKU</th>
          <th>Name</th>
          <th>Type</th>
          <th>Status</th>
          <th>Categories</th>
          <th className="text-right">Price</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {products.map((product) => (
          <tr key={product.id}>
            <td>{product.id}</td>
            <td>{product.sku}</td>
            <td>{product.name}</td>
            <td>
              <span className="badge badge-pill badge-info text-uppercase">
                {product.type || 'simple'}
              </span>
              {product.type === 'variable' && Array.isArray(product.variants) && (
                <small className="d-block text-muted">{product.variants.length} variant{product.variants.length === 1 ? '' : 's'}</small>
              )}
            </td>
            <td>
              <span className="badge badge-pill badge-secondary text-uppercase">{product.status}</span>
            </td>
            <td>
              {Array.isArray(product.categories) && product.categories.length ? (
                <ul className="list-unstyled mb-0">
                  {product.categories.map((category) => (
                    <li key={`${product.id}-${category.id}`}>{category.name}</li>
                  ))}
                </ul>
              ) : (
                <span className="text-muted">None</span>
              )}
            </td>
            <td className="text-right">{formatPrice(product.priceCents, product.currency)}</td>
            <td>
              <button className="btn btn-sm btn-outline-primary mr-2" onClick={() => onEdit(product)}>
                Edit
              </button>
              <button className="btn btn-sm btn-outline-danger" onClick={() => onDelete(product)}>
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
