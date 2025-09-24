import React from 'react'

export function ProductCard({ product, isLoading }) {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: product.currency || 'USD'
    }).format(price)
  }

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'published':
        return 'badge-success'
      case 'draft':
        return 'badge-warning'
      case 'archived':
        return 'badge-secondary'
      default:
        return 'badge-light'
    }
  }

  const getTypeBadgeClass = (type) => {
    switch (type) {
      case 'simple':
        return 'badge-primary'
      case 'variable':
        return 'badge-info'
      default:
        return 'badge-light'
    }
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case 'simple':
        return 'fas fa-box'
      case 'variable':
        return 'fas fa-layer-group'
      default:
        return 'fas fa-cube'
    }
  }

  return (
    <div className="card product-card h-100">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <div className="product-badges">
            <span className={`badge ${getStatusBadgeClass(product.status)} badge-sm mr-1`}>
              {product.status}
            </span>
            <span className={`badge ${getTypeBadgeClass(product.type)} badge-sm`}>
              <i className={`${getTypeIcon(product.type)} mr-1`}></i>
              {product.type}
            </span>
          </div>
          <div className="product-actions">
            <button
              className="btn btn-sm btn-outline-primary"
              disabled={isLoading}
            >
              <i className="fas fa-edit"></i>
            </button>
          </div>
        </div>

        <h6 className="card-title mb-2">
          <a href="#" className="text-decoration-none">
            {product.name}
          </a>
        </h6>

        <p className="card-text text-muted small mb-2">
          SKU: <code>{product.sku}</code>
        </p>

        {product.description && (
          <p className="card-text small text-muted mb-3">
            {product.description.length > 100 
              ? `${product.description.substring(0, 100)}...` 
              : product.description
            }
          </p>
        )}

        <div className="d-flex justify-content-between align-items-center">
          <div className="product-price">
            <span className="h6 mb-0 text-primary">
              {formatPrice(product.price)}
            </span>
          </div>
          <div className="product-meta">
            <small className="text-muted">
              <i className="fas fa-calendar mr-1"></i>
              {new Date(product.updatedAt).toLocaleDateString()}
            </small>
          </div>
        </div>

        {product.categories && product.categories.length > 0 && (
          <div className="mt-2">
            <div className="product-categories">
              {product.categories.slice(0, 3).map(category => (
                <span key={category.id} className="badge badge-light badge-sm mr-1">
                  {category.name}
                </span>
              ))}
              {product.categories.length > 3 && (
                <span className="badge badge-light badge-sm">
                  +{product.categories.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {product.attributeValues && product.attributeValues.length > 0 && (
          <div className="mt-2">
            <div className="product-attributes">
              <small className="text-muted">
                <i className="fas fa-tags mr-1"></i>
                {product.attributeValues.length} attribute{product.attributeValues.length !== 1 ? 's' : ''}
              </small>
            </div>
          </div>
        )}
      </div>

      <div className="card-footer bg-transparent">
        <div className="d-flex justify-content-between">
          <button
            className="btn btn-sm btn-outline-secondary"
            disabled={isLoading}
          >
            <i className="fas fa-eye mr-1"></i>
            View
          </button>
          <button
            className="btn btn-sm btn-outline-primary"
            disabled={isLoading}
          >
            <i className="fas fa-edit mr-1"></i>
            Edit
          </button>
        </div>
      </div>
    </div>
  )
}
