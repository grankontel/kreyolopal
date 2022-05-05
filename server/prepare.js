const config = require('./config')
const express = require('express')
const passport = require('passport')
const db = require('./database/models')
const sequelize = db.sequelize
const expressSession = require('express-session')
const SessionStore = require('express-session-sequelize')(expressSession.Store)
const JwtCookieComboStrategy = require('passport-jwt-cookiecombo')

const passportPrepare = (logger) => {
  passport.serializeUser(function (user, cb) {
    console.log('serializeUser')
    process.nextTick(function () {
      cb(null, { id: user.id, username: user.email })
    })
  })

  passport.deserializeUser(function (user, cb) {
    console.log('deserializeUser')
    process.nextTick(function () {
      return cb(null, user)
    })
  })

  passport.use(
    new JwtCookieComboStrategy(
      {
        secretOrPublicKey: config.security.salt,
      },
      (payload, done) => {
        return done(null, payload.user)
      }
    )
  )
}

async function coreConfig({ app, logger, routeCallback }) {
  //configure logger
  const expressPino = require('express-pino-logger')({
    logger: logger,
  })

  app.use(expressPino)

  //trust proxy
  app.enable('trust proxy')

  // cross-origin
  const cors = require('cors')
  app.options('*', cors()) // include before other routes

  app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*')
    res.header(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept'
    )
    next()
  })

  app.use(require('cookie-parser')(config.security.salt))
  app.use(require('body-parser').urlencoded({ extended: true }))
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

  //body parser
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

  //errors
  app.use(function (err, req, res, next) {
    // Do logging and user-friendly error message display
    logger.error(err)
    return res.status(500).json({
      status: 'error',
      code: 500,
      message: 'internal error',
      error: new Error('internal error'),
    })
  })

  app.use(function (req, res) {
    return res.status(404).json({
      status: 'error',
      code: 404,
      message: 'Not Found',
      error: new Error('Not Found'),
    })
  })

  return app
}

module.exports = coreConfig
