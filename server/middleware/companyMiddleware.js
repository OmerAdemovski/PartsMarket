function requireCompany(req, res, next) {
  if (req.user.accountType !== 'company') {
    return res.status(403).json({ message: 'Only company accounts can manage a company profile.' })
  }

  next()
}

module.exports = requireCompany
