const fs = require('fs')
const path = require('path')
const mongoose = require('mongoose')
const Part = require('../models/Part')
const { removeUploadedFile } = require('../middleware/uploadMiddleware')

const editableFields = ['title', 'description', 'price', 'category', 'condition', 'carBrand', 'carModel', 'location', 'contact']

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

  return values
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
    const parts = await Part.find().sort({ createdAt: -1 }).populate('seller', 'name email')
    return res.json({ parts })
  } catch (error) {
    return res.status(500).json({ message: 'Unable to load parts right now.' })
  }
}

async function getPart(req, res) {
  if (!isValidPartId(req.params.id)) return res.status(400).json({ message: 'Please provide a valid part ID.' })

  try {
    const part = await Part.findById(req.params.id).populate('seller', 'name email')
    if (!part) return res.status(404).json({ message: 'Part listing not found.' })
    return res.json({ part })
  } catch (error) {
    return res.status(500).json({ message: 'Unable to load the part right now.' })
  }
}

async function createPart(req, res) {
  const values = getPartValues(req.body)
  values.seller = req.user.id
  if (req.file) values.imagePath = getImagePath(req.file)

  try {
    const part = await Part.create(values)
    const savedPart = await Part.findById(part._id).populate('seller', 'name email')
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
  if (req.file) values.imagePath = getImagePath(req.file)
  if (Object.keys(values).length === 0) {
    removeUploadedFile(req.file)
    return res.status(400).json({ message: 'Please provide at least one part detail to update.' })
  }

  Object.assign(part, values)
  try {
    await part.save()
    const savedPart = await Part.findById(part._id).populate('seller', 'name email')
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
