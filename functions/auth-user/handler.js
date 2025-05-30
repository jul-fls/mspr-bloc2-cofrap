'use strict'
const { Pool } = require('pg')
const crypto = require('crypto')
const { authenticator } = require('otplib')
const dotenv = require('dotenv')
dotenv.config({ path: '/var/openfaas/secrets/secret-pg' })

const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: parseInt(process.env.PGPORT),
})

function hashSHA256(password) {
  return crypto.createHash('sha256').update(password).digest('hex')
}

module.exports = async (event, context) => {
  try {
    const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body
    const { username, password, totp } = body

    if (!username || !password || !totp) {
      return context.status(400).fail('Missing username, password or TOTP')
    }

    const result = await pool.query('SELECT * FROM users WHERE login = $1', [username])
    if (result.rows.length === 0) {
      return context.status(401).fail('User not found')
    }

    const user = result.rows[0]
    const passwordHash = hashSHA256(password)

    if (passwordHash !== user.password_hash) {
      return context.status(401).fail('Invalid password')
    }

    if (!user.totp_secret || typeof user.totp_secret !== 'string') {
      console.error('TOTP secret not found or invalid for user:', user.username)
      console.table(user)
      return context.status(500).fail('TOTP secret not found or invalid for user')
    }

    const totpValid = authenticator.check(totp, user.totp_secret)
    if (!totpValid) {
      return context.status(401).fail('Invalid TOTP')
    }

    const ageMs = Date.now() - new Date(user.created_at).getTime()
    const sixMonthsMs = 1000 * 60 * 60 * 24 * 30 * 6
    if (ageMs > sixMonthsMs) {
      return context.status(403).fail('Credentials expired')
    }

    return context.status(200).succeed('Auth successful')
  } catch (err) {
    console.error(err)
    return context.status(500).fail('Internal server error')
  }
}
