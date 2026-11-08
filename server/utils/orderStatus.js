const ORDER_STATUSES = ['pending', 'accepted', 'preparing', 'ready-for-pickup', 'shipped', 'delivered', 'cancelled']

const COMMON_TRANSITIONS = {
  pending: ['accepted', 'cancelled'],
  accepted: ['preparing', 'cancelled'],
  delivered: [],
  cancelled: [],
}

function getAllowedNextStatuses(deliveryMethod, currentStatus) {
  if (currentStatus === 'preparing') return deliveryMethod === 'pickup' ? ['ready-for-pickup'] : ['shipped']
  if (currentStatus === 'ready-for-pickup' || currentStatus === 'shipped') return ['delivered']
  return COMMON_TRANSITIONS[currentStatus] || []
}

function isAllowedStatusTransition(deliveryMethod, currentStatus, nextStatus) {
  return getAllowedNextStatuses(deliveryMethod, currentStatus).includes(nextStatus)
}

module.exports = { ORDER_STATUSES, getAllowedNextStatuses, isAllowedStatusTransition }
