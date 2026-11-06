import { useEffect, useState } from 'react'
import OrderCard from '../components/OrderCard.jsx'
import { API_BASE_URL } from '../utils/parts.js'

function MyOrders({ onAuthExpired }) {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionError, setActionError] = useState('')

  useEffect(() => {
    async function loadOrders() {
      try {
        const response = await fetch(`${API_BASE_URL}/api/orders/my-orders`, { credentials: 'include' })
        if (response.status === 401) { onAuthExpired(); return }
        const data = await response.json()
        if (!response.ok) throw new Error(data.message || 'Unable to load your orders.')
        setOrders(data.orders || [])
      } catch (requestError) { setError(requestError.message || 'Unable to load your orders right now.')
      } finally { setLoading(false) }
    }
    loadOrders()
  }, [onAuthExpired])

  async function cancelOrder(orderId) {
    setActionError('')
    try {
      const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}/cancel`, { method: 'PATCH', credentials: 'include' })
      if (response.status === 401) { onAuthExpired(); return }
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Unable to cancel the order.')
      setOrders((current) => current.map((order) => order._id === orderId ? data.order : order))
    } catch (requestError) { setActionError(requestError.message || 'Unable to cancel the order right now.') }
  }

  return <main className="listing-page"><p className="eyebrow">YOUR PURCHASES</p><h1>My orders</h1><p className="form-intro">Review your simulated company-listing purchases.</p>{loading && <p className="status-message">Loading orders...</p>}{error && <p className="message error-message" role="alert">{error}</p>}{actionError && <p className="message error-message" role="alert">{actionError}</p>}{!loading && !error && orders.length === 0 && <div className="empty-card"><p>You have no orders yet.</p></div>}<div className="orders-grid">{orders.map((order) => <OrderCard key={order._id} order={order} onCancel={cancelOrder} />)}</div></main>
}

export default MyOrders
