const express = require('express')
const protect = require('../middleware/authMiddleware')
const requireCompany = require('../middleware/companyMiddleware')
const { getCompanies, getCompany, getMyCompany, saveMyCompany } = require('../controllers/companyController')

const router = express.Router()

router.get('/', getCompanies)
router.get('/me', protect, requireCompany, getMyCompany)
router.put('/me', protect, requireCompany, saveMyCompany)
router.get('/:id', getCompany)

module.exports = router
