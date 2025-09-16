import React, { useEffect, useState } from 'react'

export function UserForm({ onSubmit, initialUser, onCancel, errors = {}, submitting = false, formId = 'user-form' }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [touchedName, setTouchedName] = useState(false)
  const [touchedEmail, setTouchedEmail] = useState(false)

  useEffect(() => {
    setName(initialUser?.name || '')
    setEmail(initialUser?.email || '')
    setTouchedName(false)
    setTouchedEmail(false)
  }, [initialUser])

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({ name: name.trim(), email: email.trim() })
  }

  const isEditing = !!initialUser?.id

  const nameError = typeof errors.name === 'string' ? errors.name : errors.name?.message
  const emailError = typeof errors.email === 'string' ? errors.email : errors.email?.message

  // Lightweight client validation to drive green/red borders when touched
  const clientNameError = name.trim().length === 0
    ? 'Name is required'
    : (name.trim().length < 2 ? 'Name must be at least 2 characters' : null)
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const clientEmailError = email.trim().length === 0
    ? 'Email is required'
    : (!emailRe.test(email.trim()) ? 'Email is invalid' : null)

  // Show invalid immediately if server error exists; otherwise only after field is touched
  const showNameInvalid = !!(nameError || (touchedName && clientNameError))
  const showEmailInvalid = !!(emailError || (touchedEmail && clientEmailError))
  const nameInvalidMsg = nameError || (touchedName ? clientNameError : null)
  const emailInvalidMsg = emailError || (touchedEmail ? clientEmailError : null)

  // Valid state if touched, has value, and not invalid
  const showNameValid = touchedName && !showNameInvalid && name.trim().length > 0
  const showEmailValid = touchedEmail && !showEmailInvalid && email.trim().length > 0

  return (
    <form id={formId} onSubmit={handleSubmit} noValidate className="mb-3">
      <div className="form-row">
        <div className="form-group col-md-6">
          <label>Name</label>
          <input
            className={`form-control ${showNameInvalid ? 'is-invalid' : showNameValid ? 'is-valid' : ''}`}
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => setTouchedName(true)}
            required
          />
          {showNameInvalid && nameInvalidMsg && <div className="invalid-feedback">{nameInvalidMsg}</div>}
        </div>
        <div className="form-group col-md-6">
          <label>Email</label>
          <input
            type="email"
            className={`form-control ${showEmailInvalid ? 'is-invalid' : showEmailValid ? 'is-valid' : ''}`}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => setTouchedEmail(true)}
            required
          />
          {showEmailInvalid && emailInvalidMsg && <div className="invalid-feedback">{emailInvalidMsg}</div>}
        </div>
      </div>
    </form>
  )
}
