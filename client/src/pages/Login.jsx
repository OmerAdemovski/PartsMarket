import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function handleSubmit(event) {
    event.preventDefault(); setError('')
    if (!email.trim() || !password) { setError('Please enter your email and password.'); return }
    setLoading(true)
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ email, password }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Login failed.')
      onLogin(data.user)
      navigate('/account')
    } catch (requestError) { setError(requestError.message || 'Unable to log in right now.')
    } finally { setLoading(false) }
  }

  return <main className="form-page"><div className="form-card"><p className="eyebrow">WELCOME BACK</p><h1>Log in to PartsMarket</h1><p className="form-intro">Your next repair, or your next buyer, is waiting.</p>
    {error && <p className="message error-message" role="alert">{error}</p>}
    <form onSubmit={handleSubmit}><label htmlFor="login-email">Email</label><input id="login-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" />
      <label htmlFor="login-password">Password</label><input id="login-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" />
      <button className="primary-button form-button" type="submit" disabled={loading}>{loading ? 'Logging in...' : 'Log in'}</button>
    </form><p className="form-footer">Need an account? <Link to="/register">Register here</Link></p>
  </div></main>
}

export default Login
