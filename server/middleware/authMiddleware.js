const jwt = require('jsonwebtoken')
const User = require('../models/User')

async function protect(req, res, next) {
  const token = req.cookies.token

  if (!token) {
    return res.status(401).json({ message: 'Authentication required.' })
  }

  try {
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ message: 'Authentication is not configured.' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    if (!decoded.userId) {
      return res.status(401).json({ message: 'Invalid authentication.' })
    }

    const user = await User.findById(decoded.userId)

    if (!user) {
      return res.status(401).json({ message: 'Invalid authentication.' })
    }

    req.user = user
    next()
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired authentication.' })
  }
}

module.exports = protect
