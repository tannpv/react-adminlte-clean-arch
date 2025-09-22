import React, { useEffect, useState } from 'react'
import { ProductAttributeForm } from './ProductAttributeForm'

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
  const [attributeValues, setAttributeValues] = useState({})

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
      attributeValues,
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
    <form id={formId} onSubmit={handleSubmit} className="product-form">
      {/* Basic Information Section */}
      <div className="form-section mb-4">
        <h6 className="section-title">
          <i className="fas fa-info-circle mr-2"></i>
          Basic Information
        </h6>
        <div className="form-row">
          <div className="form-group col-md-6">
            <label className="form-label">
              <i className="fas fa-barcode mr-2"></i>
              SKU *
            </label>
            <input
              type="text"
              className={`form-control ${getError(errors, 'sku') ? 'is-invalid' : ''}`}
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              placeholder="Enter product SKU (e.g., PROD-001)"
              disabled={submitting}
              required
            />
            {getError(errors, 'sku') && (
              <div className="invalid-feedback">
                <i className="fas fa-exclamation-triangle mr-1"></i>
                {getError(errors, 'sku')}
              </div>
            )}
            <small className="form-text text-muted">
              <i className="fas fa-lightbulb mr-1"></i>
              Stock Keeping Unit - unique identifier for inventory tracking
            </small>
          </div>
          <div className="form-group col-md-6">
            <label className="form-label">
              <i className="fas fa-tag mr-2"></i>
              Product Name *
            </label>
            <input
              type="text"
              className={`form-control ${getError(errors, 'name') ? 'is-invalid' : ''}`}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter product name"
              disabled={submitting}
              required
            />
            {getError(errors, 'name') && (
              <div className="invalid-feedback">
                <i className="fas fa-exclamation-triangle mr-1"></i>
                {getError(errors, 'name')}
              </div>
            )}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">
            <i className="fas fa-align-left mr-2"></i>
            Description
          </label>
          <textarea
            className={`form-control ${getError(errors, 'description') ? 'is-invalid' : ''}`}
            rows="3"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter product description..."
            disabled={submitting}
          />
          {getError(errors, 'description') && (
            <div className="invalid-feedback">
              <i className="fas fa-exclamation-triangle mr-1"></i>
              {getError(errors, 'description')}
            </div>
          )}
        </div>
      </div>

      {/* Pricing & Status Section */}
      <div className="form-section mb-4">
        <h6 className="section-title">
          <i className="fas fa-dollar-sign mr-2"></i>
          Pricing & Status
        </h6>
        <div className="form-row">
          <div className="form-group col-md-4">
            <label className="form-label">
              <i className="fas fa-money-bill-wave mr-2"></i>
              Price *
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              className={`form-control ${getError(errors, 'price') ? 'is-invalid' : ''}`}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
              disabled={submitting}
              required
            />
            {getError(errors, 'price') && (
              <div className="invalid-feedback">
                <i className="fas fa-exclamation-triangle mr-1"></i>
                {getError(errors, 'price')}
              </div>
            )}
          </div>
          <div className="form-group col-md-4">
            <label className="form-label">
              <i className="fas fa-globe mr-2"></i>
              Currency
            </label>
            <select
              className={`form-control ${getError(errors, 'currency') ? 'is-invalid' : ''}`}
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              disabled={submitting}
            >
              <option value="USD">USD - US Dollar</option>
              <option value="EUR">EUR - Euro</option>
              <option value="GBP">GBP - British Pound</option>
            </select>
            {getError(errors, 'currency') && (
              <div className="invalid-feedback">
                <i className="fas fa-exclamation-triangle mr-1"></i>
                {getError(errors, 'currency')}
              </div>
            )}
          </div>
          <div className="form-group col-md-4">
            <label className="form-label">
              <i className="fas fa-toggle-on mr-2"></i>
              Status
            </label>
            <select
              className={`form-control ${getError(errors, 'status') ? 'is-invalid' : ''}`}
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
              <div className="invalid-feedback">
                <i className="fas fa-exclamation-triangle mr-1"></i>
                {getError(errors, 'status')}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Product Type Section */}
      <div className="form-section mb-4">
        <h6 className="section-title">
          <i className="fas fa-cogs mr-2"></i>
          Product Configuration
        </h6>
        <div className="form-group">
          <label className="form-label">
            <i className="fas fa-layer-group mr-2"></i>
            Product Type
          </label>
          <select
            className={`form-control ${getError(errors, 'type') ? 'is-invalid' : ''}`}
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
            <div className="invalid-feedback">
              <i className="fas fa-exclamation-triangle mr-1"></i>
              {getError(errors, 'type')}
            </div>
          )}
          <small className="form-text text-muted">
            <i className="fas fa-info-circle mr-1"></i>
            Simple: Single product variant. Variable: Multiple variants (size, color, etc.)
          </small>
        </div>
      </div>

      {/* Categories Section */}
      <div className="form-section mb-4">
        <h6 className="section-title">
          <i className="fas fa-tags mr-2"></i>
          Categories
        </h6>
        <div className="form-group">
          <label className="form-label">
            <i className="fas fa-folder mr-2"></i>
            Assign Categories
          </label>
          {categoriesLoading ? (
            <div className="categories-loading">
              <i className="fas fa-spinner fa-spin mr-2"></i>
              Loading categories...
            </div>
          ) : (
            <div className="categories-selection">
              {categoryOptions.length > 0 ? (
                <div className="categories-grid">
                  {categoryOptions.map((category) => (
                    <div key={category.id} className="category-checkbox-item">
                      <div className="custom-control custom-checkbox">
                        <input
                          type="checkbox"
                          className="custom-control-input"
                          id={`category-${category.id}`}
                          checked={categories.includes(String(category.id))}
                          onChange={(e) => handleCategoryChange(category.id, e.target.checked)}
                          disabled={submitting}
                        />
                        <label className="custom-control-label" htmlFor={`category-${category.id}`}>
                          <i className="fas fa-folder mr-2"></i>
                          {category.name}
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-categories">
                  <i className="fas fa-folder-open mr-2"></i>
                  No categories available. Create categories first to organize your products.
                </div>
              )}
            </div>
          )}
          {getError(errors, 'categoryIds') && (
            <div className="invalid-feedback d-block">
              <i className="fas fa-exclamation-triangle mr-1"></i>
              {getError(errors, 'categoryIds')}
            </div>
          )}
          <small className="form-text text-muted">
            <i className="fas fa-lightbulb mr-1"></i>
            Select categories to help customers find your products
          </small>
        </div>
      </div>

      {/* Product Attributes Section */}
      <div className="form-section mb-4">
        <h6 className="section-title">
          <i className="fas fa-tags mr-2"></i>
          Product Attributes
        </h6>
        <ProductAttributeForm
          productId={initialProduct?.id}
          onAttributeChange={setAttributeValues}
          initialValues={attributeValues}
          errors={errors}
          disabled={submitting}
        />
      </div>

    </form>
  )
}