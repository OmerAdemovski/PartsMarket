const express = require('express')
const protect = require('../middleware/authMiddleware')
const { createReview, updateReview, deleteReview, getCompanyReviews, getOrderReview } = require('../controllers/reviewController')

const router = express.Router()

router.get('/company/:companyId', getCompanyReviews)
router.get('/order/:orderId', protect, getOrderReview)
router.post('/', protect, createReview)
router.patch('/:id', protect, updateReview)
router.delete('/:id', protect, deleteReview)

module.exports = router
