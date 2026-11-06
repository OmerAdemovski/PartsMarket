import { Link } from 'react-router-dom'
import { canCancelOrder, formatMoney, ORDER_STATUS_LABELS } from '../utils/orders.js'

function OrderCard({ order, currentUser, onCancel }) {
  return <article className="order-card"><div className="order-card-heading"><div><p className="eyebrow">ORDER {order._id.slice(-8).toUpperCase()}</p><h2>{order.productSnapshot.title}</h2></div><span className={`order-status status-${order.status}`}>{ORDER_STATUS_LABELS[order.status]}</span></div><p className="part-meta">{order.companySnapshot.companyName} · {order.quantity} item{order.quantity === 1 ? '' : 's'}</p><p className="order-total">{formatMoney(order.total)}</p><div className="order-card-actions"><Link className="outline-button" to={`/orders/${order._id}`}>View details</Link>{canCancelOrder(order, currentUser) && <button className="danger-button" type="button" onClick={() => onCancel(order._id)}>Cancel order</button>}</div></article>
}

export default OrderCard
