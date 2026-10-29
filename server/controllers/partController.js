const fs = require('fs')
const path = require('path')
const mongoose = require('mongoose')
const Part = require('../models/Part')
const { removeUploadedFile } = require('../middleware/uploadMiddleware')
const { brands, categories, qualities, isSupportedCategory, isValidSubcategory } = require('../utils/catalogue')

const editableFields = ['title', 'description', 'price', 'category', 'subcategory', 'condition', 'carBrand', 'carModel', 'vehicleYearFrom', 'vehicleYearTo', 'partNumber', 'quality', 'location', 'city', 'contact']

function isValidPartId(id) {
  return mongoose.isValidObjectId(id)
}

function getPartValues(body) {
  const values = {}

  editableFields.forEach((field) => {
    if (body[field] === undefined) return
    values[field] = typeof body[field] === 'string' ? body[field].trim() : body[field]
  })

  if (values.price !== undefined && values.price !== '') {
    values.price = Number(values.price)
  }

  ;['vehicleYearFrom', 'vehicleYearTo'].forEach((field) => {
    if (values[field] === '') delete values[field]
    else if (values[field] !== undefined) values[field] = Number(values[field])
  })
  ;['subcategory', 'partNumber', 'quality', 'city'].forEach((field) => {
    if (values[field] === '') delete values[field]
  })

  return values
}

function validatePartValues(values) {
  if (values.price !== undefined && (!Number.isFinite(values.price) || values.price <= 0)) return 'Price must be a positive number.'
  if (values.carBrand && !brands.includes(values.carBrand)) return 'Please choose a supported vehicle brand.'
  if (values.category && !isSupportedCategory(values.category)) return 'Please choose a supported catalogue category.'
  if (values.subcategory && (!values.category || !isValidSubcategory(values.category, values.subcategory))) return 'Please choose a subcategory that belongs to the selected category.'
  if (values.quality && !qualities.includes(values.quality)) return 'Please choose a supported quality.'
  if (values.vehicleYearFrom !== undefined && (!Number.isInteger(values.vehicleYearFrom) || values.vehicleYearFrom < 1900 || values.vehicleYearFrom > 2100)) return 'Please enter a valid starting vehicle year.'
  if (values.vehicleYearTo !== undefined && (!Number.isInteger(values.vehicleYearTo) || values.vehicleYearTo < 1900 || values.vehicleYearTo > 2100)) return 'Please enter a valid ending vehicle year.'
  if (values.vehicleYearFrom !== undefined && values.vehicleYearTo !== undefined && values.vehicleYearTo < values.vehicleYearFrom) return 'The ending vehicle year must be the same as or later than the starting year.'
  return ''
}

function validateUpdatedPartValues(values, existingPart) {
  const validationValues = { ...values }
  if (existingPart.carBrand && values.carBrand === existingPart.carBrand && !brands.includes(existingPart.carBrand)) delete validationValues.carBrand
  if (existingPart.category && values.category === existingPart.category && !isSupportedCategory(existingPart.category)) delete validationValues.category
  if (existingPart.subcategory && values.subcategory === existingPart.subcategory && !isValidSubcategory(existingPart.category, existingPart.subcategory)) delete validationValues.subcategory
  return validatePartValues(validationValues)
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function getSellerPopulate(query) {
  return query.populate('seller', 'name email accountType')
}

function getNumberQuery(value, label) {
  if (value === undefined || value === '') return { value: undefined, error: '' }
  const number = Number(value)
  if (!Number.isFinite(number)) return { value: undefined, error: `Please enter a valid ${label}.` }
  return { value: number, error: '' }
}

function getImagePath(file) {
  return file ? `/uploads/${file.filename}` : ''
}

function getValidationMessage(error) {
  if (error.name === 'ValidationError') {
    const firstError = Object.values(error.errors)[0]
    return firstError?.message || 'Please check the part details and try again.'
  }

  if (error.name === 'CastError') return 'Please enter a valid price.'
  return 'Unable to save the part right now.'
}

async function getParts(req, res) {
  try {
    const { search, brand, model, category, subcategory, condition, quality, minYear, maxYear, minPrice, maxPrice, city, sellerType, sort } = req.query
    const query = {}
    const andFilters = []
    if (search?.trim()) {
      const safeSearch = escapeRegex(search.trim())
      andFilters.push({ $or: ['title', 'description', 'carBrand', 'carModel', 'partNumber', 'category', 'subcategory'].map((field) => ({ [field]: { $regex: safeSearch, $options: 'i' } })) })
    }
    if (brand) query.carBrand = brand
    if (model) query.carModel = { $regex: escapeRegex(model), $options: 'i' }
    if (category) query.category = category
    if (subcategory) query.subcategory = subcategory
    if (condition) query.condition = condition
    if (quality) query.quality = quality
    if (city) query.city = { $regex: escapeRegex(city), $options: 'i' }
    if (sellerType === 'individual') andFilters.push({ $or: [{ sellerType: 'individual' }, { sellerType: { $exists: false } }] })
    else if (sellerType === 'company') query.sellerType = 'company'
    else if (sellerType) return res.status(400).json({ message: 'Seller type must be individual or company.' })
    if (brand && !brands.includes(brand)) return res.status(400).json({ message: 'Please choose a supported vehicle brand.' })
    if (category && !isSupportedCategory(category)) return res.status(400).json({ message: 'Please choose a supported catalogue category.' })
    if (subcategory && (!category || !isValidSubcategory(category, subcategory))) return res.status(400).json({ message: 'Please choose a subcategory that belongs to the selected category.' })
    if (quality && !qualities.includes(quality)) return res.status(400).json({ message: 'Please choose a supported quality.' })

    const numericFilters = [['minYear', minYear], ['maxYear', maxYear], ['minPrice', minPrice], ['maxPrice', maxPrice]].map(([label, value]) => [label, getNumberQuery(value, label)])
    const numericError = numericFilters.find(([, result]) => result.error)
    if (numericError) return res.status(400).json({ message: numericError[1].error })
    const numbers = Object.fromEntries(numericFilters.map(([label, result]) => [label, result.value]))
    if (numbers.minPrice !== undefined || numbers.maxPrice !== undefined) query.price = {}
    if (numbers.minPrice !== undefined) query.price.$gte = numbers.minPrice
    if (numbers.maxPrice !== undefined) query.price.$lte = numbers.maxPrice
    if (numbers.minYear !== undefined || numbers.maxYear !== undefined) {
      if (numbers.minYear !== undefined) andFilters.push({ $or: [{ vehicleYearTo: { $gte: numbers.minYear } }, { vehicleYearTo: { $exists: false } }] })
      if (numbers.maxYear !== undefined) andFilters.push({ $or: [{ vehicleYearFrom: { $lte: numbers.maxYear } }, { vehicleYearFrom: { $exists: false } }] })
    }
    if (numbers.minYear !== undefined && numbers.maxYear !== undefined && numbers.minYear > numbers.maxYear) return res.status(400).json({ message: 'Minimum year cannot be later than maximum year.' })
    if (numbers.minPrice !== undefined && numbers.maxPrice !== undefined && numbers.minPrice > numbers.maxPrice) return res.status(400).json({ message: 'Minimum price cannot be greater than maximum price.' })
    if (andFilters.length) query.$and = andFilters
    if (sort && !['newest', 'price-low', 'price-high'].includes(sort)) return res.status(400).json({ message: 'Sort must be newest, price-low, or price-high.' })
    const sortOrder = sort === 'price-low' ? { price: 1 } : sort === 'price-high' ? { price: -1 } : { createdAt: -1 }
    const partsQuery = Part.find(query).sort(sortOrder)
    const [parts, total] = await Promise.all([getSellerPopulate(partsQuery), Part.countDocuments(query)])
    return res.json({ parts, total, count: parts.length })
  } catch (error) {
    return res.status(500).json({ message: 'Unable to load parts right now.' })
  }
}

async function getPart(req, res) {
  if (!isValidPartId(req.params.id)) return res.status(400).json({ message: 'Please provide a valid part ID.' })

  try {
    const part = await getSellerPopulate(Part.findById(req.params.id))
    if (!part) return res.status(404).json({ message: 'Part listing not found.' })
    return res.json({ part })
  } catch (error) {
    return res.status(500).json({ message: 'Unable to load the part right now.' })
  }
}

async function createPart(req, res) {
  const values = getPartValues(req.body)
  values.seller = req.user.id
  values.sellerType = req.user.accountType || 'individual'
  if (req.file) values.imagePath = getImagePath(req.file)
  const validationMessage = validatePartValues(values)
  if (validationMessage) { removeUploadedFile(req.file); return res.status(400).json({ message: validationMessage }) }

  try {
    const part = await Part.create(values)
    const savedPart = await getSellerPopulate(Part.findById(part._id))
    return res.status(201).json({ message: 'Part listing created.', part: savedPart })
  } catch (error) {
    removeUploadedFile(req.file)
    return res.status(400).json({ message: getValidationMessage(error) })
  }
}

async function updatePart(req, res) {
  if (!isValidPartId(req.params.id)) {
    removeUploadedFile(req.file)
    return res.status(400).json({ message: 'Please provide a valid part ID.' })
  }

  const part = await Part.findById(req.params.id)
  if (!part) {
    removeUploadedFile(req.file)
    return res.status(404).json({ message: 'Part listing not found.' })
  }
  if (part.seller.toString() !== req.user.id) {
    removeUploadedFile(req.file)
    return res.status(403).json({ message: 'You can only edit your own part listings.' })
  }

  const oldImagePath = part.imagePath
  const values = getPartValues(req.body)
  values.sellerType = req.user.accountType || 'individual'
  if (req.file) values.imagePath = getImagePath(req.file)
  if (Object.keys(values).length === 0) {
    removeUploadedFile(req.file)
    return res.status(400).json({ message: 'Please provide at least one part detail to update.' })
  }
  const validationMessage = validateUpdatedPartValues(values, part)
  if (validationMessage) { removeUploadedFile(req.file); return res.status(400).json({ message: validationMessage }) }

  Object.assign(part, values)
  try {
    await part.save()
    const savedPart = await getSellerPopulate(Part.findById(part._id))
    if (req.file && oldImagePath) removeImagePath(oldImagePath)
    return res.json({ message: 'Part listing updated.', part: savedPart })
  } catch (error) {
    removeUploadedFile(req.file)
    return res.status(400).json({ message: getValidationMessage(error) })
  }
}

async function deletePart(req, res) {
  if (!isValidPartId(req.params.id)) return res.status(400).json({ message: 'Please provide a valid part ID.' })

  const part = await Part.findById(req.params.id)
  if (!part) return res.status(404).json({ message: 'Part listing not found.' })
  if (part.seller.toString() !== req.user.id) return res.status(403).json({ message: 'You can only delete your own part listings.' })

  try {
    await part.deleteOne()
    removeImagePath(part.imagePath)
    return res.json({ message: 'Part listing deleted.' })
  } catch (error) {
    return res.status(500).json({ message: 'Unable to delete the part right now.' })
  }
}

function removeImagePath(imagePath) {
  if (!imagePath) return
  const filename = path.basename(imagePath)
  const filePath = path.join(__dirname, '..', 'uploads', filename)
  fs.unlink(filePath, () => {})
}

module.exports = { getParts, getPart, createPart, updatePart, deletePart }
