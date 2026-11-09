import { useState } from 'react'
import { API_BASE_URL } from '../utils/parts.js'
import { COMPLAINT_CATEGORIES } from '../utils/complaints.js'

function ComplaintForm({ orderId, onAuthExpired, onCreated }) {
  const [category, setCategory] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function handleSubmit(event) {
    event.preventDefault(); setError(''); setSuccess('')
    if (!category || !subject.trim() || !message.trim()) { setError('Please choose a category and complete the subject and message.'); return }
    if (subject.trim().length > 120) { setError('Subject cannot exceed 120 characters.'); return }
    if (message.trim().length > 2000) { setError('Message cannot exceed 2000 characters.'); return }
    setSaving(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/complaints`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ orderId, category, subject, message }) })
      if (response.status === 401) { onAuthExpired(); return }
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Unable to open the complaint.')
      setSuccess(data.message); onCreated(data.complaint)
    } catch (requestError) { setError(requestError.message || 'Unable to open the complaint right now.') } finally { setSaving(false) }
  }

  return <form className="complaint-form" onSubmit={handleSubmit}><p className="private-complaint-note">This complaint is private between you and the company that sold this order.</p><label>Category *<select value={category} onChange={(event) => setCategory(event.target.value)}><option value="">Choose a category</option>{COMPLAINT_CATEGORIES.map((item) => <option value={item.value} key={item.value}>{item.label}</option>)}</select></label><label>Subject *<input value={subject} maxLength="120" onChange={(event) => setSubject(event.target.value)} /></label><label>Message *<textarea rows="5" maxLength="2000" value={message} onChange={(event) => setMessage(event.target.value)} /><span className="field-help">{message.length}/2000</span></label>{error && <p className="message error-message" role="alert">{error}</p>}{success && <p className="message success-message" role="status">{success}</p>}<button className="primary-button form-button" type="submit" disabled={saving}>{saving ? 'Opening complaint...' : 'Report a problem'}</button></form>
}

export default ComplaintForm
