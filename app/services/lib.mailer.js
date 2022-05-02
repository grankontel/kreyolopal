const nodemailer = require('nodemailer')
const config = require('../config')
const mg = require('nodemailer-mailgun-transport')

const auth = {
  auth: {
    api_key: config.mail.apiKey,
    domain: config.mail.domain, // 'one of your domain names listed at your https://mailgun.com/app/domains'
  },
  host: config.mail.host,
}
let transport = mg(auth)
const mailer = nodemailer.createTransport(transport)

module.exports = mailer
