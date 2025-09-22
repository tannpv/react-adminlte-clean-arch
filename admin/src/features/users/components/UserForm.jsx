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
  const [pictureData, setPictureData] = useState('')
  const [picturePreview, setPicturePreview] = useState('')
  const [pictureLoading, setPictureLoading] = useState(false)
  const [pictureLocalError, setPictureLocalError] = useState(null)
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
    setPictureData(profile.pictureUrl || '')
    setPicturePreview(profile.pictureUrl || '')
    setPictureLocalError(null)
    setRoles(Array.isArray(initialUser?.roles) ? initialUser.roles.map(String) : [])
    setPassword('')
    setConfirmPassword('')
    setLocalPasswordError(null)
  }, [initialUser])

  const handleSubmit = (e) => {
    e.preventDefault()
    setLocalPasswordError(null)
    const roleIds = roles.map((v) => Number(v)).filter((n) => !Number.isNaN(n))
    if (pictureLoading) return

    const payload = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      roles: roleIds,
      pictureUrl: pictureData || undefined,
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
  const pictureError = pictureLocalError || (typeof errors.pictureUrl === 'string' ? errors.pictureUrl : errors.pictureUrl?.message)
  const rolesError = typeof errors.roles === 'string' ? errors.roles : errors.roles?.message
  const passwordServerError = typeof errors.password === 'string' ? errors.password : errors.password?.message
  const passwordError = localPasswordError || passwordServerError

  return (
    <form id={formId} onSubmit={handleSubmit} noValidate className="user-form">
      {/* Basic Information Section */}
      <div className="form-section mb-4">
        <h6 className="section-title">
          <i className="fas fa-user mr-2"></i>
          Basic Information
        </h6>
        <div className="form-row">
          <div className="form-group col-md-6">
            <label className="form-label">
              <i className="fas fa-signature mr-2"></i>
              First Name
            </label>
            <input
              className={`form-control ${firstNameError ? 'is-invalid' : ''}`}
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Enter first name"
              required
              disabled={submitting}
            />
            {firstNameError && <div className="invalid-feedback">{firstNameError}</div>}
          </div>
          <div className="form-group col-md-6">
            <label className="form-label">
              <i className="fas fa-signature mr-2"></i>
              Last Name
            </label>
            <input
              className={`form-control ${lastNameError ? 'is-invalid' : ''}`}
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Enter last name"
              required
              disabled={submitting}
            />
            {lastNameError && <div className="invalid-feedback">{lastNameError}</div>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group col-md-6">
            <label className="form-label">
              <i className="fas fa-envelope mr-2"></i>
              Email Address
            </label>
            <input
              type="email"
              className={`form-control ${emailError ? 'is-invalid' : ''}`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email address"
              required
              disabled={submitting}
            />
            {emailError && <div className="invalid-feedback">{emailError}</div>}
          </div>
          <div className="form-group col-md-6">
            <label className="form-label">
              <i className="fas fa-birthday-cake mr-2"></i>
              Date of Birth
            </label>
            <input
              type="date"
              className={`form-control ${dobError ? 'is-invalid' : ''}`}
              value={dateOfBirth || ''}
              onChange={(e) => setDateOfBirth(e.target.value)}
              disabled={submitting}
            />
            {dobError && <div className="invalid-feedback">{dobError}</div>}
          </div>
        </div>
      </div>

      {/* Profile Picture Section */}
      <div className="form-section mb-4">
        <h6 className="section-title">
          <i className="fas fa-image mr-2"></i>
          Profile Picture
        </h6>
        <div className="form-group">
          <div className="picture-upload-container">
            <div className="picture-preview">
              {picturePreview ? (
                <img
                  src={picturePreview}
                  alt="Profile preview"
                  className="preview-image"
                />
              ) : (
                <div className="preview-placeholder">
                  <i className="fas fa-user"></i>
                  <span>No Image</span>
                </div>
              )}
            </div>
            <div className="picture-controls">
              <div className="file-input-wrapper">
                <input
                  type="file"
                  accept="image/*"
                  className={`form-control-file ${pictureError ? 'is-invalid' : ''}`}
                  onChange={async (e) => {
                    const file = e.target.files?.[0]
                    if (!file) {
                      setPictureData('')
                      setPicturePreview('')
                      setPictureLocalError(null)
                      return
                    }
                    if (!file.type.startsWith('image/')) {
                      setPictureLocalError('Please select an image file')
                      return
                    }
                    if (file.size > 5 * 1024 * 1024) {
                      setPictureLocalError('Image must be 5MB or smaller')
                      return
                    }
                    setPictureLocalError(null)
                    setPictureLoading(true)
                    try {
                      const reader = new FileReader()
                      reader.onload = () => {
                        const result = reader.result
                        if (typeof result === 'string') {
                          setPictureData(result)
                          setPicturePreview(result)
                        }
                        setPictureLoading(false)
                      }
                      reader.onerror = () => {
                        setPictureLocalError('Failed to read image file')
                        setPictureLoading(false)
                      }
                      reader.readAsDataURL(file)
                    } catch (err) {
                      console.error(err)
                      setPictureLocalError('Failed to process image')
                      setPictureLoading(false)
                    }
                  }}
                  disabled={submitting}
                />
                <label className="file-input-label">
                  <i className="fas fa-upload mr-2"></i>
                  Choose Image
                </label>
              </div>
              <div className="picture-actions">
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => {
                    setPictureData('')
                    setPicturePreview('')
                    setPictureLocalError(null)
                  }}
                  disabled={submitting || (!pictureData && !picturePreview)}
                >
                  <i className="fas fa-trash mr-1"></i>
                  Remove
                </button>
                {pictureLoading && (
                  <span className="upload-status">
                    <i className="fas fa-spinner fa-spin mr-1"></i>
                    Uploading...
                  </span>
                )}
              </div>
              {pictureError && (
                <div className="invalid-feedback d-block">
                  <i className="fas fa-exclamation-triangle mr-1"></i>
                  {pictureError}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Roles Section */}
      <div className="form-section mb-4">
        <h6 className="section-title">
          <i className="fas fa-shield-alt mr-2"></i>
          Roles & Permissions
        </h6>
        <div className="form-group">
          <label className="form-label">
            <i className="fas fa-user-tag mr-2"></i>
            Assign Roles
          </label>
          <div className="roles-select-container">
            <select
              multiple
              className={`form-control roles-select ${rolesError ? 'is-invalid' : ''}`}
              value={roles}
              size={Math.min(8, Math.max(3, roleOptions.length || 3))}
              disabled={rolesLoading || submitting}
              onChange={(e) => {
                const values = Array.from(e.target.selectedOptions).map(o => o.value)
                setRoles(values)
              }}
            >
              {roleOptions.map(r => (
                <option key={r.id} value={String(r.id)}>{r.name}</option>
              ))}
            </select>
            <div className="roles-info">
              {rolesLoading && (
                <div className="loading-indicator">
                  <i className="fas fa-spinner fa-spin mr-1"></i>
                  Loading roles...
                </div>
              )}
              {!rolesLoading && !roleOptions.length && (
                <div className="no-roles-warning">
                  <i className="fas fa-exclamation-triangle mr-1"></i>
                  No roles available or not authorized to view roles.
                </div>
              )}
              {!rolesLoading && roleOptions.length > 0 && (
                <div className="roles-help">
                  <i className="fas fa-info-circle mr-1"></i>
                  Hold Ctrl/Cmd to select multiple roles
                </div>
              )}
            </div>
          </div>
          {rolesError && <div className="invalid-feedback">{rolesError}</div>}
        </div>
      </div>

      {/* Password Section (only for editing) */}
      {isEditing && (
        <div className="form-section">
          <h6 className="section-title">
            <i className="fas fa-lock mr-2"></i>
            Change Password
          </h6>
          <div className="form-row">
            <div className="form-group col-md-6">
              <label className="form-label">
                <i className="fas fa-key mr-2"></i>
                New Password
              </label>
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
              <label className="form-label">
                <i className="fas fa-key mr-2"></i>
                Confirm Password
              </label>
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
        </div>
      )}
    </form>
  )
}