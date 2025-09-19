import React, { useEffect, useMemo, useState } from 'react'

const STATUSES = [
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'archived', label: 'Archived' },
]

const getError = (errors, key) => {
  const raw = errors?.[key]
  if (!raw) return null
  return typeof raw === 'string' ? raw : raw?.message || 'Invalid'
}

export function ProductForm({ initialProduct, onSubmit, onCancel, errors = {}, submitting = false, formId = 'product-form' }) {
  const [sku, setSku] = useState('')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [currency, setCurrency] = useState('USD')
  const [status, setStatus] = useState('draft')

  useEffect(() => {
    if (!initialProduct) {
      setSku('')
      setName('')
      setDescription('')
      setPrice('')
      setCurrency('USD')
      setStatus('draft')
      return
    }
    setSku(initialProduct.sku || '')
    setName(initialProduct.name || '')
    setDescription(initialProduct.description || '')
    const priceValue = typeof initialProduct.priceCents === 'number' ? (initialProduct.priceCents / 100).toFixed(2) : ''
    setPrice(priceValue)
    setCurrency(initialProduct.currency || 'USD')
    setStatus(initialProduct.status || 'draft')
  }, [initialProduct])

  const normalizedErrors = useMemo(() => ({
    sku: getError(errors, 'sku'),
    name: getError(errors, 'name'),
    description: getError(errors, 'description'),
    price: getError(errors, 'price'),
    currency: getError(errors, 'currency'),
    status: getError(errors, 'status'),
  }), [errors])

  const handleSubmit = (e) => {
    e.preventDefault()
    const payload = {
      sku: sku.trim(),
      name: name.trim(),
      description: description.trim() || undefined,
      price: Number(price),
      currency: currency.trim().toUpperCase(),
      status,
    }
    if (!payload.description) delete payload.description
    if (!Number.isFinite(payload.price)) delete payload.price
    onSubmit(payload)
  }

  return (
    <form id={formId} onSubmit={handleSubmit} noValidate>
      <div className="form-row">
        <div className="form-group col-md-6">
          <label>SKU</label>
          <input
            className={`form-control ${normalizedErrors.sku ? 'is-invalid' : ''}`}
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            required
          />
          {normalizedErrors.sku && <div className="invalid-feedback">{normalizedErrors.sku}</div>}
        </div>
        <div className="form-group col-md-6">
          <label>Name</label>
          <input
            className={`form-control ${normalizedErrors.name ? 'is-invalid' : ''}`}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          {normalizedErrors.name && <div className="invalid-feedback">{normalizedErrors.name}</div>}
        </div>
      </div>

      <div className="form-group">
        <label>Description</label>
        <textarea
          className={`form-control ${normalizedErrors.description ? 'is-invalid' : ''}`}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />
        {normalizedErrors.description && <div className="invalid-feedback">{normalizedErrors.description}</div>}
      </div>

      <div className="form-row">
        <div className="form-group col-md-4">
          <label>Price</label>
          <input
            type="number"
            step="0.01"
            min="0"
            className={`form-control ${normalizedErrors.price ? 'is-invalid' : ''}`}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
          {normalizedErrors.price && <div className="invalid-feedback">{normalizedErrors.price}</div>}
        </div>
        <div className="form-group col-md-4">
          <label>Currency</label>
          <input
            className={`form-control ${normalizedErrors.currency ? 'is-invalid' : ''}`}
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            required
          />
          {normalizedErrors.currency && <div className="invalid-feedback">{normalizedErrors.currency}</div>}
        </div>
        <div className="form-group col-md-4">
          <label>Status</label>
          <select
            className={`form-control ${normalizedErrors.status ? 'is-invalid' : ''}`}
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
          {normalizedErrors.status && <div className="invalid-feedback">{normalizedErrors.status}</div>}
        </div>
      </div>

      <div className="d-flex justify-content-end">
        <button type="button" className="btn btn-secondary mr-2" onClick={onCancel} disabled={submitting}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Saving...' : (initialProduct?.id ? 'Update' : 'Create')}
        </button>
      </div>
    </form>
  )
}
