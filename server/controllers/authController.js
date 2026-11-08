const bcrypt = require('bcryptjs')
const User = require('../models/User')
const CompanyProfile = require('../models/CompanyProfile')
const generateToken = require('../utils/generateToken')
const { DELIVERY_METHODS, PAYMENT_METHODS, isExactMethodList } = require('../utils/companyMethods')
const { isCompleteCompanyProfile } = require('../utils/companyProfile')

const cookieName = 'token'
const cookieMaxAge = 7 * 24 * 60 * 60 * 1000

function getCookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: cookieMaxAge,
  }
}

function getClearCookieOptions() {
  const options = getCookieOptions()
  delete options.maxAge
  return options
}

function setAuthCookie(res, userId) {
  const token = generateToken(userId)
  res.cookie(cookieName, token, getCookieOptions())
}

function publicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    accountType: user.accountType || 'individual',
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

async function getPublicUser(user) {
  const publicData = publicUser(user)
  const companyProfile = user.accountType === 'company' ? await CompanyProfile.findOne({ owner: user._id }) : null
  publicData.companyProfileComplete = user.accountType !== 'company' || isCompleteCompanyProfile(companyProfile)
  return publicData
}

async function register(req, res) {
  const name = typeof req.body.name === 'string' ? req.body.name.trim() : ''
  const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : ''
  const password = typeof req.body.password === 'string' ? req.body.password : ''
  const accountType = req.body.accountType || 'individual'
  const companyDeliveryMethods = req.body.deliveryMethods || req.body.companyDeliveryMethods
  const companyPaymentMethods = req.body.paymentMethods || req.body.companyPaymentMethods
  const companyName = typeof req.body.companyName === 'string' ? req.body.companyName.trim() : ''
  const companyDescriptionValue = req.body.description || req.body.companyDescription
  const companyPhoneValue = req.body.phone || req.body.companyPhone
  const companyAddressValue = req.body.address || req.body.companyAddress
  const companyDescription = typeof companyDescriptionValue === 'string' ? companyDescriptionValue.trim() : ''
  const companyPhone = typeof companyPhoneValue === 'string' ? companyPhoneValue.trim() : ''
  const companyEmail = typeof req.body.companyEmail === 'string' && req.body.companyEmail.trim() ? req.body.companyEmail.trim().toLowerCase() : email
  const companyAddress = typeof companyAddressValue === 'string' ? companyAddressValue.trim() : ''

  if (!name || !isValidEmail(email) || password.length < 6 || !['individual', 'company'].includes(accountType)) {
    return res.status(400).json({
      message: 'Name, a valid email, a password of at least 6 characters, and a valid account type are required.',
    })
  }
  if (accountType === 'company' && (!isExactMethodList(companyDeliveryMethods, DELIVERY_METHODS) || !isExactMethodList(companyPaymentMethods, PAYMENT_METHODS))) {
    return res.status(400).json({ message: 'Company accounts must choose at least one valid delivery method and payment method.' })
  }
  if (accountType === 'company' && (!companyName || !companyDescription || !companyPhone || !isValidEmail(companyEmail) || !companyAddress)) {
    return res.status(400).json({ message: 'Company name, description, phone, business email, and address are required.' })
  }

  try {
    const existingUser = await User.findOne({ email })

    if (existingUser) {
      return res.status(409).json({ message: 'An account with that email already exists.' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const user = await User.create({ name, email, password: hashedPassword, accountType })
    if (accountType === 'company') {
      try {
        await CompanyProfile.create({ companyName, description: companyDescription, phone: companyPhone, email: companyEmail, address: companyAddress, deliveryMethods: companyDeliveryMethods, paymentMethods: companyPaymentMethods, estimatedDeliveryText: 'Contact company', owner: user._id })
      } catch (profileError) {
        await User.deleteOne({ _id: user._id })
        throw profileError
      }
    }
    setAuthCookie(res, user._id)

    return res.status(201).json({
      message: 'Registration successful. You are now logged in.',
      user: await getPublicUser(user),
    })
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'An account with that email already exists.' })
    }

    return res.status(500).json({ message: 'Unable to register right now.' })
  }
}

async function login(req, res) {
  const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : ''
  const password = typeof req.body.password === 'string' ? req.body.password : ''

  if (!isValidEmail(email) || !password) {
    return res.status(401).json({ message: 'Invalid email or password.' })
  }

  try {
    const user = await User.findOne({ email }).select('+password')
    const passwordMatches = user ? await bcrypt.compare(password, user.password) : false

    if (!user || !passwordMatches) {
      return res.status(401).json({ message: 'Invalid email or password.' })
    }

    setAuthCookie(res, user._id)

    return res.json({
      message: 'Login successful.',
      user: await getPublicUser(user),
    })
  } catch (error) {
    return res.status(500).json({ message: 'Unable to log in right now.' })
  }
}

function logout(req, res) {
  res.clearCookie(cookieName, getClearCookieOptions())
  return res.json({ message: 'Logout successful.' })
}

function me(req, res) {
  return getPublicUser(req.user).then((user) => res.json({ user }))
}

module.exports = { register, login, logout, me }
