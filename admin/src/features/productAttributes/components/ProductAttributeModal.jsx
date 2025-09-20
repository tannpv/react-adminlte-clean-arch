import React, { useEffect, useMemo, useState } from 'react'

const INPUT_TYPES = [
  { value: 'select', label: 'Select' },
  { value: 'text', label: 'Text' },
]

const getError = (errors, key) => {
  const raw = errors?.[key]
  if (!raw) return null
  return typeof raw === 'string' ? raw : raw?.message || 'Invalid'
}

export function ProductAttributeModal({
  show,
  title,
  initialAttribute,
  errors = {},
  submitting = false,
  onClose,
  onSubmit,
}) {
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [inputType, setInputType] = useState('select')

  useEffect(() => {
    if (!show) return
    if (!initialAttribute) {
      setName('')
      setSlug('')
      setDescription('')
      setInputType('select')
      return
    }
    setName(initialAttribute.name || '')
    setSlug(initialAttribute.slug || '')
    setDescription(initialAttribute.description || '')
    setInputType(initialAttribute.inputType || 'select')
  }, [initialAttribute, show])

  const normalizedErrors = useMemo(() => ({
    name: getError(errors, 'name'),
    slug: getError(errors, 'slug'),
    description: getError(errors, 'description'),
    inputType: getError(errors, 'inputType'),
  }), [errors])

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({
      name: name.trim(),
      slug: slug.trim(),
      description: description.trim() || null,
      inputType,
    })
  }

  return (
    <>
      <div className={`modal fade ${show ? 'show' : ''}`} style={{ display: show ? 'block' : 'none' }} tabIndex="-1" role="dialog" aria-modal={show ? 'true' : undefined}>
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{title}</h5>
              <button type="button" className="close" aria-label="Close" onClick={onClose}>
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <form onSubmit={handleSubmit} noValidate>
              <div className="modal-body">
                <div className="form-group">
                  <label>Name</label>
                  <input
                    className={`form-control ${normalizedErrors.name ? 'is-invalid' : ''}`}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={submitting}
                    required
                  />
                  {normalizedErrors.name && <div className="invalid-feedback">{normalizedErrors.name}</div>}
                </div>
                <div className="form-group">
                  <label>Slug</label>
                  <input
                    className={`form-control ${normalizedErrors.slug ? 'is-invalid' : ''}`}
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    disabled={submitting}
                    required
                  />
                  {normalizedErrors.slug && <div className="invalid-feedback">{normalizedErrors.slug}</div>}
                  <small className="form-text text-muted">Lowercase unique identifier (e.g. "color").</small>
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    className={`form-control ${normalizedErrors.description ? 'is-invalid' : ''}`}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                    disabled={submitting}
                  />
                  {normalizedErrors.description && <div className="invalid-feedback">{normalizedErrors.description}</div>}
                </div>
                <div className="form-group">
                  <label>Input Type</label>
                  <select
                    className={`form-control ${normalizedErrors.inputType ? 'is-invalid' : ''}`}
                    value={inputType}
                    onChange={(e) => setInputType(e.target.value)}
                    disabled={submitting}
                  >
                    {INPUT_TYPES.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                  {normalizedErrors.inputType && <div className="invalid-feedback">{normalizedErrors.inputType}</div>}
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Saving…' : 'Save Attribute'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      {show && <div className="modal-backdrop fade show" />}
    </>
  )
}
