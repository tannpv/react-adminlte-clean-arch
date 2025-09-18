import React, { useState } from 'react'
import { register } from '../api/authApi'

export function RegisterPage({ onRegistered, onSwitchToLogin }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const { token, user } = await register({ name, email, password })
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
        <div className="form-group">
          <label>Name</label>
          <input className="form-control" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} required />
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
