import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { API_BASE_URL } from '../utils/parts.js'
import { complaintCategoryLabel, COMPLAINT_STATUS_LABELS } from '../utils/complaints.js'

function ComplaintDetails({ onAuthExpired }) {
  const { id } = useParams()
  const [complaint, setComplaint] = useState(null)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [resolving, setResolving] = useState(false)
  const [error, setError] = useState('')
  const [actionError, setActionError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => { async function loadComplaint() { try { const response = await fetch(`${API_BASE_URL}/api/complaints/${id}`, { credentials: 'include' }); if (response.status === 401) { onAuthExpired(); return }; const data = await response.json(); if (!response.ok) throw new Error(data.message || 'Unable to load this complaint.'); setComplaint(data.complaint) } catch (requestError) { setError(requestError.message || 'Unable to load this complaint right now.') } finally { setLoading(false) } } loadComplaint() }, [id, onAuthExpired])

  async function sendMessage(event) {
    event.preventDefault(); setActionError(''); setSuccess('')
    if (!message.trim()) { setActionError('Please enter a message.'); return }
    if (message.trim().length > 2000) { setActionError('Message cannot exceed 2000 characters.'); return }
    setSending(true)
    try { const response = await fetch(`${API_BASE_URL}/api/complaints/${id}/messages`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ message }) }); if (response.status === 401) { onAuthExpired(); return }; const data = await response.json(); if (!response.ok) throw new Error(data.message || 'Unable to send your message.'); setComplaint(data.complaint); setMessage(''); setSuccess(data.message) } catch (requestError) { setActionError(requestError.message || 'Unable to send your message right now.') } finally { setSending(false) }
  }

  async function resolveComplaint() {
    setActionError(''); setSuccess(''); setResolving(true)
    try { const response = await fetch(`${API_BASE_URL}/api/complaints/${id}/resolve`, { method: 'PATCH', credentials: 'include' }); if (response.status === 401) { onAuthExpired(); return }; const data = await response.json(); if (!response.ok) throw new Error(data.message || 'Unable to resolve the complaint.'); setComplaint(data.complaint); setSuccess(data.message) } catch (requestError) { setActionError(requestError.message || 'Unable to resolve the complaint right now.') } finally { setResolving(false) }
  }

  if (loading) return <main className="details-page"><p className="status-message">Loading complaint...</p></main>
  if (error) return <main className="details-page"><p className="message error-message" role="alert">{error}</p><Link to="/account">Back to account</Link></main>
  if (!complaint) return null
  const readOnly = complaint.status === 'resolved'
  return <main className="details-page"><Link className="back-link" to={complaint.viewerRole === 'company' ? '/company-complaints' : '/my-complaints'}>← Back to complaints</Link><div className="company-details-card complaint-details-card"><div className="complaint-detail-heading"><div><p className="eyebrow">PRIVATE COMPLAINT</p><h1>{complaint.subject}</h1></div><span className={`complaint-status complaint-status-${complaint.status}`}>{COMPLAINT_STATUS_LABELS[complaint.status]}</span></div><p className="form-intro">{complaint.productTitle} · {complaint.companyName}</p><div className="details-list"><p><strong>Category</strong><span>{complaintCategoryLabel(complaint.category)}</span></p><p><strong>Buyer</strong><span>{complaint.buyerName}</span></p><p><strong>Privacy</strong><span>Only the buyer and company can view this conversation.</span></p></div><section className="complaint-messages"><h2>Conversation</h2>{complaint.messages.map((item) => <article className={`complaint-message complaint-message-${item.senderRole}`} key={item._id}><div><strong>{item.senderRole === 'buyer' ? 'Buyer' : 'Company'}</strong><time dateTime={item.createdAt}>{new Date(item.createdAt).toLocaleString()}</time></div><p>{item.message}</p></article>)}</section>{actionError && <p className="message error-message" role="alert">{actionError}</p>}{success && <p className="message success-message" role="status">{success}</p>}{!readOnly ? <><form className="complaint-reply-form" onSubmit={sendMessage}><label>Reply<textarea rows="4" maxLength="2000" value={message} onChange={(event) => setMessage(event.target.value)} /><span className="field-help">{message.length}/2000</span></label><button className="primary-button form-button" type="submit" disabled={sending}>{sending ? 'Sending...' : 'Send reply'}</button></form>{complaint.viewerRole === 'buyer' && <button className="outline-button resolve-button" type="button" disabled={resolving} onClick={resolveComplaint}>{resolving ? 'Resolving...' : 'Mark complaint resolved'}</button>}</> : <p className="private-complaint-note">This complaint is resolved and read-only.</p>}</div></main>
}

export default ComplaintDetails
