const { DELIVERY_METHODS, PAYMENT_METHODS, isExactMethodList } = require('./companyMethods')

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function isCompleteCompanyProfile(profile) {
  if (!profile) return false
  const requiredText = ['companyName', 'description', 'phone', 'address']
  const hasRequiredText = requiredText.every((field) => typeof profile[field] === 'string' && profile[field].trim())
  const hasBusinessEmail = typeof profile.email === 'string' && isValidEmail(profile.email.trim())
  return hasRequiredText && hasBusinessEmail && isExactMethodList(profile.deliveryMethods, DELIVERY_METHODS) && isExactMethodList(profile.paymentMethods, PAYMENT_METHODS)
}

module.exports = { isCompleteCompanyProfile }
