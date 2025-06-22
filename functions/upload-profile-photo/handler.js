'use strict'
const { Pool } = require('pg')
const dotenv = require('dotenv')
dotenv.config({ path: '/var/openfaas/secrets/secret-pg' })

const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: parseInt(process.env.PGPORT)
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
    const { username, image } = body

    if (!username || !image) {
      return context.headers({
        'Content-type': 'text/plain',
        'Access-Control-Allow-Origin': '*'
      }).status(400).fail('Missing username or image')
    }

    const result = await pool.query('SELECT id FROM users WHERE login = $1', [username])
    if (result.rows.length === 0) {
      return context.headers({
        'Content-type': 'text/plain',
        'Access-Control-Allow-Origin': '*'
      }).status(404).fail('User not found')
    }

    await pool.query('UPDATE users SET profile_picture = $1 WHERE login = $2', [image, username])

    return context.headers({
      'Content-type': 'text/plain',
      'Access-Control-Allow-Origin': '*'
    }).status(200).succeed('Profile picture updated')
  } catch (err) {
    console.error(err)
    return context.headers({
      'Content-type': 'text/plain',
      'Access-Control-Allow-Origin': '*'
    }).status(500).fail('Internal server error')
  }
}
