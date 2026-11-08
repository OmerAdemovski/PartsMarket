const mongoose = require('mongoose')
const CompanyProfile = require('../models/CompanyProfile')
const Order = require('../models/Order')
const Part = require('../models/Part')
const { DELIVERY_METHODS, PAYMENT_METHODS } = require('../utils/companyMethods')
const { ORDER_STATUSES, isAllowedStatusTransition } = require('../utils/orderStatus')
const { isCompleteCompanyProfile } = require('../utils/companyProfile')

function isValidId(id) {
  return mongoose.isValidObjectId(id)
}

function getDemoDeliveryFee() {
  const fee = Number(process.env.DEMO_DELIVERY_FEE)
  return Number.isFinite(fee) && fee >= 0 ? fee : 15
}

function hasMethod(methods, requested) {
  return Array.isArray(methods) && methods.includes(requested) && DELIVERY_METHODS.includes(requested)
}

function hasPaymentMethod(methods, requested) {
  const wanted = requested.trim().toLowerCase()
  return Array.isArray(methods) && PAYMENT_METHODS.includes(wanted) && methods.includes(wanted)
}

function safePopulate(query) {
  return query.populate('buyer', 'name email accountType').populate('seller', 'name email accountType').populate('companyProfile', 'companyName address phone email deliveryMethods paymentMethods')
}

function orderError(res, status, message) {
  return res.status(status).json({ message })
}

async function createOrder(req, res) {
  const { partId, quantity, deliveryMethod, paymentMethod, deliveryAddress, buyerPhone, buyerNotes } = req.body
  const requestedQuantity = Number(quantity)
  if (!isValidId(partId)) return orderError(res, 400, 'Please choose a valid part listing.')
  if (!Number.isInteger(requestedQuantity) || requestedQuantity < 1) return orderError(res, 400, 'Quantity must be a positive whole number.')
  if (!['company-delivery', 'pickup'].includes(deliveryMethod)) return orderError(res, 400, 'Please choose company delivery or pickup.')
  if (typeof buyerPhone !== 'string' || !buyerPhone.trim()) return orderError(res, 400, 'A buyer phone number is required.')
  if (deliveryMethod === 'company-delivery' && (typeof deliveryAddress !== 'string' || !deliveryAddress.trim())) return orderError(res, 400, 'A delivery address is required for company delivery.')

  try {
    const part = await Part.findById(partId).populate('seller', 'accountType')
    if (!part) return orderError(res, 404, 'Part listing not found.')
    if ((part.sellerType || 'individual') !== 'company' || part.seller?.accountType !== 'company') return orderError(res, 400, 'Only company listings support simulated checkout.')
    if (String(part.seller._id) === String(req.user._id)) return orderError(res, 403, 'You cannot buy your own listing.')

    const companyProfile = await CompanyProfile.findOne({ owner: part.seller._id })
    if (!isCompleteCompanyProfile(companyProfile)) return orderError(res, 400, 'Seller must complete company settings before checkout.')
    if (!hasMethod(companyProfile.deliveryMethods, deliveryMethod)) return orderError(res, 400, 'That delivery method is not available for this company.')
    if (typeof paymentMethod !== 'string' || !PAYMENT_METHODS.includes(paymentMethod) || !hasPaymentMethod(companyProfile.paymentMethods, paymentMethod)) return orderError(res, 400, 'That payment method is not available for this company.')

    const currentStock = Number.isInteger(part.stockQuantity) ? part.stockQuantity : 1
    if (requestedQuantity > currentStock) return orderError(res, 400, 'There is not enough stock for that quantity.')
    const storedStock = await Part.exists({ _id: part._id, stockQuantity: { $exists: true } })
    if (!storedStock) await Part.updateOne({ _id: part._id, stockQuantity: { $exists: false } }, { $set: { stockQuantity: 1 } })
    const updatedPart = await Part.findOneAndUpdate({ _id: part._id, stockQuantity: { $gte: requestedQuantity } }, { $inc: { stockQuantity: -requestedQuantity } }, { returnDocument: 'after' })
    if (!updatedPart) return orderError(res, 400, 'The requested quantity is no longer available.')

    const unitPrice = Number(part.price)
    const subtotal = Number((unitPrice * requestedQuantity).toFixed(2))
    const deliveryFee = deliveryMethod === 'company-delivery' ? getDemoDeliveryFee() : 0
    const total = Number((subtotal + deliveryFee).toFixed(2))
    try {
      const order = await Order.create({
        buyer: req.user._id,
        seller: part.seller._id,
        companyProfile: companyProfile._id,
        part: part._id,
        productSnapshot: { title: part.title, imagePath: part.imagePath, partNumber: part.partNumber, brand: part.carBrand, model: part.carModel },
        companySnapshot: { companyName: companyProfile.companyName, address: companyProfile.address, phone: companyProfile.phone, email: companyProfile.email },
        quantity: requestedQuantity, unitPrice, subtotal, deliveryMethod, deliveryFee, total, paymentMethod, deliveryAddress: deliveryMethod === 'company-delivery' ? deliveryAddress.trim() : '', buyerPhone: buyerPhone.trim(), buyerNotes: typeof buyerNotes === 'string' ? buyerNotes.trim() : '',
      })
      const savedOrder = await safePopulate(Order.findById(order._id))
      return res.status(201).json({ message: 'Demonstration order created.', order: savedOrder, priceBreakdown: { unitPrice, quantity: requestedQuantity, subtotal, deliveryFee, total } })
    } catch (error) {
      await Part.updateOne({ _id: part._id }, { $inc: { stockQuantity: requestedQuantity } })
      throw error
    }
  } catch (error) {
    if (error.name === 'ValidationError') return orderError(res, 400, 'Please check the order details and try again.')
    return orderError(res, 500, 'Unable to create the order right now.')
  }
}

async function getMyOrders(req, res) {
  try { return res.json({ orders: await safePopulate(Order.find({ buyer: req.user._id }).sort({ createdAt: -1 })) }) } catch (error) { return orderError(res, 500, 'Unable to load your orders right now.') }
}

async function getCompanyOrders(req, res) {
  try { return res.json({ orders: await safePopulate(Order.find({ seller: req.user._id }).sort({ createdAt: -1 })) }) } catch (error) { return orderError(res, 500, 'Unable to load company orders right now.') }
}

async function getOrder(req, res) {
  if (!isValidId(req.params.id)) return orderError(res, 400, 'Please provide a valid order ID.')
  try {
    const order = await safePopulate(Order.findById(req.params.id))
    if (!order) return orderError(res, 404, 'Order not found.')
    if (String(order.buyer._id) !== String(req.user._id) && String(order.seller._id) !== String(req.user._id)) return orderError(res, 403, 'You cannot view this order.')
    return res.json({ order })
  } catch (error) { return orderError(res, 500, 'Unable to load the order right now.') }
}

async function updateOrderStatus(req, res) {
  if (!isValidId(req.params.id)) return orderError(res, 400, 'Please provide a valid order ID.')
  const nextStatus = req.body.status
  if (!ORDER_STATUSES.includes(nextStatus) || nextStatus === 'cancelled') return orderError(res, 400, 'Please choose a valid next order status.')
  try {
    const order = await Order.findById(req.params.id)
    if (!order) return orderError(res, 404, 'Order not found.')
    if (String(order.seller) !== String(req.user._id)) return orderError(res, 403, 'Only the selling company can update this order.')
    if (!isAllowedStatusTransition(order.deliveryMethod, order.status, nextStatus)) return orderError(res, 400, `An order cannot move from ${order.status} to ${nextStatus}.`)
    order.status = nextStatus
    await order.save()
    return res.json({ message: 'Order status updated.', order: await safePopulate(Order.findById(order._id)) })
  } catch (error) { return orderError(res, 500, 'Unable to update the order right now.') }
}

async function cancelOrder(req, res) {
  if (!isValidId(req.params.id)) return orderError(res, 400, 'Please provide a valid order ID.')
  try {
    const order = await Order.findById(req.params.id)
    if (!order) return orderError(res, 404, 'Order not found.')
    const isBuyer = String(order.buyer) === String(req.user._id)
    const isSeller = String(order.seller) === String(req.user._id)
    if (!isBuyer && !isSeller) return orderError(res, 403, 'You cannot cancel this order.')
    if ((isBuyer && order.status !== 'pending') || (isSeller && !['pending', 'accepted'].includes(order.status))) return orderError(res, 400, 'This order cannot be cancelled in its current status.')
    const changed = await Order.findOneAndUpdate({ _id: order._id, stockRestored: false, status: order.status }, { $set: { status: 'cancelled', stockRestored: true, cancelledAt: new Date() } }, { returnDocument: 'after' })
    if (!changed) return orderError(res, 400, 'This order has already been cancelled or changed.')
    await Part.updateOne({ _id: order.part }, { $inc: { stockQuantity: order.quantity } })
    return res.json({ message: 'Order cancelled and stock restored.', order: await safePopulate(Order.findById(order._id)) })
  } catch (error) { return orderError(res, 500, 'Unable to cancel the order right now.') }
}

module.exports = { createOrder, getMyOrders, getCompanyOrders, getOrder, updateOrderStatus, cancelOrder }
