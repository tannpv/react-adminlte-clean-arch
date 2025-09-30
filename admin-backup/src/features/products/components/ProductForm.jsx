import React, { useEffect, useState } from 'react'
import Form from '../../../shared/components/ui/Form'
import { CategoryTreeMultiSelect } from './CategoryTreeMultiSelect'
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
  categoryTree = [],
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


  return (
    <form id={formId} onSubmit={handleSubmit} className="product-form">
      {/* Basic Information Section */}
      <div className="mb-6">
        <h6 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <i className="fas fa-info-circle mr-2 text-blue-600"></i>
          Basic Information
        </h6>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Form.Group>
            <Form.Label>
              <i className="fas fa-barcode mr-2 text-blue-600"></i>
              SKU *
            </Form.Label>
            <Form.Control
              type="text"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              placeholder="Enter product SKU (e.g., PROD-001)"
              disabled={submitting}
              required
              className={getError(errors, 'sku') ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
            />
            {getError(errors, 'sku') && (
              <Form.ErrorText>
                <i className="fas fa-exclamation-triangle mr-1"></i>
                {getError(errors, 'sku')}
              </Form.ErrorText>
            )}
            <Form.HelpText>
              <i className="fas fa-lightbulb mr-1"></i>
              Stock Keeping Unit - unique identifier for inventory tracking
            </Form.HelpText>
          </Form.Group>
          <Form.Group>
            <Form.Label>
              <i className="fas fa-tag mr-2 text-blue-600"></i>
              Product Name *
            </Form.Label>
            <Form.Control
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter product name"
              disabled={submitting}
              required
              className={getError(errors, 'name') ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
            />
            {getError(errors, 'name') && (
              <Form.ErrorText>
                <i className="fas fa-exclamation-triangle mr-1"></i>
                {getError(errors, 'name')}
              </Form.ErrorText>
            )}
          </Form.Group>
        </div>

        <Form.Group>
          <Form.Label>
            <i className="fas fa-align-left mr-2 text-blue-600"></i>
            Description
          </Form.Label>
          <Form.Textarea
            rows="3"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter product description..."
            disabled={submitting}
            className={getError(errors, 'description') ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
          />
          {getError(errors, 'description') && (
            <Form.ErrorText>
              <i className="fas fa-exclamation-triangle mr-1"></i>
              {getError(errors, 'description')}
            </Form.ErrorText>
          )}
        </Form.Group>
      </div>

      {/* Pricing & Status Section */}
      <div className="mb-6">
        <h6 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <i className="fas fa-dollar-sign mr-2 text-blue-600"></i>
          Pricing & Status
        </h6>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Form.Group>
            <Form.Label>
              <i className="fas fa-money-bill-wave mr-2 text-blue-600"></i>
              Price *
            </Form.Label>
            <Form.Control
              type="number"
              step="0.01"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
              disabled={submitting}
              required
              className={getError(errors, 'price') ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
            />
            {getError(errors, 'price') && (
              <Form.ErrorText>
                <i className="fas fa-exclamation-triangle mr-1"></i>
                {getError(errors, 'price')}
              </Form.ErrorText>
            )}
          </Form.Group>
          <Form.Group>
            <Form.Label>
              <i className="fas fa-globe mr-2 text-blue-600"></i>
              Currency
            </Form.Label>
            <Form.Select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              disabled={submitting}
              className={getError(errors, 'currency') ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
            >
              <option value="USD">USD - US Dollar</option>
              <option value="EUR">EUR - Euro</option>
              <option value="GBP">GBP - British Pound</option>
            </Form.Select>
            {getError(errors, 'currency') && (
              <Form.ErrorText>
                <i className="fas fa-exclamation-triangle mr-1"></i>
                {getError(errors, 'currency')}
              </Form.ErrorText>
            )}
          </Form.Group>
          <Form.Group>
            <Form.Label>
              <i className="fas fa-toggle-on mr-2 text-blue-600"></i>
              Status
            </Form.Label>
            <Form.Select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              disabled={submitting}
              className={getError(errors, 'status') ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
            >
              {STATUSES.map((statusOption) => (
                <option key={statusOption.value} value={statusOption.value}>
                  {statusOption.label}
                </option>
              ))}
            </Form.Select>
            {getError(errors, 'status') && (
              <Form.ErrorText>
                <i className="fas fa-exclamation-triangle mr-1"></i>
                {getError(errors, 'status')}
              </Form.ErrorText>
            )}
          </Form.Group>
        </div>
      </div>

      {/* Product Type Section */}
      <div className="mb-6">
        <h6 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <i className="fas fa-cogs mr-2 text-blue-600"></i>
          Product Configuration
        </h6>
        <Form.Group>
          <Form.Label>
            <i className="fas fa-layer-group mr-2 text-blue-600"></i>
            Product Type
          </Form.Label>
          <Form.Select
            value={type}
            onChange={(e) => setType(e.target.value)}
            disabled={submitting}
            className={getError(errors, 'type') ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
          >
            {PRODUCT_TYPES.map((typeOption) => (
              <option key={typeOption.value} value={typeOption.value}>
                {typeOption.label}
              </option>
            ))}
          </Form.Select>
          {getError(errors, 'type') && (
            <Form.ErrorText>
              <i className="fas fa-exclamation-triangle mr-1"></i>
              {getError(errors, 'type')}
            </Form.ErrorText>
          )}
          <Form.HelpText>
            <i className="fas fa-info-circle mr-1"></i>
            Simple: Single product variant. Variable: Multiple variants (size, color, etc.)
          </Form.HelpText>
        </Form.Group>
      </div>

      {/* Categories Section */}
      <div className="mb-6">
        <h6 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <i className="fas fa-tags mr-2 text-blue-600"></i>
          Categories
        </h6>
        <Form.Group>
          <Form.Label>
            <i className="fas fa-folder mr-2 text-blue-600"></i>
            Assign Categories
          </Form.Label>
          {categoriesLoading ? (
            <div className="flex items-center text-gray-500 py-4">
              <i className="fas fa-spinner fa-spin mr-2"></i>
              Loading categories...
            </div>
          ) : (
            <div className="category-tree-multiselect">
              <CategoryTreeMultiSelect
                categories={categoryOptions}
                tree={categoryTree}
                value={categories}
                onChange={setCategories}
                disabled={submitting}
                error={getError(errors, 'categoryIds')}
                placeholder="Select categories for this product..."
              />
            </div>
          )}
          <Form.HelpText>
            <i className="fas fa-lightbulb mr-1"></i>
            Select categories to help customers find your products. You can search and select multiple categories from the tree structure.
          </Form.HelpText>
        </Form.Group>
      </div>

      {/* Product Attributes Section */}
      <div className="mb-6">
        <h6 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <i className="fas fa-tags mr-2 text-blue-600"></i>
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