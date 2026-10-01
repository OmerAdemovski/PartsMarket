const path = require('path')
const fs = require('fs')
const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const dotenv = require('dotenv')
const mongoose = require('mongoose')
const connectDB = require('./config/db')
const authRoutes = require('./routes/authRoutes')

dotenv.config()

const app = express()
const port = process.env.PORT || 5000
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173'
const uploadsPath = path.join(__dirname, 'uploads')

fs.mkdirSync(uploadsPath, { recursive: true })

app.use(cors({ origin: clientUrl, credentials: true }))
app.use(express.json())
app.use(cookieParser())
app.use('/uploads', express.static(uploadsPath))
app.use('/api/auth', authRoutes)

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'PartsMarket server is running',
    mongodb: {
      connected: mongoose.connection.readyState === 1,
    },
  })
})

async function startServer() {
  try {
    await connectDB()

    app.listen(port, () => {
      console.log(`PartsMarket server is running on port ${port}`)
    })
  } catch (error) {
    console.error(error.message)
    process.exitCode = 1
  }
}

startServer()
