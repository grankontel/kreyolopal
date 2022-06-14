const { IncomingWebhook } = require('@slack/webhook')
const config = require('../config')

// Initialize
const webhook = new IncomingWebhook(config.slack.webhook)

module.exports = webhook
