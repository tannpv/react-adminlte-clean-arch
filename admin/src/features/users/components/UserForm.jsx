import React, { useEffect, useState } from 'react'

const buildInitialProfile = (user) => {
  if (!user || !user.profile) {
    return { firstName: '', lastName: '', dateOfBirth: '', pictureUrl: '' }
  }
  return {
    firstName: user.profile.firstName || '',
    lastName: user.profile.lastName || '',
    dateOfBirth: user.profile.dateOfBirth || '',
    pictureUrl: user.profile.pictureUrl || '',
  }
}

export function UserForm({ onSubmit, initialUser, onCancel, errors = {}, submitting = false, formId = 'user-form', roleOptions = [], rolesLoading = false }) {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [pictureUrl, setPictureUrl] = useState('')
  const [roles, setRoles] = useState([])
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [localPasswordError, setLocalPasswordError] = useState(null)

  useEffect(() => {
    const profile = buildInitialProfile(initialUser)
    setFirstName(profile.firstName)
    setLastName(profile.lastName)
    setEmail(initialUser?.email || '')
    setDateOfBirth(profile.dateOfBirth || '')
    setPictureUrl(profile.pictureUrl || '')
    setRoles(Array.isArray(initialUser?.roles) ? initialUser.roles.map(String) : [])
    setPassword('')
    setConfirmPassword('')
    setLocalPasswordError(null)
  }, [initialUser])

  const handleSubmit = (e) => {
    e.preventDefault()
    setLocalPasswordError(null)
    const roleIds = roles.map((v) => Number(v)).filter((n) => !Number.isNaN(n))
    const payload = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      roles: roleIds,
      pictureUrl: pictureUrl.trim() || undefined,
      dateOfBirth: dateOfBirth || undefined,
    }
    const isEditing = !!initialUser?.id
    if (isEditing && (password || confirmPassword)) {
      if (password !== confirmPassword) {
        setLocalPasswordError('Password confirmation does not match')
        return
      }
      if (password.length < 6) {
        setLocalPasswordError('Password must be at least 6 characters')
        return
      }
      payload.password = password
    }
    onSubmit(payload)
  }

  const isEditing = !!initialUser?.id

  const firstNameError = typeof errors.firstName === 'string' ? errors.firstName : errors.firstName?.message
  const lastNameError = typeof errors.lastName === 'string' ? errors.lastName : errors.lastName?.message
  const emailError = typeof errors.email === 'string' ? errors.email : errors.email?.message
  const dobError = typeof errors.dateOfBirth === 'string' ? errors.dateOfBirth : errors.dateOfBirth?.message
  const pictureError = typeof errors.pictureUrl === 'string' ? errors.pictureUrl : errors.pictureUrl?.message
  const rolesError = typeof errors.roles === 'string' ? errors.roles : errors.roles?.message
  const passwordServerError = typeof errors.password === 'string' ? errors.password : errors.password?.message
  const passwordError = localPasswordError || passwordServerError

  return (
    <form id={formId} onSubmit={handleSubmit} noValidate className="mb-3">
      <div className="form-row">
        <div className="form-group col-md-6">
          <label>First Name</label>
          <input
            className={`form-control ${firstNameError ? 'is-invalid' : ''}`}
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
          {firstNameError && <div className="invalid-feedback">{firstNameError}</div>}
        </div>
        <div className="form-group col-md-6">
          <label>Last Name</label>
          <input
            className={`form-control ${lastNameError ? 'is-invalid' : ''}`}
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
          {lastNameError && <div className="invalid-feedback">{lastNameError}</div>}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group col-md-6">
          <label>Email</label>
          <input
            type="email"
            className={`form-control ${emailError ? 'is-invalid' : ''}`}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          {emailError && <div className="invalid-feedback">{emailError}</div>}
        </div>
        <div className="form-group col-md-6">
          <label>Date of Birth</label>
          <input
            type="date"
            className={`form-control ${dobError ? 'is-invalid' : ''}`}
            value={dateOfBirth || ''}
            onChange={(e) => setDateOfBirth(e.target.value)}
          />
          {dobError && <div className="invalid-feedback">{dobError}</div>}
        </div>
      </div>

      <div className="form-group">
        <label>Picture URL</label>
        <input
          className={`form-control ${pictureError ? 'is-invalid' : ''}`}
          value={pictureUrl}
          onChange={(e) => setPictureUrl(e.target.value)}
          placeholder="https://example.com/avatar.jpg"
        />
        {pictureError && <div className="invalid-feedback">{pictureError}</div>}
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

      {isEditing && (
        <div className="form-row">
          <div className="form-group col-md-6">
            <label>New Password</label>
            <input
              type="password"
              className={`form-control ${passwordError ? 'is-invalid' : ''}`}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                if (localPasswordError) setLocalPasswordError(null)
              }}
              placeholder="Leave blank to keep current password"
              disabled={submitting}
            />
            {passwordError && <div className="invalid-feedback">{passwordError}</div>}
          </div>
          <div className="form-group col-md-6">
            <label>Confirm Password</label>
            <input
              type="password"
              className={`form-control ${passwordError ? 'is-invalid' : ''}`}
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value)
                if (localPasswordError) setLocalPasswordError(null)
              }}
              placeholder="Re-enter new password"
              disabled={submitting}
            />
          </div>
        </div>
      )}
    </form>
  )
}
