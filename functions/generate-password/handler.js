'use strict'
const crypto = require('crypto')
const QRCode = require('qrcode')

module.exports = async (event, context) => {
  const password = generatePassword(24)
  const qrDataURL = await QRCode.toDataURL(password)

  return context.status(200).succeed({
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
