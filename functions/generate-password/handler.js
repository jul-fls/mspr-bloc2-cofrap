'use strict'
const { Pool } = require('pg')
const argon2 = require('argon2')
const QRCode = require('qrcode')
const crypto = require('crypto')
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
  if (event.method === 'OPTIONS') {
    return context
      .status(200)
      .headers({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      })
      .succeed('')
  }
  const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body
  const { username } = body

  if (!username) {
    return context.headers(
        {
          'Content-type': 'text/plain',
          "Access-Control-Allow-Origin": "*"
        }
    ).status(400).fail('Missing username')
  }

  const password = generatePassword(24)
  const qrDataURL = await QRCode.toDataURL(password)

  const passwordHash = await argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 2 ** 16,
    timeCost: 3,
    parallelism: 1
  })

  const now = new Date()

  const result = await pool.query('SELECT * FROM users WHERE login = $1', [username])
  if (result.rows.length === 0) {
    // New user
    await pool.query(
      `INSERT INTO users (login, password_hash, totp_secret, last_password_update, expired)
       VALUES ($1, $2, $3, $4, $5)`,
      [username, passwordHash, null, now, false]
    )
  } else {
    // Existing user: update password and clear expired flag
    await pool.query(
      `UPDATE users
       SET password_hash = $1,
           last_password_update = $2,
           expired = FALSE
       WHERE login = $3`,
      [passwordHash, now, username]
    )
  }

  return context.headers(
        {
          'Content-type': 'text/plain',
          "Access-Control-Allow-Origin": "*"
        }
    ).status(200).succeed({
    password,
    qr: qrDataURL
  })
}

function generatePassword(length) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()'
  return Array.from(crypto.randomFillSync(new Uint32Array(length)))
    .map(x => chars[x % chars.length])
    .join('')
}
