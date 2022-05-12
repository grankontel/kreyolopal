const express = require('express')
// const pino_logger = require('express-pino-logger')
const morgan = require('morgan')
const cors = require('cors')
const cookie_parser = require('cookie-parser')
const body_parser = require('body-parser')
const passport = require('passport')
const expressSession = require('express-session')
const SessionStore = require('express-session-sequelize')(expressSession.Store)
const JwtCookieComboStrategy = require('passport-jwt-cookiecombo')

const config = require('./config')
const db = require('./database/models')

const { sequelize } = db

const passportPrepare = (logger) => {
  passport.serializeUser((user, cb) => {
    logger.info('serializeUser')
    process.nextTick(() => {
      cb(null, { id: user.id, username: user.email })
    })
  })

  passport.deserializeUser((user, cb) => {
    logger.info('deserializeUser')
    process.nextTick(() => cb(null, user))
  })

  passport.use(
    new JwtCookieComboStrategy(
      {
        secretOrPublicKey: config.security.salt,
      },
      (payload, done) => done(null, payload.user)
    )
  )
}

async function coreConfig({ app, logger, routeCallback }) {
  // configure logger
  app.use(morgan('combined', { stream: logger.stream }))

  // trust proxy
  app.enable('trust proxy')

  // cross-origin
  app.options('*', cors()) // include before other routes

  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*')
    res.header(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept'
    )
    next()
  })

  app.use(cookie_parser(config.security.salt))
  app.use(body_parser.urlencoded({ extended: true }))
  app.use(
    expressSession({
      secret: config.auth.secret,
      resave: false,
      saveUninitialized: false,
      store: new SessionStore({
        db: sequelize,
      }),
    })
  )

  passportPrepare(logger)
  app.use(passport.initialize())

  // body parser
  app.use(express.json())

  // instance callBack
  routeCallback({ app, logger })

  /*     
  const { apiCallback, publicCallback } = routesCallback
    var apiRouter = express.Router()
    apiCallback({ app: apiRouter, logger })
    //prefix
    app.use('/api', apiRouter)
  
    var publicRouter = express.Router()
    publicCallback({ app: publicRouter, logger })
    //prefix
    app.use('/', publicRouter)
 */

  // errors
  app.use((err, req, res, next) => {
    // Do logging and user-friendly error message display
    logger.error(err)
    return res.status(500).json({
      status: 'error',
      code: 500,
      message: 'internal error',
      error: new Error('internal error'),
    })
  })

  app.use((req, res) =>
    res.status(404).json({
      status: 'error',
      code: 404,
      message: 'Not Found',
      error: new Error('Not Found'),
    })
  )

  return app
}

module.exports = coreConfig
