const mongoose = require('mongoose')
const CompanyProfile = require('../models/CompanyProfile')

const profileFields = [
  'companyName', 'description', 'phone', 'email', 'website', 'address',
  'paymentMethods', 'deliveryMethods', 'estimatedDeliveryText', 'logoPath',
]

function cleanProfileValues(body) {
  const values = {}
  profileFields.forEach((field) => {
    if (body[field] === undefined) return
    if (['paymentMethods', 'deliveryMethods'].includes(field)) {
      values[field] = Array.isArray(body[field]) ? body[field].filter((item) => typeof item === 'string').map((item) => item.trim()).filter(Boolean) : []
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
    return res.json({ companies })
  } catch (error) {
    return res.status(500).json({ message: 'Unable to load companies right now.' })
  }
}

async function getCompany(req, res) {
  if (!isValidId(req.params.id)) return res.status(400).json({ message: 'Please provide a valid company ID.' })
  try {
    const company = await CompanyProfile.findById(req.params.id).select('-__v')
    if (!company) return res.status(404).json({ message: 'Company profile not found.' })
    return res.json({ company })
  } catch (error) {
    return res.status(500).json({ message: 'Unable to load the company right now.' })
  }
}

async function getMyCompany(req, res) {
  const company = await CompanyProfile.findOne({ owner: req.user._id }).select('-__v')
  return res.json({ company })
}

async function saveMyCompany(req, res) {
  const values = cleanProfileValues(req.body)
  values.owner = req.user._id
  try {
    const company = await CompanyProfile.findOneAndUpdate(
      { owner: req.user._id },
      { $set: values },
      { returnDocument: 'after', upsert: true, runValidators: true, setDefaultsOnInsert: true },
    ).select('-__v')
    return res.json({ message: 'Company profile saved.', company })
  } catch (error) {
    if (error.name === 'ValidationError') {
      const firstError = Object.values(error.errors)[0]
      return res.status(400).json({ message: firstError?.message || 'Please complete the company profile.' })
    }
    return res.status(500).json({ message: 'Unable to save the company profile right now.' })
  }
}

module.exports = { getCompanies, getCompany, getMyCompany, saveMyCompany }
