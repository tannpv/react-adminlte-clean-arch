import React, { useEffect, useState } from 'react'
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
    <form id={formId} onSubmit={handleSubmit} noValidate className="mb-3">
      <div className="form-group">
        <label>Name</label>
        <input
          className={`form-control ${nameError ? 'is-invalid' : ''}`}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={submitting}
        />
        {nameError && <div className="invalid-feedback">{nameError}</div>}
      </div>
      <div className="form-group">
        <label>Parent Category</label>
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
      <div className="d-flex justify-content-end">
        <button type="button" className="btn btn-secondary mr-2" onClick={onCancel} disabled={submitting}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Saving…' : (initialCategory?.id ? 'Update' : 'Add')}
        </button>
      </div>
    </form>
  )
}
