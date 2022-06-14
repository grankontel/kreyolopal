const winston = require('winston')
const SlackHook = require('winston-slack-webhook-transport')

const config = require('../config')

const alignedWithColorsAndTime = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp(),
  winston.format.align(),
  winston.format.printf((info) => {
    const { timestamp, level, message, ...args } = info

    const ts = timestamp.slice(0, 19).replace('T', ' ')
    return `${ts} [${level}]: ${message} ${
      Object.keys(args).length ? JSON.stringify(args, null, 2) : ''
    }`
  })
)
const options = {
  console: {
    level: config.log.level,
    format: alignedWithColorsAndTime,
  },
}

const transports = [new winston.transports.Console(options.console)]

if (!config.slack.noSend)
  transports.push(
    new SlackHook({ level: 'warn', webhookUrl: config.slack.webhook })
  )

const log = winston.createLogger({
  transports,
  exitOnError: false, // do not exit on handled exceptions
})

// create a stream object with a 'write' function that will be used by `morgan`
log.stream = {
  write: (message) => {
    // use the 'info' log level so the output will be picked up by both transports (file and console)
    log.info(message)
  },
}

module.exports = log
