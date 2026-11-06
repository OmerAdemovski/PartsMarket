export const ORDER_STATUS_LABELS = {
  pending: 'Pending', accepted: 'Accepted', preparing: 'Preparing', 'ready-for-pickup': 'Ready for pickup', shipped: 'Shipped', delivered: 'Delivered', cancelled: 'Cancelled',
}

export const ORDER_STATUS_FLOW = ['pending', 'accepted', 'preparing', 'ready-for-pickup', 'shipped', 'delivered']

export function formatMoney(value) {
  return `$${Number(value || 0).toFixed(2)}`
}

export function canCancelOrder(order, currentUser) {
  const userId = currentUser?.id || currentUser?._id
  const buyerId = order?.buyer?._id || order?.buyer
  const sellerId = order?.seller?._id || order?.seller
  return (String(userId) === String(buyerId) && order.status === 'pending') || (String(userId) === String(sellerId) && ['pending', 'accepted'].includes(order.status))
}
