'use strict'
const { Pool } = require('pg')
const argon2 = require('argon2')
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
  try {
    const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body
    const { username, password, totp } = body

    if (!username || !password || !totp) {
      return context.headers(
        {
          'Content-type': 'text/plain',
          "Access-Control-Allow-Origin": "*"
        }
    ).status(400).fail('Missing username, password or TOTP')
    }

    const result = await pool.query('SELECT * FROM users WHERE login = $1', [username])
    if (result.rows.length === 0) {
      return context.headers(
        {
          'Content-type': 'text/plain',
          "Access-Control-Allow-Origin": "*"
        }
    ).status(401).fail('User not found')
    }

    const user = result.rows[0]
    const passwordValid = await argon2.verify(user.password_hash, password)

    if (!passwordValid) {
      return context.headers(
        {
          'Content-type': 'text/plain',
          "Access-Control-Allow-Origin": "*"
        }
    ).status(401).fail('Invalid password')
    }

    if (!user.totp_secret || typeof user.totp_secret !== 'string') {
      console.error('TOTP secret not found or invalid for user:', user.username)
      console.table(user)
      return context.headers(
        {
          'Content-type': 'text/plain',
          "Access-Control-Allow-Origin": "*"
        }
    ).status(500).fail('TOTP secret not found or invalid for user')
    }

    const totpValid = authenticator.check(totp, user.totp_secret)
    if (!totpValid) {
      return context.status(401).fail('Invalid TOTP')
    }

    const now = Date.now()
    const sixMonthsMs = 1000 * 60 * 60 * 24 * 30 * 6

    if (!user.last_password_update) {
      console.warn(`User ${username} has no last_password_update set.`)
      await pool.query('UPDATE users SET expired = TRUE WHERE login = $1', [username])
      return context.status(403).headers(
        {
          'Content-type': 'text/plain',
          "Access-Control-Allow-Origin": "*"
        }
    ).fail('Credentials expired')
    }

    const lastUpdateMs = new Date(user.last_password_update).getTime()
    if (now - lastUpdateMs > sixMonthsMs) {
      await pool.query('UPDATE users SET expired = TRUE WHERE login = $1', [username])
      return context.status(403).fail('Credentials expired')
    }

    return context.status(200).headers(
        {
          'Content-type': 'text/plain',
          "Access-Control-Allow-Origin": "*"
        }
    ).succeed('Auth successful')
  } catch (err) {
    console.error(err)
    return context.headers(
        {
          'Content-type': 'text/plain',
          "Access-Control-Allow-Origin": "*"
        }
    ).status(500).fail('Internal server error')
  }
}
