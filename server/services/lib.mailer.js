const nodemailer = require('nodemailer');
const mg = require('nodemailer-mailgun-transport');
const config = require('../config');

const auth = {
  auth: {
    api_key: config.mail.apiKey,
    domain: config.mail.domain, // 'one of your domain names listed at your https://mailgun.com/app/domains'
  },
  host: config.mail.host,
};
const transport = mg(auth);
const mailer = nodemailer.createTransport(transport);

module.exports = mailer;
