import React, { useEffect, useState } from 'react'

export function CategoryForm({ initialCategory, onSubmit, onCancel, errors = {}, submitting = false, formId = 'category-form' }) {
  const [name, setName] = useState('')

  useEffect(() => {
    setName(initialCategory?.name || '')
  }, [initialCategory])

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({ name: name.trim() })
  }

  const nameError = typeof errors.name === 'string' ? errors.name : errors.name?.message

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
