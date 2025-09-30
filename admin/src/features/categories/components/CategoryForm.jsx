import React, { useEffect, useState } from 'react'
import Form from '../../../shared/components/ui/Form'
import { CategoryTreeSelector } from './CategoryTreeSelector'

export function CategoryForm({ initialCategory, onSubmit, onCancel, errors = {}, submitting = false, formId = 'category-form', categories = [], tree = [], hierarchy = [], isOpen = false }) {
  const [name, setName] = useState('')
  const [parentId, setParentId] = useState('')

  useEffect(() => {
    if (!isOpen) return
    setName(initialCategory?.name || '')
    setParentId(initialCategory?.parentId != null ? String(initialCategory.parentId) : '')
  }, [initialCategory, isOpen])

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({
      name: name.trim(),
      parentId: parentId ? Number(parentId) : null,
    })
  }

  const nameError = typeof errors.name === 'string' ? errors.name : errors.name?.message
  const parentError = typeof errors.parentId === 'string' ? errors.parentId : errors.parentId?.message

  return (
    <form id={formId} onSubmit={handleSubmit} noValidate className="space-y-6">
      {/* Basic Information Section */}
      <div>
        <h6 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <i className="fas fa-tag mr-2 text-blue-600"></i>
          Category Information
        </h6>
        <Form.Group>
          <Form.Label htmlFor="categoryName">
            <i className="fas fa-signature mr-2"></i>
            Category Name
          </Form.Label>
          <Form.Control
            id="categoryName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter category name (e.g., Electronics, Clothing)"
            required
            disabled={submitting}
            className={nameError ? 'border-red-500' : ''}
          />
          {nameError && (
            <Form.Error>
              <i className="fas fa-exclamation-triangle mr-1"></i>
              {nameError}
            </Form.Error>
          )}
          <Form.Help>
            <i className="fas fa-lightbulb mr-1"></i>
            Choose a clear, descriptive name that helps customers find products.
          </Form.Help>
        </Form.Group>
      </div>

      {/* Hierarchy Section */}
      <div>
        <h6 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <i className="fas fa-sitemap mr-2 text-blue-600"></i>
          Category Hierarchy
        </h6>
        <Form.Group>
          <Form.Label>
            <i className="fas fa-folder mr-2"></i>
            Parent Category
          </Form.Label>
          <div className="border border-gray-300 rounded-md">
            <CategoryTreeSelector
              categories={categories}
              tree={tree}
              hierarchy={hierarchy}
              value={parentId}
              onChange={setParentId}
              disabled={submitting}
              error={parentError}
              editingCategoryId={initialCategory?.id}
            />
          </div>
          {parentError && (
            <Form.Error>
              <i className="fas fa-exclamation-triangle mr-1"></i>
              {parentError}
            </Form.Error>
          )}
          <Form.Help>
            <i className="fas fa-info-circle mr-1"></i>
            Leave empty to create a root category, or select a parent to create a subcategory.
          </Form.Help>
        </Form.Group>
      </div>
    </form>
  )
}

export default CategoryForm;