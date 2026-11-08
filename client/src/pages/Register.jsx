import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { DELIVERY_METHODS, PAYMENT_METHODS } from '../utils/companyMethods.js'

function Register({ onRegister }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [accountType, setAccountType] = useState('individual')
  const [deliveryMethods, setDeliveryMethods] = useState([])
  const [paymentMethods, setPaymentMethods] = useState([])
  const [companyName, setCompanyName] = useState('')
  const [companyDescription, setCompanyDescription] = useState('')
  const [companyPhone, setCompanyPhone] = useState('')
  const [companyAddress, setCompanyAddress] = useState('')
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
    if (accountType === 'company' && (!deliveryMethods.length || !paymentMethods.length)) { setError('Company accounts must choose at least one delivery method and payment method.'); return }
    if (accountType === 'company' && (!companyName.trim() || !companyDescription.trim() || !companyPhone.trim() || !companyAddress.trim())) { setError('Please complete all required company information.'); return }

    setLoading(true)
    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ name, email, password, accountType, companyName, description: companyDescription, phone: companyPhone, address: companyAddress, deliveryMethods, paymentMethods }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Registration failed.')
      setSuccess(`${data.message} You can now log in.`)
      setName(''); setEmail(''); setPassword(''); setAccountType('individual'); setDeliveryMethods([]); setPaymentMethods([]); setCompanyName(''); setCompanyDescription(''); setCompanyPhone(''); setCompanyAddress('')
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
      <fieldset className="account-type-options"><legend>Account type</legend><label><input type="radio" name="accountType" value="individual" checked={accountType === 'individual'} onChange={(event) => setAccountType(event.target.value)} /> Individual <span>Buy and sell parts</span></label><label><input type="radio" name="accountType" value="company" checked={accountType === 'company'} onChange={(event) => setAccountType(event.target.value)} /> Company <span>Represent a used-parts business</span></label></fieldset>
      {accountType === 'company' && <><label htmlFor="company-name">Company name *</label><input id="company-name" type="text" value={companyName} onChange={(event) => setCompanyName(event.target.value)} /><label htmlFor="company-description">Description *</label><textarea id="company-description" value={companyDescription} onChange={(event) => setCompanyDescription(event.target.value)} rows="4" /><label htmlFor="company-phone">Phone *</label><input id="company-phone" type="text" value={companyPhone} onChange={(event) => setCompanyPhone(event.target.value)} /><label htmlFor="company-email">Business email *</label><input id="company-email" type="email" value={email} readOnly /><label htmlFor="company-address">Address *</label><textarea id="company-address" value={companyAddress} onChange={(event) => setCompanyAddress(event.target.value)} rows="3" /><fieldset className="account-type-options"><legend>Delivery methods *</legend>{DELIVERY_METHODS.map((method) => <label key={method.value}><input type="checkbox" checked={deliveryMethods.includes(method.value)} onChange={() => setDeliveryMethods((current) => current.includes(method.value) ? current.filter((value) => value !== method.value) : [...current, method.value])} /> {method.label}</label>)}</fieldset><fieldset className="account-type-options"><legend>Payment methods *</legend>{PAYMENT_METHODS.map((method) => <label key={method.value}><input type="checkbox" checked={paymentMethods.includes(method.value)} onChange={() => setPaymentMethods((current) => current.includes(method.value) ? current.filter((value) => value !== method.value) : [...current, method.value])} /> {method.label}</label>)}</fieldset></>}
      <button className="primary-button form-button" type="submit" disabled={loading}>{loading ? 'Creating account...' : 'Create account'}</button>
    </form><p className="form-footer">Already have an account? <Link to="/login">Log in</Link></p>
  </div></main>
}

export default Register
