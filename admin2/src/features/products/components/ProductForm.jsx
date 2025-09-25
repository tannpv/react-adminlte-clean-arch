import React, { useEffect, useState } from 'react'
import Form from '../../../shared/components/ui/Form'
import Tabs from '../../../shared/components/ui/Tabs'
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
    } else {
      setSku(initialProduct.sku || '')
      setName(initialProduct.name || '')
      setDescription(initialProduct.description || '')
      setPrice(typeof initialProduct.price === 'number' ? String(initialProduct.price) : '')
      setCurrency(initialProduct.currency || 'USD')
      setStatus(initialProduct.status || 'draft')
      setCategories(Array.isArray(initialProduct.categoryIds) ? initialProduct.categoryIds.map(String) : [])
      setType(initialProduct.type || 'simple')
    }
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
      <Tabs defaultTab={0} className="mb-6">
        {/* Basic Information Tab */}
        <Tabs.Tab
          label="Basic Information"
          icon="fas fa-info-circle"
          hasError={getError(errors, 'sku') || getError(errors, 'name') || getError(errors, 'description')}
        >
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  <Form.Error>
                    <i className="fas fa-exclamation-triangle mr-1"></i>
                    {getError(errors, 'sku')}
                  </Form.Error>
                )}
                <Form.Help>
                  <i className="fas fa-lightbulb mr-1"></i>
                  Stock Keeping Unit - unique identifier for inventory tracking
                </Form.Help>
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
                  <Form.Error>
                    <i className="fas fa-exclamation-triangle mr-1"></i>
                    {getError(errors, 'name')}
                  </Form.Error>
                )}
              </Form.Group>
            </div>

            <Form.Group>
              <Form.Label>
                <i className="fas fa-align-left mr-2 text-blue-600"></i>
                Description
              </Form.Label>
              <Form.Textarea
                rows="4"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter detailed product description..."
                disabled={submitting}
                className={getError(errors, 'description') ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
              />
              {getError(errors, 'description') && (
                <Form.Error>
                  <i className="fas fa-exclamation-triangle mr-1"></i>
                  {getError(errors, 'description')}
                </Form.Error>
              )}
              <Form.Help>
                <i className="fas fa-lightbulb mr-1"></i>
                Provide a detailed description to help customers understand your product
              </Form.Help>
            </Form.Group>
          </div>
        </Tabs.Tab>

        {/* Pricing & Configuration Tab */}
        <Tabs.Tab
          label="Pricing & Configuration"
          icon="fas fa-dollar-sign"
          hasError={getError(errors, 'price') || getError(errors, 'currency') || getError(errors, 'status') || getError(errors, 'type')}
        >
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Form.Group>
                <Form.Label>
                  <i className="fas fa-money-bill-wave mr-2 text-green-600"></i>
                  Price *
                </Form.Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <Form.Control
                    type="number"
                    step="0.01"
                    min="0"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0.00"
                    disabled={submitting}
                    required
                    className={`pl-8 ${getError(errors, 'price') ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`}
                  />
                </div>
                {getError(errors, 'price') && (
                  <Form.Error>
                    <i className="fas fa-exclamation-triangle mr-1"></i>
                    {getError(errors, 'price')}
                  </Form.Error>
                )}
                <Form.Help>
                  <i className="fas fa-lightbulb mr-1"></i>
                  Enter the selling price for this product
                </Form.Help>
              </Form.Group>

              <Form.Group>
                <Form.Label>
                  <i className="fas fa-globe mr-2 text-green-600"></i>
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
                  <Form.Error>
                    <i className="fas fa-exclamation-triangle mr-1"></i>
                    {getError(errors, 'currency')}
                  </Form.Error>
                )}
              </Form.Group>

              <Form.Group>
                <Form.Label>
                  <i className="fas fa-toggle-on mr-2 text-green-600"></i>
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
                  <Form.Error>
                    <i className="fas fa-exclamation-triangle mr-1"></i>
                    {getError(errors, 'status')}
                  </Form.Error>
                )}
                <Form.Help>
                  <i className="fas fa-lightbulb mr-1"></i>
                  Draft: Not visible to customers. Published: Live on store. Archived: Hidden.
                </Form.Help>
              </Form.Group>
            </div>

            <Form.Group>
              <Form.Label>
                <i className="fas fa-layer-group mr-2 text-purple-600"></i>
                Product Type
              </Form.Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {PRODUCT_TYPES.map((typeOption) => (
                  <div key={typeOption.value} className="relative">
                    <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${type === typeOption.value
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                      }`}>
                      <input
                        type="radio"
                        name="productType"
                        value={typeOption.value}
                        checked={type === typeOption.value}
                        onChange={(e) => setType(e.target.value)}
                        disabled={submitting}
                        className="sr-only"
                      />
                      <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${type === typeOption.value
                        ? 'border-purple-500 bg-purple-500'
                        : 'border-gray-300'
                        }`}>
                        {type === typeOption.value && (
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{typeOption.label}</div>
                        <div className="text-sm text-gray-600">
                          {typeOption.value === 'simple'
                            ? 'Single product variant with fixed attributes'
                            : 'Multiple variants with different attributes (size, color, etc.)'
                          }
                        </div>
                      </div>
                    </label>
                  </div>
                ))}
              </div>
              {getError(errors, 'type') && (
                <Form.Error>
                  <i className="fas fa-exclamation-triangle mr-1"></i>
                  {getError(errors, 'type')}
                </Form.Error>
              )}
              <Form.Help>
                <i className="fas fa-info-circle mr-1"></i>
                Choose the product type that best fits your product structure
              </Form.Help>
            </Form.Group>
          </div>
        </Tabs.Tab>

        {/* Categories Tab */}
        <Tabs.Tab
          label="Categories"
          icon="fas fa-tags"
          badge={categories.length > 0 ? categories.length : null}
          hasError={getError(errors, 'categoryIds')}
        >
          <div className="space-y-6">
            <Form.Group>
              <Form.Label>
                <i className="fas fa-folder mr-2 text-orange-600"></i>
                Assign Categories
              </Form.Label>
              {categoriesLoading ? (
                <div className="flex items-center justify-center text-gray-500 py-8 bg-gray-50 rounded-lg">
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
              {getError(errors, 'categoryIds') && (
                <Form.Error>
                  <i className="fas fa-exclamation-triangle mr-1"></i>
                  {getError(errors, 'categoryIds')}
                </Form.Error>
              )}
              <Form.Help>
                <i className="fas fa-lightbulb mr-1"></i>
                Select categories to help customers find your products. You can search and select multiple categories from the tree structure.
              </Form.Help>
            </Form.Group>
          </div>
        </Tabs.Tab>

        {/* Attributes Tab */}
        <Tabs.Tab
          label="Attributes"
          icon="fas fa-sliders-h"
          badge={Object.keys(attributeValues).length > 0 ? Object.keys(attributeValues).length : null}
          hasError={Object.keys(errors).some(key => key.startsWith('attribute_'))}
        >
          <div className="space-y-6">
            <ProductAttributeForm
              productId={initialProduct?.id}
              onAttributeChange={setAttributeValues}
              initialValues={attributeValues}
              errors={errors}
              disabled={submitting}
            />
          </div>
        </Tabs.Tab>
      </Tabs>
    </form>
  )
}