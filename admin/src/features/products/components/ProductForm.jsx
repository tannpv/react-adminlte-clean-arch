import React, { useEffect, useState } from 'react'

const STATUSES = [
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'archived', label: 'Archived' },
]

const PRODUCT_TYPES = [
  { value: 'simple', label: 'Simple' },
  { value: 'variable', label: 'Variable' },
]

const getError = (errors, key) => {
  const raw = errors?.[key]
  if (!raw) return null
  return typeof raw === 'string' ? raw : raw?.message || 'Invalid'
}

export function ProductForm({
  initialProduct,
  categoriesLoading = false,
  onSubmit,
  onCancel,
  errors = {},
  submitting = false,
  formId = 'product-form',
  categoryOptions = [],
}) {
  const [sku, setSku] = useState('')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [currency, setCurrency] = useState('USD')
  const [status, setStatus] = useState('draft')
  const [categories, setCategories] = useState([])
  const [type, setType] = useState('simple')

  useEffect(() => {
    if (!initialProduct || !initialProduct.id) {
      setSku(initialProduct?.sku || '')
      setName(initialProduct?.name || '')
      setDescription(initialProduct?.description || '')
      setPrice(initialProduct && typeof initialProduct.price === 'number' ? String(initialProduct.price) : '')
      setCurrency(initialProduct?.currency || 'USD')
      setStatus(initialProduct?.status || 'draft')
      setCategories(Array.isArray(initialProduct?.categoryIds) ? initialProduct.categoryIds.map(String) : [])
      setType(initialProduct?.type || 'simple')
      return
    }

    setSku(initialProduct.sku || '')
    setName(initialProduct.name || '')
    setDescription(initialProduct.description || '')
    setPrice(typeof initialProduct.price === 'number' ? String(initialProduct.price) : '')
    setCurrency(initialProduct.currency || 'USD')
    setStatus(initialProduct.status || 'draft')
    setCategories(Array.isArray(initialProduct.categoryIds) ? initialProduct.categoryIds.map(String) : [])
    setType(initialProduct.type || 'simple')
  }, [initialProduct])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (submitting) return

    const payload = {
      sku: sku.trim(),
      name: name.trim(),
      description: description.trim() || null,
      price: parseFloat(price) || 0,
      currency: currency.trim(),
      status,
      categoryIds: categories.map(Number),
      type,
    }

    onSubmit(payload)
  }

  const handleCategoryChange = (categoryId, checked) => {
    const categoryIdStr = String(categoryId)
    if (checked) {
      setCategories((prev) => [...prev, categoryIdStr])
    } else {
      setCategories((prev) => prev.filter((id) => id !== categoryIdStr))
    }
  }

  return (
    <form id={formId} onSubmit={handleSubmit}>
      <div className="row">
        <div className="col-md-6">
          <div className="form-group">
            <label htmlFor="sku">SKU *</label>
            <input
              type="text"
              className={`form-control ${getError(errors, 'sku') ? 'is-invalid' : ''}`}
              id="sku"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              disabled={submitting}
              required
            />
            {getError(errors, 'sku') && (
              <div className="invalid-feedback">{getError(errors, 'sku')}</div>
            )}
          </div>
        </div>
        <div className="col-md-6">
          <div className="form-group">
            <label htmlFor="name">Name *</label>
            <input
              type="text"
              className={`form-control ${getError(errors, 'name') ? 'is-invalid' : ''}`}
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={submitting}
              required
            />
            {getError(errors, 'name') && (
              <div className="invalid-feedback">{getError(errors, 'name')}</div>
            )}
          </div>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="description">Description</label>
        <textarea
          className={`form-control ${getError(errors, 'description') ? 'is-invalid' : ''}`}
          id="description"
          rows="3"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={submitting}
        />
        {getError(errors, 'description') && (
          <div className="invalid-feedback">{getError(errors, 'description')}</div>
        )}
      </div>

      <div className="row">
        <div className="col-md-4">
          <div className="form-group">
            <label htmlFor="price">Price *</label>
            <input
              type="number"
              step="0.01"
              min="0"
              className={`form-control ${getError(errors, 'price') ? 'is-invalid' : ''}`}
              id="price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              disabled={submitting}
              required
            />
            {getError(errors, 'price') && (
              <div className="invalid-feedback">{getError(errors, 'price')}</div>
            )}
          </div>
        </div>
        <div className="col-md-4">
          <div className="form-group">
            <label htmlFor="currency">Currency</label>
            <select
              className={`form-control ${getError(errors, 'currency') ? 'is-invalid' : ''}`}
              id="currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              disabled={submitting}
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
            </select>
            {getError(errors, 'currency') && (
              <div className="invalid-feedback">{getError(errors, 'currency')}</div>
            )}
          </div>
        </div>
        <div className="col-md-4">
          <div className="form-group">
            <label htmlFor="status">Status</label>
            <select
              className={`form-control ${getError(errors, 'status') ? 'is-invalid' : ''}`}
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              disabled={submitting}
            >
              {STATUSES.map((statusOption) => (
                <option key={statusOption.value} value={statusOption.value}>
                  {statusOption.label}
                </option>
              ))}
            </select>
            {getError(errors, 'status') && (
              <div className="invalid-feedback">{getError(errors, 'status')}</div>
            )}
          </div>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="type">Product Type</label>
        <select
          className={`form-control ${getError(errors, 'type') ? 'is-invalid' : ''}`}
          id="type"
          value={type}
          onChange={(e) => setType(e.target.value)}
          disabled={submitting}
        >
          {PRODUCT_TYPES.map((typeOption) => (
            <option key={typeOption.value} value={typeOption.value}>
              {typeOption.label}
            </option>
          ))}
        </select>
        {getError(errors, 'type') && (
          <div className="invalid-feedback">{getError(errors, 'type')}</div>
        )}
      </div>

      <div className="form-group">
        <label>Categories</label>
        {categoriesLoading ? (
          <div className="text-muted">Loading categories...</div>
        ) : (
          <div className="d-flex flex-wrap">
            {categoryOptions.map((category) => (
              <div key={category.id} className="custom-control custom-checkbox mr-4 mb-2">
                <input
                  type="checkbox"
                  className="custom-control-input"
                  id={`category-${category.id}`}
                  checked={categories.includes(String(category.id))}
                  onChange={(e) => handleCategoryChange(category.id, e.target.checked)}
                  disabled={submitting}
                />
                <label className="custom-control-label" htmlFor={`category-${category.id}`}>
                  {category.name}
                </label>
              </div>
            ))}
          </div>
        )}
        {getError(errors, 'categoryIds') && (
          <div className="invalid-feedback d-block">{getError(errors, 'categoryIds')}</div>
        )}
      </div>

      <div className="modal-footer">
        <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={submitting}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Saving...' : 'Save'}
        </button>
      </div>
    </form>
  )
}