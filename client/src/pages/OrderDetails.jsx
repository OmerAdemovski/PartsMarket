import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { API_BASE_URL } from '../utils/parts.js'
import { canCancelOrder, formatMoney, getOrderStatusFlow, ORDER_STATUS_LABELS } from '../utils/orders.js'
import { DELIVERY_METHODS, PAYMENT_METHODS, methodLabel } from '../utils/companyMethods.js'

function OrderDetails({ currentUser, onAuthExpired }) {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionError, setActionError] = useState('')

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

  if (loading) return <main className="details-page"><p className="status-message">Loading order...</p></main>
  if (error) return <main className="details-page"><p className="message error-message" role="alert">{error}</p><Link to="/my-orders">Back to my orders</Link></main>
  if (!order) return null
  const orderStatusFlow = getOrderStatusFlow(order.deliveryMethod)
  const currentIndex = orderStatusFlow.indexOf(order.status)
  const deliveryLabel = methodLabel(order.deliveryMethod, DELIVERY_METHODS) || 'Unavailable'
  const paymentLabel = methodLabel(order.paymentMethod, PAYMENT_METHODS) || 'Unavailable'
  return <main className="details-page"><Link className="back-link" to="/my-orders">← Back to my orders</Link><div className="company-details-card"><p className="eyebrow">ORDER {order._id.slice(-8).toUpperCase()}</p><h1>{order.productSnapshot.title}</h1><p className="form-intro">{order.companySnapshot.companyName}</p>{actionError && <p className="message error-message" role="alert">{actionError}</p>}<div className="order-timeline">{orderStatusFlow.map((status, index) => <div className={`timeline-item ${status === order.status ? 'current' : ''} ${index <= currentIndex && order.status !== 'cancelled' ? 'complete' : ''}`} key={status}><span>{index + 1}</span><strong>{ORDER_STATUS_LABELS[status]}</strong></div>)}{order.status === 'cancelled' && <div className="timeline-item current"><span>!</span><strong>Cancelled</strong></div>}</div><div className="details-list"><p><strong>Quantity</strong><span>{order.quantity}</span></p><p><strong>Unit price</strong><span>{formatMoney(order.unitPrice)}</span></p><p><strong>Subtotal</strong><span>{formatMoney(order.subtotal)}</span></p><p><strong>Delivery</strong><span>{deliveryLabel} ({formatMoney(order.deliveryFee)})</span></p><p><strong>Total</strong><span>{formatMoney(order.total)}</span></p><p><strong>Payment method</strong><span>{paymentLabel}</span></p>{order.deliveryAddress && <p><strong>Delivery address</strong><span>{order.deliveryAddress}</span></p>}<p><strong>Buyer phone</strong><span>{order.buyerPhone}</span></p>{order.buyerNotes && <p><strong>Notes</strong><span>{order.buyerNotes}</span></p>}<p><strong>Part number</strong><span>{order.productSnapshot.partNumber || 'Not provided'}</span></p><p><strong>Vehicle</strong><span>{[order.productSnapshot.brand, order.productSnapshot.model].filter(Boolean).join(' ') || 'Not provided'}</span></p></div>{canCancelOrder(order, currentUser) && <button className="danger-button" type="button" onClick={cancelOrder}>Cancel order</button>}</div></main>
}

export default OrderDetails
