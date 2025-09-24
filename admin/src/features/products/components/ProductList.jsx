import React from 'react'
import { useLanguage, useTranslation } from '../../../shared/hooks/useTranslation'

const formatPrice = (priceCents, currency = 'USD') => {
  const value = Number(priceCents || 0) / 100
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(value)
}

export function ProductList({ products, onEdit, onDelete }) {
  const { languageCode } = useLanguage()
  const { t } = useTranslation(languageCode, 'products')
  return (
    <div className="products-list-container">
      <div className="table-responsive">
        <table className="table table-hover products-table align-middle mb-0">
          <thead className="table-dark">
            <tr>
              <th className="product-id-column">
                <i className="fas fa-hashtag mr-2"></i>
                {t('id', 'ID')}
              </th>
              <th className="product-sku-column">
                <i className="fas fa-barcode mr-2"></i>
                {t('sku', 'SKU')}
              </th>
              <th className="product-name-column">
                <i className="fas fa-box mr-2"></i>
                {t('product_name', 'Product Name')}
              </th>
              <th className="product-type-column">
                <i className="fas fa-tag mr-2"></i>
                {t('type', 'Type')}
              </th>
              <th className="product-status-column">
                <i className="fas fa-info-circle mr-2"></i>
                {t('status', 'Status')}
              </th>
              <th className="product-categories-column">
                <i className="fas fa-tags mr-2"></i>
                {t('categories', 'Categories')}
              </th>
              <th className="product-price-column text-right">
                <i className="fas fa-dollar-sign mr-2"></i>
                {t('price', 'Price')}
              </th>
              <th className="product-actions-column text-center">
                <i className="fas fa-cogs mr-2"></i>
                {t('actions', 'Actions')}
              </th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => {
              const isVariable = product.type === 'variable'
              const variantCount = isVariable && Array.isArray(product.variants) ? product.variants.length : 0
              const hasCategories = Array.isArray(product.categories) && product.categories.length > 0

              return (
                <tr key={product.id} className="product-row">
                  <td className="product-id-cell">
                    <span className="product-id-badge">{product.id}</span>
                  </td>
                  <td className="product-sku-cell">
                    <div className="product-sku">
                      <code className="sku-code">{product.sku}</code>
                    </div>
                  </td>
                  <td className="product-name-cell">
                    <div className="product-name-info">
                      <div className="product-name">
                        <strong>{product.name}</strong>
                      </div>
                      {product.description && (
                        <small className="text-muted product-description">
                          {product.description.length > 60
                            ? `${product.description.substring(0, 60)}...`
                            : product.description
                          }
                        </small>
                      )}
                    </div>
                  </td>
                  <td className="product-type-cell">
                    <div className="product-type">
                      <span className={`type-badge ${isVariable ? 'type-variable' : 'type-simple'}`}>
                        <i className={`fas ${isVariable ? 'fa-cogs' : 'fa-box'} mr-1`}></i>
                        {product.type || 'simple'}
                      </span>
                      {isVariable && variantCount > 0 && (
                        <small className="d-block text-muted mt-1">
                          {t('variant_count', '{{count}} variant', { count: variantCount })}
                        </small>
                      )}
                    </div>
                  </td>
                  <td className="product-status-cell">
                    <span className={`status-badge status-${product.status}`}>
                      <i className={`fas ${product.status === 'published' ? 'fa-eye' :
                        product.status === 'draft' ? 'fa-edit' :
                          'fa-archive'
                        } mr-1`}></i>
                      {product.status}
                    </span>
                  </td>
                  <td className="product-categories-cell">
                    <div className="product-categories">
                      {hasCategories ? (
                        <div className="categories-list">
                          {product.categories.slice(0, 2).map((category) => (
                            <span key={`${product.id}-${category.id}`} className="category-badge">
                              {category.name}
                            </span>
                          ))}
                          {product.categories.length > 2 && (
                            <span className="category-more">
                              +{product.categories.length - 2} {t('more', 'more')}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted">
                          <i className="fas fa-minus mr-1"></i>
                          {t('no_categories', 'No categories')}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="product-price-cell text-right">
                    <div className="product-price">
                      <span className="price-amount">
                        {formatPrice(product.priceCents, product.currency)}
                      </span>
                      <small className="d-block text-muted currency-code">
                        {product.currency || 'USD'}
                      </small>
                    </div>
                  </td>
                  <td className="product-actions-cell text-center">
                    <div className="action-buttons">
                      <button
                        className="btn btn-sm btn-outline-primary mr-2"
                        onClick={() => onEdit(product)}
                        title={t('edit_product', 'Edit product')}
                      >
                        <i className="fas fa-edit mr-1"></i>
                        {t('edit', 'Edit')}
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => onDelete(product)}
                        title={t('delete_product', 'Delete product')}
                      >
                        <i className="fas fa-trash mr-1"></i>
                        {t('delete', 'Delete')}
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {products.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-content">
            <i className="fas fa-box empty-state-icon"></i>
            <h4 className="empty-state-title">{t('no_products_found', 'No Products Found')}</h4>
            <p className="empty-state-description">
              {t('get_started_products', 'Get started by adding your first product to build your catalog.')}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}