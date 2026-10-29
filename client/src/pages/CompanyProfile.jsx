import { useEffect, useState } from 'react'

const emptyProfile = { companyName: '', description: '', phone: '', email: '', website: '', address: '', paymentMethods: '', deliveryMethods: '', estimatedDeliveryText: '', logoPath: '' }

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
        if (data.company) setForm({ ...data.company, paymentMethods: data.company.paymentMethods.join(', '), deliveryMethods: data.company.deliveryMethods.join(', ') })
      } catch (requestError) { setError(requestError.message || 'Unable to load your company profile right now.')
      } finally { setLoading(false) }
    }
    loadProfile()
  }, [onAuthExpired])

  function updateField(event) { setForm({ ...form, [event.target.name]: event.target.value }) }

  async function handleSubmit(event) {
    event.preventDefault(); setError(''); setValidationError(''); setSuccess('')
    const required = ['companyName', 'description', 'phone', 'email', 'address', 'estimatedDeliveryText']
    if (required.some((field) => !form[field].trim())) { setValidationError('Please complete all required company fields.'); return }
    setSaving(true)
    try {
      const response = await fetch('http://localhost:5000/api/companies/me', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ ...form, paymentMethods: form.paymentMethods.split(',').map((item) => item.trim()).filter(Boolean), deliveryMethods: form.deliveryMethods.split(',').map((item) => item.trim()).filter(Boolean) }) })
      if (response.status === 401) { onAuthExpired(); return }
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Unable to save your company profile.')
      setSuccess(data.message); setForm({ ...data.company, paymentMethods: data.company.paymentMethods.join(', '), deliveryMethods: data.company.deliveryMethods.join(', ') })
    } catch (requestError) { setError(requestError.message || 'Unable to save your company profile right now.')
    } finally { setSaving(false) }
  }

  if (loading) return <main className="form-page"><p className="status-message">Loading your company profile...</p></main>
  return <main className="form-page"><div className="form-card wide-form-card"><p className="eyebrow">COMPANY PROFILE</p><h1>Set up your business</h1><p className="form-intro">Give buyers useful information about your used-parts business.</p>{error && <p className="message error-message" role="alert">{error}</p>}{validationError && <p className="message error-message" role="alert">{validationError}</p>}{success && <p className="message success-message" role="status">{success}</p>}<form className="part-form" onSubmit={handleSubmit}><div className="form-grid">{[['companyName','Company name'],['phone','Phone'],['email','Business email'],['website','Website (optional)'],['address','Address'],['estimatedDeliveryText','Estimated delivery']].map(([name, label]) => <label key={name}>{label}{name === 'address' || name === 'estimatedDeliveryText' ? <textarea name={name} value={form[name]} onChange={updateField} rows="2" /> : <input name={name} type={name === 'email' ? 'email' : 'text'} value={form[name]} onChange={updateField} required={['companyName','phone','email'].includes(name)} />}</label>)}</div><label>Description<textarea name="description" value={form.description} onChange={updateField} rows="5" /></label><label>Payment methods <span className="field-help">Separate with commas</span><input name="paymentMethods" value={form.paymentMethods} onChange={updateField} placeholder="Cash, bank transfer" /></label><label>Delivery methods <span className="field-help">Separate with commas</span><input name="deliveryMethods" value={form.deliveryMethods} onChange={updateField} placeholder="Pickup, courier" /></label><label>Logo path (optional)<input name="logoPath" value={form.logoPath} onChange={updateField} placeholder="/uploads/company-logo.png" /></label><button className="primary-button form-button" type="submit" disabled={saving}>{saving ? 'Saving profile...' : 'Save company profile'}</button></form></div></main>
}

export default CompanyProfile
