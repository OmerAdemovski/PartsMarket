const express = require('express')
const protect = require('../middleware/authMiddleware')
const requireCompany = require('../middleware/companyMiddleware')
const { getCompanies, getCompany, getCompanyByOwner, getMyCompany, saveMyCompany } = require('../controllers/companyController')

const router = express.Router()

router.get('/', getCompanies)
router.get('/me', protect, requireCompany, getMyCompany)
router.put('/me', protect, requireCompany, saveMyCompany)
router.get('/owner/:ownerId', getCompanyByOwner)
router.get('/:id', getCompany)

module.exports = router
