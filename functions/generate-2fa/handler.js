'use strict'
const { authenticator } = require('otplib')
const QRCode = require('qrcode')
module.exports = async (event, context) => {
  const username = (event.body || 'user@example.com').trim()
  // Génère une clé secrète aléatoire
  const secret = authenticator.generateSecret()
  // URI conforme Google Authenticator
  const label = encodeURIComponent(`COFRAP-SYSTEM:${username}`)
  const issuer = encodeURIComponent('COFRAP-SYSTEM')
  const otpauth = `otpauth://totp/${label}?secret=${secret}&issuer=${issuer}`
  // Génère le QR code
  const qr = await QRCode.toDataURL(otpauth)
  return context.status(200).succeed({ secret, otpauth, qr })
}
