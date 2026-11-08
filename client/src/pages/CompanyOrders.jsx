import { useEffect, useState } from 'react'
import OrderCard from '../components/OrderCard.jsx'
import { API_BASE_URL } from '../utils/parts.js'
import { getNextOrderStatuses, ORDER_STATUS_LABELS } from '../utils/orders.js'

function CompanyOrders({ onAuthExpired }) {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionError, setActionError] = useState('')
  const [savingId, setSavingId] = useState('')

  useEffect(() => {
    async function loadOrders() {
      try {
        const response = await fetch(`${API_BASE_URL}/api/orders/company-orders`, { credentials: 'include' })
        if (response.status === 401) { onAuthExpired(); return }
        const data = await response.json()
        if (!response.ok) throw new Error(data.message || 'Unable to load company orders.')
        setOrders(data.orders || [])
      } catch (requestError) { setError(requestError.message || 'Unable to load company orders right now.')
      } finally { setLoading(false) }
    }
    loadOrders()
  }, [onAuthExpired])

  async function updateOrder(orderId, endpoint, body) {
    setSavingId(orderId); setActionError('')
    try {
      const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}/${endpoint}`, { method: 'PATCH', headers: body ? { 'Content-Type': 'application/json' } : undefined, body: body ? JSON.stringify(body) : undefined, credentials: 'include' })
      if (response.status === 401) { onAuthExpired(); return }
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Unable to update this order.')
      setOrders((current) => current.map((order) => order._id === orderId ? data.order : order))
    } catch (requestError) { setActionError(requestError.message || 'Unable to update this order right now.')
    } finally { setSavingId('') }
  }

  return <main className="listing-page"><p className="eyebrow">SELLER AREA</p><h1>Company orders</h1><p className="form-intro">Manage incoming simulated purchases for your company.</p>{loading && <p className="status-message">Loading orders...</p>}{error && <p className="message error-message" role="alert">{error}</p>}{actionError && <p className="message error-message" role="alert">{actionError}</p>}{!loading && !error && orders.length === 0 && <div className="empty-card"><p>No incoming orders yet.</p></div>}<div className="orders-grid">{orders.map((order) => <article className="order-card" key={order._id}><OrderCard order={order} currentUser={{ id: order.seller._id }} onCancel={(id) => updateOrder(id, 'cancel')} /><div className="company-order-info"><p><strong>Buyer</strong> {order.buyer.name} · {order.buyer.email}</p><p><strong>Phone</strong> {order.buyerPhone}</p>{order.deliveryAddress && <p><strong>Address</strong> {order.deliveryAddress}</p>}</div>{getNextOrderStatuses(order).length > 0 && <div className="status-controls">{getNextOrderStatuses(order).map((status) => <button className="outline-button" type="button" key={status} disabled={savingId === order._id} onClick={() => updateOrder(order._id, 'status', { status })}>Mark {ORDER_STATUS_LABELS[status]}</button>)}</div>}</article>)}</div></main>
}

export default CompanyOrders
