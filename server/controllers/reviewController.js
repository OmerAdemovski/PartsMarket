const mongoose = require('mongoose')
const CompanyProfile = require('../models/CompanyProfile')
const Order = require('../models/Order')
const Review = require('../models/Review')
const User = require('../models/User')
const { getCompanyReviewSummary } = require('../utils/reviewSummary')

function reviewError(res, status, message) {
  return res.status(status).json({ message })
}

function publicReview(review) {
  return {
    _id: review._id,
    reviewerName: review.reviewer?.name || 'PartsMarket buyer',
    rating: review.rating,
    comment: review.comment || '',
    createdAt: review.createdAt,
    updatedAt: review.updatedAt,
    verifiedPurchase: true,
  }
}

function parseReviewInput(body) {
  const rating = typeof body.rating === 'number' ? body.rating : Number(body.rating)
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) return { error: 'Rating must be a whole number from 1 to 5.' }
  if (body.comment !== undefined && typeof body.comment !== 'string') return { error: 'Comment must be text.' }
  const comment = typeof body.comment === 'string' ? body.comment.trim() : ''
  if (comment.length > 1000) return { error: 'Comment cannot exceed 1000 characters.' }
  return { values: { rating, comment } }
}

async function getDeliveredCompanyOrder(orderId, userId) {
  if (!mongoose.isValidObjectId(orderId)) return { error: [400, 'Please provide a valid order ID.'] }
  const order = await Order.findById(orderId)
  if (!order) return { error: [404, 'Order not found.'] }
  if (String(order.buyer) !== String(userId)) return { error: [403, 'Only the buyer can review this order.'] }
  if (order.status !== 'delivered') return { error: [400, 'Reviews are available only after a company order is delivered.'] }
  if (!order.companyProfile || !order.seller || String(order.buyer) === String(order.seller)) return { error: [400, 'Only delivered company orders can be reviewed.'] }
  const [seller, companyProfile] = await Promise.all([
    User.findById(order.seller).select('accountType'),
    CompanyProfile.findById(order.companyProfile),
  ])
  if (!seller || seller.accountType !== 'company' || !companyProfile || String(companyProfile.owner) !== String(order.seller)) return { error: [400, 'Only delivered company orders can be reviewed.'] }
  return { order }
}

async function createReview(req, res) {
  const parsed = parseReviewInput(req.body)
  if (parsed.error) return reviewError(res, 400, parsed.error)
  try {
    const result = await getDeliveredCompanyOrder(req.body.orderId, req.user._id)
    if (result.error) return reviewError(res, result.error[0], result.error[1])
    const { order } = result
    const review = await Review.create({ order: order._id, reviewer: order.buyer, seller: order.seller, companyProfile: order.companyProfile, part: order.part, ...parsed.values })
    return res.status(201).json({ message: 'Verified review saved.', review: publicReview(await Review.findById(review._id).populate('reviewer', 'name')) })
  } catch (error) {
    if (error.code === 11000) return reviewError(res, 409, 'This order already has a review.')
    if (error.name === 'ValidationError') return reviewError(res, 400, Object.values(error.errors)[0]?.message || 'Please check the review details.')
    return reviewError(res, 500, 'Unable to save the review right now.')
  }
}

async function updateReview(req, res) {
  const parsed = parseReviewInput(req.body)
  if (parsed.error) return reviewError(res, 400, parsed.error)
  if (!mongoose.isValidObjectId(req.params.id)) return reviewError(res, 400, 'Please provide a valid review ID.')
  try {
    const review = await Review.findById(req.params.id)
    if (!review) return reviewError(res, 404, 'Review not found.')
    if (String(review.reviewer) !== String(req.user._id)) return reviewError(res, 403, 'Only the buyer can edit this review.')
    Object.assign(review, parsed.values)
    await review.save()
    return res.json({ message: 'Review updated.', review: publicReview(await Review.findById(review._id).populate('reviewer', 'name')) })
  } catch (error) {
    if (error.name === 'ValidationError') return reviewError(res, 400, Object.values(error.errors)[0]?.message || 'Please check the review details.')
    return reviewError(res, 500, 'Unable to update the review right now.')
  }
}

async function deleteReview(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) return reviewError(res, 400, 'Please provide a valid review ID.')
  try {
    const review = await Review.findById(req.params.id)
    if (!review) return reviewError(res, 404, 'Review not found.')
    if (String(review.reviewer) !== String(req.user._id)) return reviewError(res, 403, 'Only the buyer can delete this review.')
    await review.deleteOne()
    return res.json({ message: 'Review deleted.' })
  } catch (error) { return reviewError(res, 500, 'Unable to delete the review right now.') }
}

async function getCompanyReviews(req, res) {
  if (!mongoose.isValidObjectId(req.params.companyId)) return reviewError(res, 400, 'Please provide a valid company ID.')
  try {
    const company = await CompanyProfile.findById(req.params.companyId).select('_id')
    if (!company) return reviewError(res, 404, 'Company profile not found.')
    const reviews = await Review.find({ companyProfile: company._id }).sort({ createdAt: -1 }).populate('reviewer', 'name')
    const summary = await getCompanyReviewSummary(company._id)
    return res.json({ companyId: company._id, ...summary, summary, reviews: reviews.map(publicReview) })
  } catch (error) { return reviewError(res, 500, 'Unable to load company reviews right now.') }
}

async function getOrderReview(req, res) {
  if (!mongoose.isValidObjectId(req.params.orderId)) return reviewError(res, 400, 'Please provide a valid order ID.')
  try {
    const order = await Order.findById(req.params.orderId).select('buyer')
    if (!order) return reviewError(res, 404, 'Order not found.')
    if (String(order.buyer) !== String(req.user._id)) return reviewError(res, 403, 'Only the buyer can view this review.')
    const review = await Review.findOne({ order: order._id }).populate('reviewer', 'name')
    return res.json({ review: review ? publicReview(review) : null })
  } catch (error) { return reviewError(res, 500, 'Unable to load the order review right now.') }
}

module.exports = { createReview, updateReview, deleteReview, getCompanyReviews, getOrderReview }
