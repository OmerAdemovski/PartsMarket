import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { DELIVERY_METHODS, PAYMENT_METHODS, methodLabel } from '../utils/companyMethods.js'

const emptySummary = { averageRating: null, totalReviews: 0, ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } }

function friendlyMethods(values, options) {
  return (Array.isArray(values) ? values : []).map((value) => methodLabel(value, options)).filter(Boolean).join(', ')
}

function Stars({ rating }) {
  return <span className="star-display" aria-label={`${rating || 0} out of 5 stars`}>{[1, 2, 3, 4, 5].map((star) => <span className={star <= Math.round(rating || 0) ? 'star-filled' : ''} key={star}>★</span>)}</span>
}

function CompanyDetails() {
  const { id } = useParams()
  const [company, setCompany] = useState(null)
  const [reviews, setReviews] = useState([])
  const [summary, setSummary] = useState(emptySummary)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadCompany() {
      try {
        const [companyResponse, reviewsResponse] = await Promise.all([fetch(`http://localhost:5000/api/companies/${id}`), fetch(`http://localhost:5000/api/reviews/company/${id}`)])
        const companyData = await companyResponse.json()
        const reviewData = await reviewsResponse.json()
        if (!companyResponse.ok) throw new Error(companyData.message || 'Unable to load this company.')
        if (!reviewsResponse.ok) throw new Error(reviewData.message || 'Unable to load company reviews.')
        setCompany(companyData.company)
        setSummary(reviewData.summary || companyData.company.reviewSummary || emptySummary)
        setReviews(reviewData.reviews || [])
      } catch (requestError) { setError(requestError.message || 'Unable to load this company right now.') } finally { setLoading(false) }
    }
    loadCompany()
  }, [id])

  if (loading) return <main className="details-page"><p className="status-message">Loading company details...</p></main>
  if (error) return <main className="details-page"><p className="message error-message" role="alert">{error}</p><Link to="/companies">Back to companies</Link></main>
  if (!company) return null
  return <main className="details-page"><Link className="back-link" to="/companies">← Back to companies</Link><div className="company-details-card"><div className="company-details-header"><div className="company-logo large-logo">{company.logoPath ? <img src={`http://localhost:5000${company.logoPath}`} alt="" /> : 'PM'}</div><div><p className="eyebrow">COMPANY PROFILE</p><h1>{company.companyName}</h1><p className="form-intro">{company.address}</p></div></div><p className="details-description">{company.description}</p><div className="company-rating-summary"><div>{summary.totalReviews > 0 ? <><strong>{summary.averageRating.toFixed(1)}</strong> <Stars rating={summary.averageRating} /></> : <strong>No reviews yet</strong>}<span>{summary.totalReviews} verified review{summary.totalReviews === 1 ? '' : 's'}</span></div><div className="rating-distribution">{[5, 4, 3, 2, 1].map((rating) => <span key={rating}>{rating} ★ {summary.ratingDistribution[rating] || 0}</span>)}</div></div><div className="details-list"><p><strong>Phone</strong><span>{company.phone}</span></p><p><strong>Email</strong><span>{company.email}</span></p>{company.website && <p><strong>Website</strong><span>{company.website}</span></p>}<p><strong>Payment methods</strong><span>{friendlyMethods(company.paymentMethods, PAYMENT_METHODS) || 'Contact company'}</span></p><p><strong>Delivery methods</strong><span>{friendlyMethods(company.deliveryMethods, DELIVERY_METHODS) || 'Contact company'}</span></p><p><strong>Estimated delivery</strong><span>{company.estimatedDeliveryText}</span></p></div><section className="reviews-section"><h2>Verified reviews</h2>{reviews.length === 0 && <p className="status-message">No reviews yet.</p>}{reviews.map((review) => <article className="review-card" key={review._id}><div className="review-card-heading"><div><strong>{review.reviewerName}</strong><Stars rating={review.rating} /></div><time dateTime={review.createdAt}>{new Date(review.createdAt).toLocaleDateString()}</time></div>{review.comment && <p>{review.comment}</p>}<span className="verified-label">Verified purchase</span></article>)}</section></div></main>
}

export default CompanyDetails
