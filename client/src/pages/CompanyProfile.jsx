import { useEffect, useState } from 'react'
import { DELIVERY_METHODS, PAYMENT_METHODS, validMethodValues } from '../utils/companyMethods.js'

const emptyProfile = { companyName: '', description: '', phone: '', email: '', website: '', address: '', paymentMethods: [], deliveryMethods: [], estimatedDeliveryText: '', logoPath: '' }

function CompanyProfile({ onAuthExpired }) {
  const [form, setForm] = useState(emptyProfile)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [validationError, setValidationError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await fetch('http://localhost:5000/api/companies/me', { credentials: 'include' })
        if (response.status === 401) { onAuthExpired(); return }
        const data = await response.json()
        if (!response.ok) throw new Error(data.message || 'Unable to load your company profile.')
        const profile = data.company || emptyProfile
        setForm({ ...emptyProfile, ...profile, deliveryMethods: validMethodValues(profile.deliveryMethods, DELIVERY_METHODS), paymentMethods: validMethodValues(profile.paymentMethods, PAYMENT_METHODS) })
      } catch (requestError) { setError(requestError.message || 'Unable to load your company profile right now.') } finally { setLoading(false) }
    }
    loadProfile()
  }, [onAuthExpired])

  function updateField(event) { setForm({ ...form, [event.target.name]: event.target.value }) }
  function toggleMethod(field, value) { setForm((current) => ({ ...current, [field]: current[field].includes(value) ? current[field].filter((item) => item !== value) : [...current[field], value] })) }

  async function handleSubmit(event) {
    event.preventDefault(); setError(''); setValidationError(''); setSuccess('')
    const required = ['companyName', 'description', 'phone', 'email', 'address', 'estimatedDeliveryText']
    if (required.some((field) => !form[field].trim())) { setValidationError('Please complete all required company fields.'); return }
    if (!form.deliveryMethods.length || !form.paymentMethods.length) { setValidationError('Choose at least one delivery method and payment method.'); return }
    setSaving(true)
    try {
      const response = await fetch('http://localhost:5000/api/companies/me', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(form) })
      if (response.status === 401) { onAuthExpired(); return }
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Unable to save your company profile.')
      setSuccess(data.message); setForm({ ...emptyProfile, ...data.company })
    } catch (requestError) { setError(requestError.message || 'Unable to save your company profile right now.') } finally { setSaving(false) }
  }

  if (loading) return <main className="form-page"><p className="status-message">Loading your company profile...</p></main>
  return <main className="form-page"><div className="form-card wide-form-card"><p className="eyebrow">COMPANY PROFILE</p><h1>Set up your business</h1><p className="form-intro">Give buyers useful information about your used-parts business.</p>{error && <p className="message error-message" role="alert">{error}</p>}{validationError && <p className="message error-message" role="alert">{validationError}</p>}{success && <p className="message success-message" role="status">{success}</p>}<form className="part-form" onSubmit={handleSubmit}><div className="form-grid">{[['companyName','Company name'],['phone','Phone'],['email','Business email'],['website','Website (optional)'],['address','Address'],['estimatedDeliveryText','Estimated delivery']].map(([name, label]) => <label key={name}>{label}{name === 'address' || name === 'estimatedDeliveryText' ? <textarea name={name} value={form[name]} onChange={updateField} rows="2" /> : <input name={name} type={name === 'email' ? 'email' : 'text'} value={form[name]} onChange={updateField} required={['companyName','phone','email'].includes(name)} />}</label>)}</div><label>Description<textarea name="description" value={form.description} onChange={updateField} rows="5" /></label><fieldset className="account-type-options"><legend>Delivery methods *</legend>{DELIVERY_METHODS.map((method) => <label key={method.value}><input type="checkbox" checked={form.deliveryMethods.includes(method.value)} onChange={() => toggleMethod('deliveryMethods', method.value)} /> {method.label}</label>)}</fieldset><fieldset className="account-type-options"><legend>Payment methods *</legend>{PAYMENT_METHODS.map((method) => <label key={method.value}><input type="checkbox" checked={form.paymentMethods.includes(method.value)} onChange={() => toggleMethod('paymentMethods', method.value)} /> {method.label}</label>)}</fieldset><label>Logo path (optional)<input name="logoPath" value={form.logoPath} onChange={updateField} placeholder="/uploads/company-logo.png" /></label><button className="primary-button form-button" type="submit" disabled={saving}>{saving ? 'Saving profile...' : 'Save company profile'}</button></form></div></main>
}

export default CompanyProfile
