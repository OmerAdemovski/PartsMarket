const express = require('express')
const protect = require('../middleware/authMiddleware')
const requireCompany = require('../middleware/companyMiddleware')
const { createComplaint, getMyComplaints, getCompanyComplaints, getComplaint, addMessage, resolveComplaint, getOrderComplaint } = require('../controllers/complaintController')

const router = express.Router()

router.use(protect)
router.post('/', createComplaint)
router.get('/my', getMyComplaints)
router.get('/company', requireCompany, getCompanyComplaints)
router.get('/order/:orderId', getOrderComplaint)
router.get('/:id', getComplaint)
router.post('/:id/messages', addMessage)
router.patch('/:id/resolve', resolveComplaint)

module.exports = router
