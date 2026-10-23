const bcrypt = require('bcryptjs')
const User = require('../models/User')
const generateToken = require('../utils/generateToken')

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
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

async function register(req, res) {
  const name = typeof req.body.name === 'string' ? req.body.name.trim() : ''
  const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : ''
  const password = typeof req.body.password === 'string' ? req.body.password : ''

  if (!name || !isValidEmail(email) || password.length < 6) {
    return res.status(400).json({
      message: 'Name, a valid email, and a password of at least 6 characters are required.',
    })
  }

  try {
    const existingUser = await User.findOne({ email })

    if (existingUser) {
      return res.status(409).json({ message: 'An account with that email already exists.' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const user = await User.create({ name, email, password: hashedPassword })
    setAuthCookie(res, user._id)

    return res.status(201).json({
      message: 'Registration successful. You are now logged in.',
      user: publicUser(user),
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
      user: publicUser(user),
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
  return res.json({ user: publicUser(req.user) })
}

module.exports = { register, login, logout, me }
