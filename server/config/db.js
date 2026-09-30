const dns = require('node:dns')
const mongoose = require('mongoose')

// Some networks need public DNS servers to resolve MongoDB SRV records correctly.
dns.setServers(['8.8.8.8', '1.1.1.1'])

function getSafeErrorDetails(error) {
  const values = []
  const visited = new Set()

  function collect(currentError) {
    if (!currentError || typeof currentError !== 'object' || visited.has(currentError)) {
      return
    }

    visited.add(currentError)

    if (currentError.name) values.push(String(currentError.name))
    if (currentError.code !== undefined) values.push(String(currentError.code))
    if (currentError.codeName) values.push(String(currentError.codeName))

    collect(currentError.cause)
    collect(currentError.errorResponse)

    if (currentError.reason instanceof Map) {
      for (const reason of currentError.reason.values()) {
        collect(reason)
      }
    } else {
      collect(currentError.reason)
    }
  }

  collect(error)

  const lowerCaseValues = values.map((value) => value.toLowerCase())
  let category = 'unknown'

  if (lowerCaseValues.some((value) => value === '18' || value.includes('authentication'))) {
    category = 'authentication'
  } else if (lowerCaseValues.some((value) => value.includes('econnrefused') || value.includes('network'))) {
    category = 'ip/network access'
  } else if (lowerCaseValues.some((value) => value.includes('timeout') || value.includes('etimedout'))) {
    category = 'timeout'
  } else if (lowerCaseValues.some((value) => value.includes('parse') || value.includes('invalid'))) {
    category = 'URI formatting'
  }

  const code = values.find((value) => /^\d+$/.test(value) || /^E[A-Z0-9_]+$/.test(value))

  return { category, code }
}

async function connectDB() {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is missing. Add it to the server environment.')
  }

  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('MongoDB connected')
  } catch (error) {
    const details = getSafeErrorDetails(error)
    const codeMessage = details.code ? `, code ${details.code}` : ''

    throw new Error(
      `MongoDB connection failed (${details.category}${codeMessage}). The server was not started.`,
    )
  }
}

module.exports = connectDB
