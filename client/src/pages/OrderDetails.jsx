import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { API_BASE_URL } from '../utils/parts.js'
import { canCancelOrder, formatMoney, getOrderStatusFlow, ORDER_STATUS_LABELS } from '../utils/orders.js'
import { DELIVERY_METHODS, PAYMENT_METHODS, methodLabel } from '../utils/companyMethods.js'

function Stars({ rating }) {
  return <span className="star-display" aria-label={`${rating} out of 5 stars`}>{[1, 2, 3, 4, 5].map((star) => <span className={star <= rating ? 'star-filled' : ''} key={star}>★</span>)}</span>
}

function OrderDetails({ currentUser, onAuthExpired }) {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionError, setActionError] = useState('')
  const [review, setReview] = useState(null)
  const [reviewRating, setReviewRating] = useState(0)
  const [reviewComment, setReviewComment] = useState('')
  const [reviewLoading, setReviewLoading] = useState(false)
  const [reviewSaving, setReviewSaving] = useState(false)
  const [reviewError, setReviewError] = useState('')
  const [reviewSuccess, setReviewSuccess] = useState('')

  useEffect(() => {
    async function loadOrder() {
      try {
        const response = await fetch(`${API_BASE_URL}/api/orders/${id}`, { credentials: 'include' })
        if (response.status === 401) { onAuthExpired(); return }
        const data = await response.json()
        if (!response.ok) throw new Error(data.message || 'Unable to load this order.')
        setOrder(data.order)
      } catch (requestError) { setError(requestError.message || 'Unable to load this order right now.') } finally { setLoading(false) }
    }
    loadOrder()
  }, [id, onAuthExpired])

  useEffect(() => {
    if (!order || order.status !== 'delivered') return
    const buyerId = order.buyer?._id || order.buyer
    const currentUserId = currentUser?.id || currentUser?._id
    if (String(buyerId) !== String(currentUserId)) return
    async function loadReview() {
      setReviewLoading(true)
      try {
        const response = await fetch(`${API_BASE_URL}/api/reviews/order/${id}`, { credentials: 'include' })
        if (response.status === 401) { onAuthExpired(); return }
        const data = await response.json()
        if (!response.ok) throw new Error(data.message || 'Unable to load your review.')
        setReview(data.review)
        setReviewRating(data.review?.rating || 0)
        setReviewComment(data.review?.comment || '')
      } catch (requestError) { setReviewError(requestError.message || 'Unable to load your review right now.') } finally { setReviewLoading(false) }
    }
    loadReview()
  }, [order, currentUser, id, onAuthExpired])

  async function cancelOrder() {
    setActionError('')
    try {
      const response = await fetch(`${API_BASE_URL}/api/orders/${id}/cancel`, { method: 'PATCH', credentials: 'include' })
      if (response.status === 401) { onAuthExpired(); return }
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Unable to cancel this order.')
      setOrder(data.order)
    } catch (requestError) { setActionError(requestError.message || 'Unable to cancel this order right now.') }
  }

  async function saveReview(event) {
    event.preventDefault(); setReviewError(''); setReviewSuccess('')
    if (!Number.isInteger(reviewRating) || reviewRating < 1 || reviewRating > 5) { setReviewError('Please choose a rating from 1 to 5 stars.'); return }
    if (reviewComment.length > 1000) { setReviewError('Your comment must be 1000 characters or fewer.'); return }
    setReviewSaving(true)
    try {
      const response = await fetch(review ? `${API_BASE_URL}/api/reviews/${review._id}` : `${API_BASE_URL}/api/reviews`, { method: review ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(review ? { rating: reviewRating, comment: reviewComment } : { orderId: id, rating: reviewRating, comment: reviewComment }) })
      if (response.status === 401) { onAuthExpired(); return }
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Unable to save your review.')
      setReview(data.review); setReviewSuccess(data.message); setReviewError('')
    } catch (requestError) { setReviewError(requestError.message || 'Unable to save your review right now.') } finally { setReviewSaving(false) }
  }

  if (loading) return <main className="details-page"><p className="status-message">Loading order...</p></main>
  if (error) return <main className="details-page"><p className="message error-message" role="alert">{error}</p><Link to="/my-orders">Back to my orders</Link></main>
  if (!order) return null
  const orderStatusFlow = getOrderStatusFlow(order.deliveryMethod)
  const currentIndex = orderStatusFlow.indexOf(order.status)
  const deliveryLabel = methodLabel(order.deliveryMethod, DELIVERY_METHODS) || 'Unavailable'
  const paymentLabel = methodLabel(order.paymentMethod, PAYMENT_METHODS) || 'Unavailable'
  const isBuyer = String(order.buyer?._id || order.buyer) === String(currentUser?.id || currentUser?._id)
  return <main className="details-page"><Link className="back-link" to="/my-orders">← Back to my orders</Link><div className="company-details-card"><p className="eyebrow">ORDER {order._id.slice(-8).toUpperCase()}</p><h1>{order.productSnapshot.title}</h1><p className="form-intro">{order.companySnapshot.companyName}</p>{actionError && <p className="message error-message" role="alert">{actionError}</p>}<div className="order-timeline">{orderStatusFlow.map((status, index) => <div className={`timeline-item ${status === order.status ? 'current' : ''} ${index <= currentIndex && order.status !== 'cancelled' ? 'complete' : ''}`} key={status}><span>{index + 1}</span><strong>{ORDER_STATUS_LABELS[status]}</strong></div>)}{order.status === 'cancelled' && <div className="timeline-item current"><span>!</span><strong>Cancelled</strong></div>}</div><div className="details-list"><p><strong>Quantity</strong><span>{order.quantity}</span></p><p><strong>Unit price</strong><span>{formatMoney(order.unitPrice)}</span></p><p><strong>Subtotal</strong><span>{formatMoney(order.subtotal)}</span></p><p><strong>Delivery</strong><span>{deliveryLabel} ({formatMoney(order.deliveryFee)})</span></p><p><strong>Total</strong><span>{formatMoney(order.total)}</span></p><p><strong>Payment method</strong><span>{paymentLabel}</span></p>{order.deliveryAddress && <p><strong>Delivery address</strong><span>{order.deliveryAddress}</span></p>}<p><strong>Buyer phone</strong><span>{order.buyerPhone}</span></p>{order.buyerNotes && <p><strong>Notes</strong><span>{order.buyerNotes}</span></p>}<p><strong>Part number</strong><span>{order.productSnapshot.partNumber || 'Not provided'}</span></p><p><strong>Vehicle</strong><span>{[order.productSnapshot.brand, order.productSnapshot.model].filter(Boolean).join(' ') || 'Not provided'}</span></p></div>{order.status === 'delivered' && isBuyer && <section className="review-form-section"><h2>Rate this seller</h2><p className="verified-label">Verified purchase</p>{reviewLoading && <p className="status-message">Loading your review...</p>}{!reviewLoading && <form className="review-form" onSubmit={saveReview}><fieldset className="review-rating"><legend>Your rating *</legend><div role="radiogroup" aria-label="Seller rating">{[1, 2, 3, 4, 5].map((rating) => <button className={`star-button ${rating <= reviewRating ? 'selected' : ''}`} type="button" role="radio" aria-checked={rating === reviewRating} aria-label={`${rating} star${rating === 1 ? '' : 's'}`} key={rating} onClick={() => setReviewRating(rating)}>★</button>)}</div></fieldset><label>Comment (optional)<textarea rows="4" maxLength="1000" value={reviewComment} onChange={(event) => setReviewComment(event.target.value)} /><span className="field-help">{reviewComment.length}/1000</span></label>{reviewError && <p className="message error-message" role="alert">{reviewError}</p>}{reviewSuccess && <p className="message success-message" role="status">{reviewSuccess}</p>}<button className="primary-button form-button" type="submit" disabled={reviewSaving}>{reviewSaving ? 'Saving review...' : review ? 'Update review' : 'Submit review'}</button>{review && <div className="existing-review"><Stars rating={review.rating} /><p>{review.comment || 'No comment added.'}</p></div>}</form>}</section>}{canCancelOrder(order, currentUser) && <button className="danger-button" type="button" onClick={cancelOrder}>Cancel order</button>}</div></main>
}

export default OrderDetails
