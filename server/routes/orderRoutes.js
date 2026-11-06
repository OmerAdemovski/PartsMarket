const express = require('express')
const protect = require('../middleware/authMiddleware')
const requireCompany = require('../middleware/companyMiddleware')
const { createOrder, getMyOrders, getCompanyOrders, getOrder, updateOrderStatus, cancelOrder } = require('../controllers/orderController')

const router = express.Router()

router.use(protect)
router.post('/', createOrder)
router.get('/my-orders', getMyOrders)
router.get('/company-orders', requireCompany, getCompanyOrders)
router.get('/:id', getOrder)
router.patch('/:id/status', updateOrderStatus)
router.patch('/:id/cancel', cancelOrder)

module.exports = router
