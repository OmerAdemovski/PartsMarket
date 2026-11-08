import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { API_BASE_URL, getImageUrl } from '../utils/parts.js'
import { formatMoney } from '../utils/orders.js'
import { DELIVERY_METHODS, PAYMENT_METHODS, methodLabel, validMethodValues } from '../utils/companyMethods.js'

function deliveryChoices(methods = []) {
  return validMethodValues(methods, DELIVERY_METHODS)
}

function Checkout({ onAuthExpired }) {
  const { partId } = useParams()
  const navigate = useNavigate()
  const [part, setPart] = useState(null)
  const [company, setCompany] = useState(null)
  const [form, setForm] = useState({ quantity: 1, deliveryMethod: '', paymentMethod: '', deliveryAddress: '', buyerPhone: '', buyerNotes: '' })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [validationError, setValidationError] = useState('')
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  useEffect(() => {
    async function loadCheckout() {
      try {
        const partResponse = await fetch(`${API_BASE_URL}/api/parts/${partId}`)
        const partData = await partResponse.json()
        if (!partResponse.ok) throw new Error(partData.message || 'Unable to load this product.')
        if (partData.part.sellerType !== 'company') throw new Error('Only company listings support simulated checkout.')
        const companyResponse = await fetch(`${API_BASE_URL}/api/companies/owner/${partData.part.seller._id}`)
        const companyData = await companyResponse.json()
        if (!companyResponse.ok) throw new Error(companyData.message || 'Unable to load the company profile.')
        const deliveries = deliveryChoices(companyData.company.deliveryMethods)
        const payments = validMethodValues(companyData.company.paymentMethods, PAYMENT_METHODS)
        if (!companyData.company.complete || !deliveries.length || !payments.length) throw new Error('Checkout is temporarily unavailable. The seller must update their company delivery and payment settings.')
        setPart(partData.part); setCompany({ ...companyData.company, paymentMethods: payments }); setForm((current) => ({ ...current, deliveryMethod: deliveries[0] || '', paymentMethod: payments[0] || '' }))
      } catch (requestError) { setError(requestError.message || 'Unable to load checkout right now.')
      } finally { setLoading(false) }
    }
    loadCheckout()
  }, [partId, onAuthExpired])

  function updateField(event) { setForm((current) => ({ ...current, [event.target.name]: event.target.value })) }

  async function handleSubmit(event) {
    event.preventDefault(); setValidationError(''); setError(''); setResult(null)
    if (!form.deliveryMethod || !form.paymentMethod || !form.buyerPhone.trim()) { setValidationError('Please choose delivery and payment methods and enter your phone number.'); return }
    if (form.deliveryMethod === 'company-delivery' && !form.deliveryAddress.trim()) { setValidationError('Please enter a delivery address.'); return }
    if (!Number.isInteger(Number(form.quantity)) || Number(form.quantity) < 1 || Number(form.quantity) > (part.stockQuantity ?? 1)) { setValidationError('Please choose a quantity available in stock.'); return }
    setSubmitting(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/orders`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ partId, ...form, quantity: Number(form.quantity) }) })
      if (response.status === 401) { onAuthExpired(); return }
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Unable to create the order.')
      setResult(data); setTimeout(() => navigate(`/orders/${data.order._id}`), 900)
    } catch (requestError) { setError(requestError.message || 'Unable to create the order right now.')
    } finally { setSubmitting(false) }
  }

  if (loading) return <main className="form-page"><p className="status-message">Loading checkout...</p></main>
  if (error && !part) return <main className="form-page"><div className="form-card"><p className="message error-message" role="alert">{error}</p><Link to="/parts">Back to parts</Link></div></main>
  if (!part || !company) return null
  const deliveries = deliveryChoices(company.deliveryMethods)
  return <main className="form-page"><div className="form-card wide-form-card"><p className="eyebrow">SIMULATED CHECKOUT</p><h1>Buy this part</h1><p className="demo-notice">Demonstration checkout — no real payment is processed.</p>{error && <p className="message error-message" role="alert">{error}</p>}{validationError && <p className="message error-message" role="alert">{validationError}</p>}{result && <p className="message success-message" role="status">Order created. Opening your order details...</p>}<div className="checkout-summary">{part.imagePath && <img src={getImageUrl(part.imagePath)} alt={part.title} />}<div><h2>{part.title}</h2><p>{company.companyName}</p><p>{formatMoney(part.price)} each · {part.stockQuantity ?? 1} available</p></div></div><form className="part-form" onSubmit={handleSubmit}><div className="form-grid"><label>Quantity *<input name="quantity" type="number" min="1" max={part.stockQuantity ?? 1} value={form.quantity} onChange={updateField} /></label><label>Delivery method *<select name="deliveryMethod" value={form.deliveryMethod} onChange={updateField}><option value="">Choose delivery</option>{deliveries.map((method) => <option key={method} value={method}>{methodLabel(method, DELIVERY_METHODS)}</option>)}</select></label><label>Payment method *<select name="paymentMethod" value={form.paymentMethod} onChange={updateField}><option value="">Choose payment</option>{company.paymentMethods.map((method) => <option key={method} value={method}>{methodLabel(method, PAYMENT_METHODS)}</option>)}</select></label><label>Buyer phone *<input name="buyerPhone" value={form.buyerPhone} onChange={updateField} /></label></div>{form.deliveryMethod === 'company-delivery' && <label>Delivery address *<textarea name="deliveryAddress" rows="3" value={form.deliveryAddress} onChange={updateField} /></label>}<label>Notes (optional)<textarea name="buyerNotes" rows="3" value={form.buyerNotes} onChange={updateField} /></label><button className="primary-button form-button" type="submit" disabled={submitting}>{submitting ? 'Creating order...' : 'Place demonstration order'}</button></form></div></main>
}

export default Checkout
