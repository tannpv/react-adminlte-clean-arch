import React, { useEffect, useState } from 'react'

export function UserForm({ onSubmit, initialUser, onCancel, errors = {}, submitting = false, formId = 'user-form' }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  // If you want client-side UX, you can reintroduce touched state, but
  // we now rely solely on server validation for messages and borders.

  useEffect(() => {
    setName(initialUser?.name || '')
    setEmail(initialUser?.email || '')
    // reset any client-only flags if they existed
  }, [initialUser])

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({ name: name.trim(), email: email.trim() })
  }

  const isEditing = !!initialUser?.id

  const nameError = typeof errors.name === 'string' ? errors.name : errors.name?.message
  const emailError = typeof errors.email === 'string' ? errors.email : errors.email?.message

  // Server-driven validation only
  const showNameInvalid = !!nameError
  const showEmailInvalid = !!emailError
  const nameInvalidMsg = nameError || null
  const emailInvalidMsg = emailError || null

  return (
    <form id={formId} onSubmit={handleSubmit} noValidate className="mb-3">
      <div className="form-row">
        <div className="form-group col-md-6">
          <label>Name</label>
          <input
            className={`form-control ${showNameInvalid ? 'is-invalid' : ''}`}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          {showNameInvalid && nameInvalidMsg && <div className="invalid-feedback">{nameInvalidMsg}</div>}
        </div>
        <div className="form-group col-md-6">
          <label>Email</label>
          <input
            type="email"
            className={`form-control ${showEmailInvalid ? 'is-invalid' : ''}`}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          {showEmailInvalid && emailInvalidMsg && <div className="invalid-feedback">{emailInvalidMsg}</div>}
        </div>
      </div>
    </form>
  )
}
