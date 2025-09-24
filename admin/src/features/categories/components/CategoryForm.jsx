import React, { useEffect, useState } from 'react'
import { useLanguage, useTranslation } from '../../../shared/hooks/useTranslation'
import { CategoryTreeSelector } from './CategoryTreeSelector'

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
    <form id={formId} onSubmit={handleSubmit} noValidate className="category-form">
      {/* Basic Information Section */}
      <div className="form-section mb-4">
        <h6 className="section-title">
          <i className="fas fa-tag mr-2"></i>
          {t('category_information', 'Category Information')}
        </h6>
        <div className="form-group">
          <label className="form-label">
            <i className="fas fa-signature mr-2"></i>
            {t('category_name', 'Category Name')}
          </label>
          <input
            className={`form-control ${nameError ? 'is-invalid' : ''}`}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('enter_category_name', 'Enter category name (e.g., Electronics, Clothing)')}
            required
            disabled={submitting}
          />
          {nameError && (
            <div className="invalid-feedback">
              <i className="fas fa-exclamation-triangle mr-1"></i>
              {nameError}
            </div>
          )}
          <small className="form-text text-muted">
            <i className="fas fa-lightbulb mr-1"></i>
            {t('category_name_help', 'Choose a clear, descriptive name that helps customers find products.')}
          </small>
        </div>
      </div>

      {/* Hierarchy Section */}
      <div className="form-section mb-4">
        <h6 className="section-title">
          <i className="fas fa-sitemap mr-2"></i>
          {t('category_hierarchy', 'Category Hierarchy')}
        </h6>
        <div className="form-group">
          <label className="form-label">
            <i className="fas fa-folder mr-2"></i>
            {t('parent_category', 'Parent Category')}
          </label>
          <div className="tree-selector-container">
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
            <div className="invalid-feedback d-block">
              <i className="fas fa-exclamation-triangle mr-1"></i>
              {parentError}
            </div>
          )}
          <small className="form-text text-muted">
            <i className="fas fa-info-circle mr-1"></i>
            {t('parent_category_help', 'Leave empty to create a root category, or select a parent to create a subcategory.')}
          </small>
        </div>
      </div>

      {/* Form Actions */}
      <div className="form-actions">
        <div className="d-flex justify-content-end gap-3">
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={onCancel}
            disabled={submitting}
          >
            <i className="fas fa-times mr-2"></i>
            {t('cancel', 'Cancel')}
          </button>
          <button
            type="submit"
            className={`btn ${initialCategory?.id ? 'btn-warning' : 'btn-success'}`}
            disabled={submitting}
          >
            {submitting ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                {initialCategory?.id ? t('updating', 'Updating...') : t('creating', 'Creating...')}
              </>
            ) : (
              <>
                <i className={`fas ${initialCategory?.id ? 'fa-save' : 'fa-plus'} mr-2`}></i>
                {initialCategory?.id ? t('update_category', 'Update Category') : t('create_category', 'Create Category')}
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  )
}