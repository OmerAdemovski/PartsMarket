export const DELIVERY_METHODS = [
  { value: 'company-delivery', label: 'Company delivery' },
  { value: 'pickup', label: 'Customer pickup' },
]

export const PAYMENT_METHODS = [
  { value: 'cash-on-delivery', label: 'Cash on delivery' },
  { value: 'pay-at-pickup', label: 'Pay at pickup' },
  { value: 'bank-transfer', label: 'Bank transfer/invoice' },
]

export function validMethodValues(values, options) {
  const allowed = options.map((option) => option.value)
  return Array.isArray(values) ? values.filter((value) => allowed.includes(value)) : []
}

export function methodLabel(value, options) {
  return options.find((option) => option.value === value)?.label || ''
}
