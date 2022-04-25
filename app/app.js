const config = require('./config')
const express = require('express')
const passport = require('passport')
const sequelize = require('./services/db')
const expressSession = require('express-session')
const SessionStore = require('express-session-sequelize')(expressSession.Store)
const { allRoutes } = require('./routes')
const JwtCookieComboStrategy = require('passport-jwt-cookiecombo')
const userService = require('./services/userService')

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

async function configureApp({ app, logger, routesCallback = allRoutes }) {
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

  /*     //jwt
    const jwt = require('./middlewares/jwt');
    jwt({app, logger});
 */
  //body parser
  app.use(express.json())

  /*     //db connection
    connectMongo = require('./services/db');

    await connectMongo()
    .then(dbcon => {
        routesCallback({app, dbcon, logger});
    })
    .catch(err => {
        logger.error(err);
        res.status(500).send({status:500, message: 'internal error', type:'internal'}); 
    })
 */

  routesCallback({ app, dbcon: null, logger })

  //errors
  app.use(function (err, req, res, next) {
    // Do logging and user-friendly error message display
    logger.error(err)
    res
      .status(500)
      .send({ status: 500, message: 'internal error', type: 'internal' })
  })

  app.use(function (req, res) {
    res
      .status(404)
      .send({ status: 404, message: 'Not found', type: 'internal' })
  })

  return app
}

module.exports = configureApp
