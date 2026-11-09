import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { API_BASE_URL } from '../utils/parts.js'
import { complaintCategoryLabel, COMPLAINT_STATUS_LABELS } from '../utils/complaints.js'

function CompanyComplaints({ onAuthExpired }) {
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  useEffect(() => { async function loadComplaints() { try { const response = await fetch(`${API_BASE_URL}/api/complaints/company`, { credentials: 'include' }); if (response.status === 401) { onAuthExpired(); return }; const data = await response.json(); if (!response.ok) throw new Error(data.message || 'Unable to load company complaints.'); setComplaints(data.complaints || []) } catch (requestError) { setError(requestError.message || 'Unable to load company complaints right now.') } finally { setLoading(false) } } loadComplaints() }, [onAuthExpired])
  return <main className="listing-page"><p className="eyebrow">COMPANY SUPPORT</p><h1>Company complaints</h1><p className="form-intro">Private conversations with buyers about your company orders.</p>{loading && <p className="status-message">Loading complaints...</p>}{error && <p className="message error-message" role="alert">{error}</p>}{!loading && !error && complaints.length === 0 && <div className="empty-card"><p>No complaints have been opened.</p></div>}<div className="complaint-grid">{complaints.map((complaint) => <Link className="complaint-card" to={`/complaints/${complaint._id}`} key={complaint._id}><div className="complaint-card-heading"><h2>{complaint.subject}</h2><span className={`complaint-status complaint-status-${complaint.status}`}>{COMPLAINT_STATUS_LABELS[complaint.status]}</span></div><p>{complaint.productTitle} · Buyer: {complaint.buyerName}</p><span>{complaintCategoryLabel(complaint.category)} · Updated {new Date(complaint.updatedAt).toLocaleDateString()}</span></Link>)}</div></main>
}

export default CompanyComplaints
