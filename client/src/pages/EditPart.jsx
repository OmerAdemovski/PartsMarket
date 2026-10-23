import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import PartForm from '../components/PartForm.jsx'
import { isPartOwner } from '../utils/parts.js'

function EditPart({ currentUser, onAuthExpired }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [part, setPart] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadPart() {
      try {
        const response = await fetch(`http://localhost:5000/api/parts/${id}`, { credentials: 'include' })
        if (response.status === 401) {
          onAuthExpired()
          return
        }
        const data = await response.json()
        if (response.status === 404) throw new Error('Part listing not found.')
        if (!response.ok) throw new Error(data.message || 'Unable to load this listing.')
        setPart(data.part)
      } catch (requestError) { setError(requestError.message || 'Unable to load this listing right now.')
      } finally { setLoading(false) }
    }
    loadPart()
  }, [id, onAuthExpired])

  if (loading) return <main className="form-page"><p className="status-message">Loading listing...</p></main>
  if (error) return <main className="form-page"><div className="message error-message">{error}</div><Link className="outline-button back-link" to="/parts">Back to browse</Link></main>
  if (!isPartOwner(part, currentUser)) return <main className="form-page"><div className="message error-message">You can only edit your own listings.</div><Link className="outline-button back-link" to={`/parts/${id}`}>Back to listing</Link></main>

  return <main className="form-page listing-form-page"><div className="form-card wide-form-card"><p className="eyebrow">YOUR LISTING</p><h1>Edit part</h1><p className="form-intro">Update the details or choose a replacement photo.</p><PartForm key={part._id} part={part} submitUrl={`http://localhost:5000/api/parts/${id}`} method="PUT" submitLabel="Save changes" onSuccess={() => navigate(`/parts/${id}`)} onAuthExpired={onAuthExpired} /></div></main>
}

export default EditPart
