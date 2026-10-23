import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getImageUrl, isPartOwner } from '../utils/parts.js'

function PartDetails({ currentUser }) {
  const { id } = useParams()
  const [part, setPart] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    async function loadPart() {
      setLoading(true); setError(''); setNotFound(false)
      try {
        const response = await fetch(`http://localhost:5000/api/parts/${id}`)
        const data = await response.json()
        if (response.status === 404) { setNotFound(true); return }
        if (!response.ok) throw new Error(data.message || 'Unable to load this part.')
        setPart(data.part)
      } catch (requestError) { setError(requestError.message || 'Unable to load this part right now.')
      } finally { setLoading(false) }
    }
    loadPart()
  }, [id])

  if (loading) return <main className="details-page"><p className="status-message">Loading part details...</p></main>
  if (notFound) return <main className="details-page"><div className="message error-message">This part listing was not found.</div><Link className="outline-button back-link" to="/parts">Back to browse</Link></main>
  if (error) return <main className="details-page"><div className="message error-message" role="alert">{error}</div><Link className="outline-button back-link" to="/parts">Back to browse</Link></main>
  if (!part) return null

  return <main className="details-page"><Link className="back-link" to="/parts">← Back to browse</Link><div className="details-card">
    <div className="details-image-wrap">{part.imagePath ? <img className="details-image" src={getImageUrl(part.imagePath)} alt={part.title} /> : <div className="details-image image-placeholder">No photo</div>}</div>
    <div className="details-copy"><p className="eyebrow">{part.category}</p><h1>{part.title}</h1><p className="details-price">${Number(part.price).toFixed(2)}</p><p className="details-description">{part.description}</p>
      <div className="details-list"><p><strong>Condition</strong><span>{part.condition}</span></p>{(part.carBrand || part.carModel) && <p><strong>Vehicle</strong><span>{[part.carBrand, part.carModel].filter(Boolean).join(' ')}</span></p>}<p><strong>Location</strong><span>{part.location}</span></p><p><strong>Contact</strong><span>{part.contact}</span></p><p><strong>Seller</strong><span>{part.seller?.name || 'PartsMarket seller'}</span></p><p><strong>Seller email</strong><span>{part.seller?.email || 'Not provided'}</span></p></div>
      {isPartOwner(part, currentUser) && <div className="details-actions"><Link className="primary-button" to={`/parts/${part._id}/edit`}>Edit listing</Link></div>}
    </div>
  </div></main>
}

export default PartDetails
