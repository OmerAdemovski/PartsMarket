const express = require('express')
const protect = require('../middleware/authMiddleware')
const { uploadPartImage, handleUploadError } = require('../middleware/uploadMiddleware')
const { getParts, getPart, createPart, updatePart, deletePart } = require('../controllers/partController')

const router = express.Router()

router.get('/', getParts)
router.get('/:id', getPart)
router.post('/', protect, uploadPartImage.single('image'), handleUploadError, createPart)
router.put('/:id', protect, uploadPartImage.single('image'), handleUploadError, updatePart)
router.delete('/:id', protect, deletePart)

module.exports = router
