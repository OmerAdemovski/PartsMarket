const mongoose = require('mongoose')
const Complaint = require('../models/Complaint')
const CompanyProfile = require('../models/CompanyProfile')
const Order = require('../models/Order')
const User = require('../models/User')
const { COMPLAINT_CATEGORIES } = require('../utils/complaintCategories')

const complaintOrderStatuses = ['accepted', 'preparing', 'ready-for-pickup', 'shipped', 'delivered', 'cancelled']

function complaintError(res, status, message) {
  return res.status(status).json({ message })
}

function isValidId(id) {
  return mongoose.isValidObjectId(id)
}

function cleanText(value, field, maxLength, required = true) {
  if (typeof value !== 'string') return required ? `${field} is required.` : ''
  const text = value.trim()
  if (required && !text) return `${field} is required.`
  if (text.length > maxLength) return `${field} cannot exceed ${maxLength} characters.`
  return ''
}

function complaintRole(complaint, userId) {
  const buyerId = complaint.buyer?._id || complaint.buyer
  const sellerId = complaint.seller?._id || complaint.seller
  if (String(buyerId) === String(userId)) return 'buyer'
  if (String(sellerId) === String(userId)) return 'company'
  return null
}

function populateComplaint(query) {
  return query.populate('buyer', 'name').populate('seller', 'name').populate('companyProfile', 'companyName').populate('order', 'productSnapshot status').populate('messages.sender', 'name')
}

function publicComplaint(complaint, viewerRole) {
  return {
    _id: complaint._id,
    orderId: complaint.order?._id || complaint.order,
    productTitle: complaint.order?.productSnapshot?.title || 'Ordered part',
    orderStatus: complaint.order?.status,
    buyerName: complaint.buyer?.name || 'Buyer',
    companyName: complaint.companyProfile?.companyName || 'Company',
    category: complaint.category,
    subject: complaint.subject,
    status: complaint.status,
    messages: complaint.messages.map((item) => ({ _id: item._id, senderName: item.sender?.name || 'Participant', senderRole: item.senderRole, message: item.message, createdAt: item.createdAt })),
    createdAt: complaint.createdAt,
    updatedAt: complaint.updatedAt,
    viewerRole,
  }
}

async function getComplaintForParticipant(id, userId) {
  if (!isValidId(id)) return { error: [400, 'Please provide a valid complaint ID.'] }
  const complaint = await populateComplaint(Complaint.findById(id))
  if (!complaint) return { error: [404, 'Complaint not found.'] }
  const viewerRole = complaintRole(complaint, userId)
  if (!viewerRole) return { error: [403, 'You cannot access this complaint.'] }
  return { complaint, viewerRole }
}

function parseOpeningComplaint(body) {
  if (!COMPLAINT_CATEGORIES.includes(body.category)) return { error: 'Please choose a valid complaint category.' }
  const subjectError = cleanText(body.subject, 'Subject', 120)
  if (subjectError) return { error: subjectError }
  const messageError = cleanText(body.message, 'Message', 2000)
  if (messageError) return { error: messageError }
  return { values: { category: body.category, subject: body.subject.trim(), message: body.message.trim() } }
}

async function getEligibleOrder(orderId, userId) {
  if (!isValidId(orderId)) return { error: [400, 'Please provide a valid order ID.'] }
  const order = await Order.findById(orderId)
  if (!order) return { error: [404, 'Order not found.'] }
  if (String(order.buyer) !== String(userId)) return { error: [403, 'Only the buyer can open a complaint.'] }
  if (order.status === 'pending') return { error: [400, 'Complaints are available after the company accepts the order.'] }
  if (!complaintOrderStatuses.includes(order.status)) return { error: [400, 'Only company orders can receive complaints.'] }
  if (!order.companyProfile || !order.seller || String(order.buyer) === String(order.seller)) return { error: [400, 'Only company orders can receive complaints.'] }
  const [seller, companyProfile] = await Promise.all([User.findById(order.seller).select('accountType'), CompanyProfile.findById(order.companyProfile)])
  if (!seller || seller.accountType !== 'company' || !companyProfile || String(companyProfile.owner) !== String(order.seller)) return { error: [400, 'Only company orders can receive complaints.'] }
  return { order }
}

async function createComplaint(req, res) {
  const parsed = parseOpeningComplaint(req.body)
  if (parsed.error) return complaintError(res, 400, parsed.error)
  try {
    const result = await getEligibleOrder(req.body.orderId, req.user._id)
    if (result.error) return complaintError(res, result.error[0], result.error[1])
    const { order } = result
    const complaint = await Complaint.create({ order: order._id, buyer: order.buyer, seller: order.seller, companyProfile: order.companyProfile, category: parsed.values.category, subject: parsed.values.subject, messages: [{ sender: order.buyer, senderRole: 'buyer', message: parsed.values.message }] })
    const loaded = await populateComplaint(Complaint.findById(complaint._id))
    return res.status(201).json({ message: 'Private complaint opened.', complaint: publicComplaint(loaded, 'buyer') })
  } catch (error) {
    if (error.code === 11000) return complaintError(res, 409, 'This order already has a complaint.')
    if (error.name === 'ValidationError') return complaintError(res, 400, Object.values(error.errors)[0]?.message || 'Please check the complaint details.')
    return complaintError(res, 500, 'Unable to open the complaint right now.')
  }
}

async function getMyComplaints(req, res) {
  try {
    const complaints = await populateComplaint(Complaint.find({ buyer: req.user._id }).sort({ updatedAt: -1 }))
    return res.json({ complaints: complaints.map((complaint) => publicComplaint(complaint, 'buyer')) })
  } catch (error) { return complaintError(res, 500, 'Unable to load your complaints right now.') }
}

async function getCompanyComplaints(req, res) {
  try {
    const complaints = await populateComplaint(Complaint.find({ seller: req.user._id }).sort({ updatedAt: -1 }))
    return res.json({ complaints: complaints.map((complaint) => publicComplaint(complaint, 'company')) })
  } catch (error) { return complaintError(res, 500, 'Unable to load company complaints right now.') }
}

async function getComplaint(req, res) {
  try {
    const result = await getComplaintForParticipant(req.params.id, req.user._id)
    if (result.error) return complaintError(res, result.error[0], result.error[1])
    return res.json({ complaint: publicComplaint(result.complaint, result.viewerRole) })
  } catch (error) { return complaintError(res, 500, 'Unable to load the complaint right now.') }
}

async function addMessage(req, res) {
  const messageError = cleanText(req.body.message, 'Message', 2000)
  if (messageError) return complaintError(res, 400, messageError)
  try {
    const result = await getComplaintForParticipant(req.params.id, req.user._id)
    if (result.error) return complaintError(res, result.error[0], result.error[1])
    const { complaint, viewerRole } = result
    if (complaint.status === 'resolved') return complaintError(res, 400, 'This complaint is resolved and no longer accepts messages.')
    complaint.messages.push({ sender: req.user._id, senderRole: viewerRole, message: req.body.message.trim() })
    if (viewerRole === 'company' && complaint.status === 'open') complaint.status = 'in-discussion'
    await complaint.save()
    const loaded = await populateComplaint(Complaint.findById(complaint._id))
    return res.status(201).json({ message: 'Message sent.', complaint: publicComplaint(loaded, viewerRole) })
  } catch (error) {
    if (error.name === 'ValidationError') return complaintError(res, 400, Object.values(error.errors)[0]?.message || 'Please check the message.')
    return complaintError(res, 500, 'Unable to send the message right now.')
  }
}

async function resolveComplaint(req, res) {
  try {
    const result = await getComplaintForParticipant(req.params.id, req.user._id)
    if (result.error) return complaintError(res, result.error[0], result.error[1])
    if (result.viewerRole !== 'buyer') return complaintError(res, 403, 'Only the buyer can resolve a complaint.')
    result.complaint.status = 'resolved'
    await result.complaint.save()
    const loaded = await populateComplaint(Complaint.findById(result.complaint._id))
    return res.json({ message: 'Complaint marked resolved.', complaint: publicComplaint(loaded, 'buyer') })
  } catch (error) { return complaintError(res, 500, 'Unable to resolve the complaint right now.') }
}

async function getOrderComplaint(req, res) {
  if (!isValidId(req.params.orderId)) return complaintError(res, 400, 'Please provide a valid order ID.')
  try {
    const order = await Order.findById(req.params.orderId).select('buyer seller')
    if (!order) return complaintError(res, 404, 'Order not found.')
    if (String(order.buyer) !== String(req.user._id) && String(order.seller) !== String(req.user._id)) return complaintError(res, 403, 'You cannot access this order complaint.')
    const complaint = await Complaint.findOne({ order: order._id })
    if (!complaint) return res.json({ complaint: null })
    const loaded = await populateComplaint(Complaint.findById(complaint._id))
    return res.json({ complaint: publicComplaint(loaded, complaintRole(loaded, req.user._id)) })
  } catch (error) { return complaintError(res, 500, 'Unable to load the order complaint right now.') }
}

module.exports = { createComplaint, getMyComplaints, getCompanyComplaints, getComplaint, addMessage, resolveComplaint, getOrderComplaint, parseOpeningComplaint, complaintRole, complaintOrderStatuses }
