const crypto = require('crypto')
const fs = require('fs')
const path = require('path')
const multer = require('multer')

const uploadsPath = path.join(__dirname, '..', 'uploads')

const storage = multer.diskStorage({
  destination: (req, file, callback) => callback(null, uploadsPath),
  filename: (req, file, callback) => {
    const extensionByType = {
      'image/jpeg': '.jpg',
      'image/png': '.png',
      'image/webp': '.webp',
    }
    const extension = extensionByType[file.mimetype]
    const uniqueName = `${Date.now()}-${crypto.randomBytes(12).toString('hex')}${extension}`
    callback(null, uniqueName)
  },
})

function imageFileFilter(req, file, callback) {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']

  if (!allowedTypes.includes(file.mimetype)) {
    return callback(new Error('Only JPEG, PNG, and WebP images are allowed.'))
  }

  return callback(null, true)
}

const uploadPartImage = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
})

function removeUploadedFile(file) {
  if (!file || !file.path) return
  fs.unlink(file.path, () => {})
}

function hasMatchingImageSignature(file, buffer) {
  if (file.mimetype === 'image/jpeg') {
    return buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff
  }

  if (file.mimetype === 'image/png') {
    const pngSignature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
    return buffer.length >= pngSignature.length && buffer.subarray(0, pngSignature.length).equals(pngSignature)
  }

  if (file.mimetype === 'image/webp') {
    return buffer.length >= 12 && buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP'
  }

  return false
}

function validateImageSignature(req, res, next) {
  if (!req.file) return next()

  fs.readFile(req.file.path, (error, buffer) => {
    if (error || !hasMatchingImageSignature(req.file, buffer)) {
      removeUploadedFile(req.file)
      return res.status(400).json({ message: 'The uploaded file is not a valid JPEG, PNG, or WebP image.' })
    }

    return next()
  })
}

function handleUploadError(error, req, res, next) {
  if (!error) return next()

  removeUploadedFile(req.file)

  if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ message: 'Image must be 5 MB or smaller.' })
  }

  if (error.message === 'Only JPEG, PNG, and WebP images are allowed.') {
    return res.status(400).json({ message: error.message })
  }

  return res.status(400).json({ message: 'The image upload could not be completed.' })
}

module.exports = { uploadPartImage, handleUploadError, removeUploadedFile, validateImageSignature }
