'use strict'
const { Pool } = require('pg')
const crypto = require('crypto')
const QRCode = require('qrcode')
const dotenv = require('dotenv')
dotenv.config({ path: '/var/openfaas/secrets/secret-pg' })

const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: parseInt(process.env.PGPORT),
})

module.exports = async (event, context) => {
  const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body
  const { username } = body

  if (!username) {
    return context.status(400).fail('Missing username')
  }
  const result = await pool.query('SELECT * FROM users WHERE login = $1', [username])
  // if user does not exist, create it
  if (result.rows.length === 0) {
    const password = generatePassword(24)
    const qrDataURL = await QRCode.toDataURL(password)

    // insert user into database without TOTP secret
    await pool.query('INSERT INTO users (login, password_hash, totp_secret) VALUES ($1, $2, $3)', [
      username,
      crypto.createHash('sha256').update(password).digest('hex'),
      null // No TOTP secret for this user
    ])

    return context.status(200).succeed({
      password,
      qr: qrDataURL
    })
  } else {
    return context.status(400).fail('User already exists')
  }
}

function generatePassword(length) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()'
  return Array.from(crypto.randomFillSync(new Uint32Array(length)))
    .map(x => chars[x % chars.length])
    .join('')
}
