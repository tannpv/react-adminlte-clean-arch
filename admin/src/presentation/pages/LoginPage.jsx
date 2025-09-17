import React, { useState } from 'react'

export function LoginPage({ loginUseCase, onLoggedIn, onSwitchToRegister }) {
  const [email, setEmail] = useState('tannpv2@gmail.com')
  const [password, setPassword] = useState('1234567890')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const { token, user } = await loginUseCase.execute({ email, password })
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      onLoggedIn(user)
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mt-5" style={{ maxWidth: 480 }}>
      <h3 className="mb-4">Sign in</h3>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label>Email</label>
          <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input type="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Signing in...' : 'Sign in'}</button>
        <button type="button" className="btn btn-link" onClick={onSwitchToRegister}>Create an account</button>
      </form>
      <div className="text-muted mt-3">Try: leanne@example.com / secret</div>
    </div>
  )
}
