const config = require('../config')

const pino = require('pino')
const log = pino({
  level: config.log.level,
  prettyPrint: config.log.prettyPrint,
})

module.exports = log
