import React, { useEffect, useState } from 'react'
import { useLanguage, useTranslation } from '../../../shared/hooks/useTranslation'
import { CategoryTreeSelector } from './CategoryTreeSelector'
import Form from '../../../shared/components/ui/Form'

export function CategoryForm({ initialCategory, onSubmit, onCancel, errors = {}, submitting = false, formId = 'category-form', categories = [], tree = [], hierarchy = [], isOpen = false }) {
  const { languageCode } = useLanguage()
  const { t } = useTranslation(languageCode, 'categories')
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
          {t('category_information', 'Category Information')}
        </h6>
        <Form.Group>
          <Form.Label htmlFor="categoryName">
            <i className="fas fa-signature mr-2"></i>
            {t('category_name', 'Category Name')}
          </Form.Label>
          <Form.Control
            id="categoryName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('enter_category_name', 'Enter category name (e.g., Electronics, Clothing)')}
            required
            disabled={submitting}
            className={nameError ? 'border-red-500' : ''}
          />
          {nameError && (
            <Form.ErrorText>
              <i className="fas fa-exclamation-triangle mr-1"></i>
              {nameError}
            </Form.ErrorText>
          )}
          <Form.HelpText>
            <i className="fas fa-lightbulb mr-1"></i>
            {t('category_name_help', 'Choose a clear, descriptive name that helps customers find products.')}
          </Form.HelpText>
        </Form.Group>
      </div>

      {/* Hierarchy Section */}
      <div>
        <h6 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <i className="fas fa-sitemap mr-2 text-blue-600"></i>
          {t('category_hierarchy', 'Category Hierarchy')}
        </h6>
        <Form.Group>
          <Form.Label>
            <i className="fas fa-folder mr-2"></i>
            {t('parent_category', 'Parent Category')}
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
            <Form.ErrorText>
              <i className="fas fa-exclamation-triangle mr-1"></i>
              {parentError}
            </Form.ErrorText>
          )}
          <Form.HelpText>
            <i className="fas fa-info-circle mr-1"></i>
            {t('parent_category_help', 'Leave empty to create a root category, or select a parent to create a subcategory.')}
          </Form.HelpText>
        </Form.Group>
      </div>
    </form>
  )
}