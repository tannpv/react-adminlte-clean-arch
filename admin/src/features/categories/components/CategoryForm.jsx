import React, { useEffect, useState } from 'react'

export function CategoryForm({ initialCategory, onSubmit, onCancel, errors = {}, submitting = false, formId = 'category-form', categories = [], hierarchy = [], isOpen = false }) {
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
        <select
          className={`form-control ${parentError ? 'is-invalid' : ''}`}
          value={parentId}
          onChange={(e) => setParentId(e.target.value)}
          disabled={submitting}
        >
          <option value="">None</option>
          {hierarchy.map((option) => (
            <option key={option.id} value={String(option.id)} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
        </select>
        {parentError && <div className="invalid-feedback">{parentError}</div>}
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
