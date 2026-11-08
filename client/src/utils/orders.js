export const ORDER_STATUS_LABELS = {
  pending: 'Pending', accepted: 'Accepted', preparing: 'Preparing', 'ready-for-pickup': 'Ready for pickup', shipped: 'Shipped', delivered: 'Delivered', cancelled: 'Cancelled',
}

export function getOrderStatusFlow(deliveryMethod) {
  return deliveryMethod === 'pickup'
    ? ['pending', 'accepted', 'preparing', 'ready-for-pickup', 'delivered']
    : ['pending', 'accepted', 'preparing', 'shipped', 'delivered']
}

export function getNextOrderStatuses(order) {
  if (order.status === 'pending') return ['accepted']
  if (order.status === 'accepted') return ['preparing']
  if (order.status === 'preparing') return [order.deliveryMethod === 'pickup' ? 'ready-for-pickup' : 'shipped']
  if (order.status === 'ready-for-pickup' || order.status === 'shipped') return ['delivered']
  return []
}

export function formatMoney(value) {
  return `$${Number(value || 0).toFixed(2)}`
}

export function canCancelOrder(order, currentUser) {
  const userId = currentUser?.id || currentUser?._id
  const buyerId = order?.buyer?._id || order?.buyer
  const sellerId = order?.seller?._id || order?.seller
  return (String(userId) === String(buyerId) && order.status === 'pending') || (String(userId) === String(sellerId) && ['pending', 'accepted'].includes(order.status))
}
