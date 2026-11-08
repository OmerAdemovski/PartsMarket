const mongoose = require('mongoose')
const CompanyProfile = require('../models/CompanyProfile')
const { DELIVERY_METHODS, PAYMENT_METHODS, isExactMethodList } = require('../utils/companyMethods')
const { isCompleteCompanyProfile } = require('../utils/companyProfile')
const { getCompanyReviewSummary, getCompanyReviewSummaries } = require('../utils/reviewSummary')

function withCompleteness(company, reviewSummary) {
  if (!company) return null
  return { ...company.toObject(), complete: isCompleteCompanyProfile(company), reviewSummary, averageRating: reviewSummary.averageRating, totalReviews: reviewSummary.totalReviews, reviewCount: reviewSummary.totalReviews, ratingDistribution: reviewSummary.ratingDistribution }
}

const profileFields = [
  'companyName', 'description', 'phone', 'email', 'website', 'address',
  'paymentMethods', 'deliveryMethods', 'estimatedDeliveryText', 'logoPath',
]

function cleanProfileValues(body) {
  const values = {}
  profileFields.forEach((field) => {
    if (body[field] === undefined) return
    if (['paymentMethods', 'deliveryMethods'].includes(field)) {
      values[field] = body[field]
    } else {
      values[field] = typeof body[field] === 'string' ? body[field].trim() : body[field]
    }
  })
  return values
}

function isValidId(id) {
  return mongoose.isValidObjectId(id)
}

async function getCompanies(req, res) {
  try {
    const companies = await CompanyProfile.find().sort({ companyName: 1 }).select('-__v')
    const summaries = await getCompanyReviewSummaries(companies.map((company) => company._id))
    return res.json({ companies: companies.map((company) => withCompleteness(company, summaries.get(String(company._id)))) })
  } catch (error) {
    return res.status(500).json({ message: 'Unable to load companies right now.' })
  }
}

async function getCompany(req, res) {
  if (!isValidId(req.params.id)) return res.status(400).json({ message: 'Please provide a valid company ID.' })
  try {
    const company = await CompanyProfile.findById(req.params.id).select('-__v')
    if (!company) return res.status(404).json({ message: 'Company profile not found.' })
    return res.json({ company: withCompleteness(company, await getCompanyReviewSummary(company._id)) })
  } catch (error) {
    return res.status(500).json({ message: 'Unable to load the company right now.' })
  }
}

async function getCompanyByOwner(req, res) {
  if (!isValidId(req.params.ownerId)) return res.status(400).json({ message: 'Please provide a valid company owner ID.' })
  try {
    const company = await CompanyProfile.findOne({ owner: req.params.ownerId }).select('-__v')
    if (!company) return res.status(404).json({ message: 'Seller must complete company settings before checkout.' })
    return res.json({ company: withCompleteness(company, await getCompanyReviewSummary(company._id)) })
  } catch (error) {
    return res.status(500).json({ message: 'Unable to load the company right now.' })
  }
}

async function getMyCompany(req, res) {
  const company = await CompanyProfile.findOne({ owner: req.user._id }).select('-__v')
  return res.json({ company: company ? withCompleteness(company, await getCompanyReviewSummary(company._id)) : null })
}

async function saveMyCompany(req, res) {
  const values = cleanProfileValues(req.body)
  values.owner = req.user._id
  if (!isExactMethodList(values.deliveryMethods, DELIVERY_METHODS)) return res.status(400).json({ message: 'Choose at least one valid delivery method.' })
  if (!isExactMethodList(values.paymentMethods, PAYMENT_METHODS)) return res.status(400).json({ message: 'Choose at least one valid payment method.' })
  try {
    const company = await CompanyProfile.findOneAndUpdate(
      { owner: req.user._id },
      { $set: values },
      { returnDocument: 'after', upsert: true, runValidators: true, setDefaultsOnInsert: true },
    ).select('-__v')
    return res.json({ message: 'Company profile saved.', company: withCompleteness(company, await getCompanyReviewSummary(company._id)) })
  } catch (error) {
    if (error.name === 'ValidationError') {
      const firstError = Object.values(error.errors)[0]
      return res.status(400).json({ message: firstError?.message || 'Please complete the company profile.' })
    }
    return res.status(500).json({ message: 'Unable to save the company profile right now.' })
  }
}

module.exports = { getCompanies, getCompany, getCompanyByOwner, getMyCompany, saveMyCompany }
