import { useNavigate } from 'react-router-dom'
import PartForm from '../components/PartForm.jsx'

function SellPart({ currentUser, onAuthExpired }) {
  const navigate = useNavigate()

  return <main className="form-page listing-form-page"><div className="form-card wide-form-card"><p className="eyebrow">SELL A PART</p><h1>Create a listing</h1><p className="form-intro">Share useful parts from your garage with another driver.</p><PartForm currentUser={currentUser} submitUrl="http://localhost:5000/api/parts" method="POST" submitLabel="Create listing" onSuccess={(part) => navigate(`/parts/${part._id}`)} onAuthExpired={onAuthExpired} /></div></main>
}

export default SellPart
