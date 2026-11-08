const DELIVERY_METHODS = ['company-delivery', 'pickup']
const PAYMENT_METHODS = ['cash-on-delivery', 'pay-at-pickup', 'bank-transfer']

function isExactMethodList(value, allowed) {
  return Array.isArray(value) && value.length > 0 && value.every((item) => typeof item === 'string' && allowed.includes(item))
}

module.exports = { DELIVERY_METHODS, PAYMENT_METHODS, isExactMethodList }
