import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import PartCard from '../components/PartCard.jsx'
import { isPartOwner } from '../utils/parts.js'

function MyParts({ currentUser, onAuthExpired }) {
  const [parts, setParts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deletingId, setDeletingId] = useState('')
  const [partToDelete, setPartToDelete] = useState(null)
  const [removingId, setRemovingId] = useState('')

  useEffect(() => {
    async function loadMyParts() {
      try {
        const response = await fetch('http://localhost:5000/api/parts', { credentials: 'include' })
        if (response.status === 401) {
          onAuthExpired()
          return
        }
        const data = await response.json()
        if (!response.ok) throw new Error(data.message || 'Unable to load your listings.')
        setParts((data.parts || []).filter((part) => isPartOwner(part, currentUser)))
      } catch (requestError) { setError(requestError.message || 'Unable to load your listings right now.')
      } finally { setLoading(false) }
    }
    loadMyParts()
  }, [currentUser, onAuthExpired])

  useEffect(() => {
    if (!partToDelete) return undefined

    function handleEscape(event) {
      if (event.key === 'Escape' && !deletingId) setPartToDelete(null)
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [partToDelete, deletingId])

  function handleDelete(part) {
    setPartToDelete(part)
    setError('')
  }

  async function confirmDelete() {
    if (!partToDelete) return
    const part = partToDelete
    setDeletingId(part._id); setError('')
    try {
      const response = await fetch(`http://localhost:5000/api/parts/${part._id}`, { method: 'DELETE', credentials: 'include' })
      if (response.status === 401) {
        onAuthExpired()
        return
      }
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Unable to delete this listing.')
      setPartToDelete(null)
      setRemovingId(part._id)
      window.setTimeout(() => {
        setParts((currentParts) => currentParts.filter((currentPart) => currentPart._id !== part._id))
        setRemovingId('')
      }, 320)
    } catch (requestError) { setError(requestError.message || 'Unable to delete this listing.')
    } finally { setDeletingId('') }
  }

  return <main className="listing-page"><p className="eyebrow">YOUR LISTINGS</p><h1>My parts.</h1><p className="form-intro">Manage the parts you have shared with the PartsMarket community.</p>
    {loading && <p className="status-message">Loading your listings...</p>}{error && <p className="message error-message" role="alert">{error}</p>}
    {!loading && !error && parts.length === 0 && <div className="empty-card"><p>You have not listed any parts yet.</p><Link className="primary-button" to="/parts/new">Sell a part</Link></div>}
    {!loading && parts.length > 0 && <div className="parts-grid">{parts.map((part) => <PartCard key={part._id} part={part} className={removingId === part._id ? 'part-card-removing' : ''} actions={<><Link className="outline-button" to={`/parts/${part._id}/edit`}>Edit</Link><button className="danger-button" type="button" disabled={deletingId === part._id} onClick={() => handleDelete(part)}>{deletingId === part._id ? 'Deleting...' : 'Delete'}</button></>} />)}</div>}
    {partToDelete && <div className="modal-overlay" role="presentation" onClick={(event) => { if (event.target === event.currentTarget && !deletingId) setPartToDelete(null) }}>
      <div className="confirmation-modal" role="dialog" aria-modal="true" aria-labelledby="delete-dialog-title">
        <p className="eyebrow">REMOVE LISTING</p><h2 id="delete-dialog-title">Delete “{partToDelete.title}”?</h2>
        <p className="modal-warning">This listing will be permanently deleted. This action cannot be undone.</p>
        <div className="modal-actions"><button className="outline-button" type="button" disabled={Boolean(deletingId)} onClick={() => setPartToDelete(null)}>Cancel</button><button className="danger-button" type="button" disabled={Boolean(deletingId)} onClick={confirmDelete}>{deletingId ? 'Deleting...' : 'Delete'}</button></div>
      </div>
    </div>}
  </main>
}

export default MyParts
