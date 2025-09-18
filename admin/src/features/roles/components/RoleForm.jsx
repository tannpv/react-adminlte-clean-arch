import React, { useEffect, useState } from 'react'

export function RoleForm({ onSubmit, initialRole, onCancel, errors = {}, submitting = false, formId = 'role-form' }) {
  const [name, setName] = useState('')

  useEffect(() => {
    setName(initialRole?.name || '')
  }, [initialRole])

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({ name: name.trim() })
  }

  const nameError = typeof errors.name === 'string' ? errors.name : errors.name?.message
  const showNameInvalid = !!nameError

  return (
    <form id={formId} onSubmit={handleSubmit} noValidate className="mb-3">
      <div className="form-group">
        <label>Name</label>
        <input
          className={`form-control ${showNameInvalid ? 'is-invalid' : ''}`}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        {showNameInvalid && <div className="invalid-feedback">{nameError}</div>}
      </div>
    </form>
  )
}

