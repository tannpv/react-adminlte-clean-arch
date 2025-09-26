import React, { useState } from 'react'
import { register } from '../api/authApi'

export function RegisterPage({ onRegistered, onSwitchToLogin }) {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [pictureData, setPictureData] = useState('')
  const [picturePreview, setPicturePreview] = useState('')
  const [pictureError, setPictureError] = useState(null)
  const [pictureLoading, setPictureLoading] = useState(false)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setPictureError(null)
    try {
      const { token, user } = await register({
        firstName,
        lastName,
        email,
        password,
        dateOfBirth: dateOfBirth || undefined,
        pictureUrl: pictureData || undefined,
      })
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      onRegistered(user)
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mt-5" style={{ maxWidth: 520 }}>
      <h3 className="mb-4">Create account</h3>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={onSubmit}>
        <div className="form-row">
          <div className="form-group col-md-6">
            <label>First Name</label>
            <input className="form-control" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
          </div>
          <div className="form-group col-md-6">
            <label>Last Name</label>
            <input className="form-control" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
          </div>
        </div>
        <div className="form-group">
          <label>Email</label>
          <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="form-row">
          <div className="form-group col-md-6">
            <label>Date of Birth</label>
            <input type="date" className="form-control" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} />
          </div>
          <div className="form-group col-md-6">
            <label>Profile Picture</label>
            <div className="d-flex align-items-start">
              <div className="mr-3" style={{ width: 96 }}>
                {picturePreview ? (
                  <img src={picturePreview} alt="Profile preview" className="img-thumbnail" style={{ maxWidth: '96px', maxHeight: '96px' }} />
                ) : (
                  <div className="border rounded d-flex align-items-center justify-content-center bg-light" style={{ width: 96, height: 96 }}>
                    <span className="text-muted small">No Image</span>
                  </div>
                )}
              </div>
              <div className="flex-grow-1">
                <input
                  type="file"
                  accept="image/*"
                  className={`form-control-file ${pictureError ? 'is-invalid' : ''}`}
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (!file) {
                      setPictureData('')
                      setPicturePreview('')
                      setPictureError(null)
                      return
                    }
                    if (!file.type.startsWith('image/')) {
                      setPictureError('Please select an image file')
                      return
                    }
                    if (file.size > 5 * 1024 * 1024) {
                      setPictureError('Image must be 5MB or smaller')
                      return
                    }
                    setPictureError(null)
                    setPictureLoading(true)
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
                      setPictureError('Failed to read image file')
                      setPictureLoading(false)
                    }
                    reader.readAsDataURL(file)
                  }}
                  disabled={loading}
                />
                <div className="mt-2 d-flex align-items-center">
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm mr-2"
                    onClick={() => {
                      setPictureData('')
                      setPicturePreview('')
                      setPictureError(null)
                    }}
                    disabled={loading || (!pictureData && !picturePreview)}
                  >
                    Remove
                  </button>
                  {pictureLoading && <span className="text-muted small">Uploading...</span>}
                </div>
                {pictureError && <div className="invalid-feedback d-block">{pictureError}</div>}
              </div>
            </div>
          </div>
        </div>
        <div className="form-group">
          <label>Password</label>
          <input type="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Creating...' : 'Register'}</button>
        <button type="button" className="btn btn-link" onClick={onSwitchToLogin}>Have an account? Sign in</button>
      </form>
    </div>
  )
}
