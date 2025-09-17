import React, { useEffect, useState } from 'react'

export function UserForm({ onSubmit, initialUser, onCancel, errors = {}, submitting = false, formId = 'user-form', roleOptions = [], rolesLoading = false }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  // store role ids as strings to match <option value> type
  const [roles, setRoles] = useState([])
  // If you want client-side UX, you can reintroduce touched state, but
  // we now rely solely on server validation for messages and borders.

  useEffect(() => {
    setName(initialUser?.name || '')
    setEmail(initialUser?.email || '')
    setRoles(Array.isArray(initialUser?.roles) ? initialUser.roles.map(String) : [])
    // reset any client-only flags if they existed
  }, [initialUser])

  const handleSubmit = (e) => {
    e.preventDefault()
    const roleIds = roles.map((v) => Number(v)).filter((n) => !Number.isNaN(n))
    onSubmit({ name: name.trim(), email: email.trim(), roles: roleIds })
  }

  const isEditing = !!initialUser?.id

  const nameError = typeof errors.name === 'string' ? errors.name : errors.name?.message
  const emailError = typeof errors.email === 'string' ? errors.email : errors.email?.message

  // Server-driven validation only
  const showNameInvalid = !!nameError
  const showEmailInvalid = !!emailError
  const nameInvalidMsg = nameError || null
  const emailInvalidMsg = emailError || null
  const rolesError = typeof errors.roles === 'string' ? errors.roles : errors.roles?.message

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
      <div className="form-group">
        <label>Roles</label>
        <select
          multiple
          className={`form-control ${rolesError ? 'is-invalid' : ''}`}
          value={roles}
          size={Math.min(8, Math.max(3, roleOptions.length || 3))}
          disabled={rolesLoading}
          onChange={(e) => {
            const values = Array.from(e.target.selectedOptions).map(o => o.value)
            setRoles(values)
          }}
        >
          {roleOptions.map(r => (
            <option key={r.id} value={String(r.id)}>{r.name}</option>
          ))}
        </select>
        {rolesLoading && (
          <small className="form-text text-muted">
            <span className="spinner-border spinner-border-sm mr-1" role="status" aria-hidden="true"></span>
            Loading roles...
          </small>
        )}
        {!rolesLoading && !roleOptions.length && (
          <small className="form-text text-muted">No roles available or not authorized to view roles.</small>
        )}
        {rolesError && <div className="invalid-feedback">{rolesError}</div>}
      </div>
    </form>
  )
}
