'use strict'
const { Pool } = require('pg')
const { authenticator } = require('otplib')
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
  if (result.rows.length === 1) {
    // Génère une clé secrète aléatoire
    const secret = authenticator.generateSecret()
    // URI conforme Google Authenticator
    const label = encodeURIComponent(`COFRAP-SYSTEM:${username}`)
    const issuer = encodeURIComponent('COFRAP-SYSTEM')
    const otpauth = `otpauth://totp/${label}?secret=${secret}&issuer=${issuer}`
    // Génère le QR code
    const qr = await QRCode.toDataURL(otpauth)
    // Met à jour l'utilisateur avec le secret TOTP
    await pool.query('UPDATE users SET totp_secret = $1 WHERE login = $2', [secret, username]).then(() => {
      console.log(`TOTP secret updated for user: ${username}`)
    }
    ).catch((err) => {
      console.error(`Error updating TOTP secret for user ${username}:`, err)
      return context.status(500).fail('Error updating TOTP secret')
    })


    return context.status(200).succeed({ secret, otpauth, qr })
  } else {
    return context.status(400).fail('User does not exist')
  }
}
