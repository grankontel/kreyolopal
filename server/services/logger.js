const pino = require('pino');
const config = require('../config');

const log = pino({
  level: config.log.level,
  prettyPrint: config.log.prettyPrint,
});

module.exports = log;
