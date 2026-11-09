import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { API_BASE_URL } from '../utils/parts.js'
import { complaintCategoryLabel, COMPLAINT_STATUS_LABELS } from '../utils/complaints.js'

function MyComplaints({ onAuthExpired }) {
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  useEffect(() => { async function loadComplaints() { try { const response = await fetch(`${API_BASE_URL}/api/complaints/my`, { credentials: 'include' }); if (response.status === 401) { onAuthExpired(); return }; const data = await response.json(); if (!response.ok) throw new Error(data.message || 'Unable to load your complaints.'); setComplaints(data.complaints || []) } catch (requestError) { setError(requestError.message || 'Unable to load your complaints right now.') } finally { setLoading(false) } } loadComplaints() }, [onAuthExpired])
  return <main className="listing-page"><p className="eyebrow">PRIVATE SUPPORT</p><h1>My complaints</h1><p className="form-intro">Private conversations with companies about your orders.</p>{loading && <p className="status-message">Loading complaints...</p>}{error && <p className="message error-message" role="alert">{error}</p>}{!loading && !error && complaints.length === 0 && <div className="empty-card"><p>You have no complaints yet.</p></div>}<div className="complaint-grid">{complaints.map((complaint) => <Link className="complaint-card" to={`/complaints/${complaint._id}`} key={complaint._id}><div className="complaint-card-heading"><h2>{complaint.subject}</h2><span className={`complaint-status complaint-status-${complaint.status}`}>{COMPLAINT_STATUS_LABELS[complaint.status]}</span></div><p>{complaint.productTitle} · {complaint.companyName}</p><span>{complaintCategoryLabel(complaint.category)} · Updated {new Date(complaint.updatedAt).toLocaleDateString()}</span></Link>)}</div></main>
}

export default MyComplaints
