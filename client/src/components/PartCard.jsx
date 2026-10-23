import { Link } from 'react-router-dom'
import { getImageUrl } from '../utils/parts.js'

function PartCard({ part, actions, className = '' }) {
  const carDetails = [part.carBrand, part.carModel].filter(Boolean).join(' ')

  return (
    <article className={`part-card ${className}`}>
      <Link className="part-card-link" to={`/parts/${part._id}`}>
        {part.imagePath ? <img className="part-card-image" src={getImageUrl(part.imagePath)} alt={part.title} /> : <div className="part-card-image image-placeholder">No photo</div>}
        <div className="part-card-content">
          <div className="part-card-heading"><p className="part-category">{part.category}</p><strong className="part-price">${Number(part.price).toFixed(2)}</strong></div>
          <h2>{part.title}</h2>
          <p className="part-meta">{part.condition} · {part.location}</p>
          {carDetails && <p className="part-meta">For {carDetails}</p>}
          <p className="part-seller">Sold by {part.seller?.name || 'PartsMarket seller'}</p>
        </div>
      </Link>
      {actions && <div className="part-card-actions">{actions}</div>}
    </article>
  )
}

export default PartCard
