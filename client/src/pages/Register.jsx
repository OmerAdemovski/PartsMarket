import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

function Register({ onRegister }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const navigate = useNavigate()

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSuccess('')
    if (!name.trim() || !email.trim() || !password) { setError('Please enter your name, email, and password.'); return }
    if (password.length < 6) { setError('Your password must be at least 6 characters long.'); return }

    setLoading(true)
    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ name, email, password }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Registration failed.')
      setSuccess(`${data.message} You can now log in.`)
      setName(''); setEmail(''); setPassword('')
      onRegister(data.user)
      navigate('/account')
    } catch (requestError) { setError(requestError.message || 'Unable to register right now.')
    } finally { setLoading(false) }
  }

  return <main className="form-page"><div className="form-card"><p className="eyebrow">JOIN PARTSMARKET</p><h1>Create your account</h1><p className="form-intro">Make it easier to find and sell quality used car parts.</p>
    {error && <p className="message error-message" role="alert">{error}</p>}{success && <p className="message success-message" role="status">{success}</p>}
    <form onSubmit={handleSubmit}><label htmlFor="register-name">Name</label><input id="register-name" type="text" value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" />
      <label htmlFor="register-email">Email</label><input id="register-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" />
      <label htmlFor="register-password">Password</label><input id="register-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" />
      <button className="primary-button form-button" type="submit" disabled={loading}>{loading ? 'Creating account...' : 'Create account'}</button>
    </form><p className="form-footer">Already have an account? <Link to="/login">Log in</Link></p>
  </div></main>
}

export default Register
