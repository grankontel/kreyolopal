const express = require('express')
const { check, body, oneOf, validationResult } = require('express-validator')
const userService = require('../services/userService')
const passport = require('passport')
const LocalStrategy = require('passport-local')
const authService = require('../services/authService')
const logger = require('../services/logger')
const config = require('../config')
const jwt = require('jsonwebtoken')
const User = require('../models/user')

passport.use(
  new LocalStrategy({ usernameField: 'email' }, (username, password, done) => {
    logger.info('auth request', { username, password })
    userService.findbyEmail(username).then(async (record) => {
      logger.debug(record)
      if (record === null) {
        return done(null, false)
      }
      const isValid = await authService.verifyPassword(
        record.password,
        password
      )
      return isValid ? done(null, record) : done(null, false)
    })
  })
)

const auth_route = ({ dbcon, logger }) => {
  var router = express.Router()

  router.post('/auth/login', passport.authenticate('local'), (req, res) => {
    jwt.sign({ user: req.user }, config.security.salt, (err, token) => {
      if (err) return res.json(err)

      console.log(req.user instanceof User)

      req.user.lastlogin = new Date()
      req.user.save()
      
      // Send Set-Cookie header
      res.cookie('jwt', token, {
        httpOnly: true,
        sameSite: true,
        signed: true,
        secure: true,
      })

      // Return json web token
      return res.json({
        status: 'success',
        data: { email: req.user.email, jwt: token },
      })
    })
  })

  router.post(
    '/auth/logout',
    passport.authenticate('jwt-cookiecombo', {
      session: false,
    }),
    (req, res) => {
      req.logout()
      res.status(200).send({
        status: 'success',
        data: {},
      })
    }
  )

  router.post(
    '/auth/register',
    [
      body('email').isEmail(),
      // password must be at least 6 chars long
      body('password1').isLength({ min: 5 }),
      body('password2').custom((value, { req }) => {
        if (value !== req.body.password1) {
          throw new Error('Password confirmation does not match password')
        }
        return true
      }),
      body('firstname').notEmpty(),
      body('lastname').notEmpty(),
      body('gender').optional().isIn(['Homme', 'Femme']),
    ],
    (req, res) => {
      // Finds the validation errors in this request and wraps them in an object with handy functions
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(422).json({ error: errors.array() })
      }

      let record = {
        email: req.body.email.toLowerCase(),
        password: req.body.password1,
        firstname: req.body.firstname,
        lastname: req.body.lastname,
      }

      userService
        .register(record)
        .then(
          () => {
            logger.info('register success')
            res.status(201).send({
              status: 'success',
              data: {
                email: record.email,
                firstname: record.firstname,
                lastname: record.lastname,
              },
            })
          },
          (error) => {
            logger.error(error)
            res.status(500).send({ status: 'error', error })
          }
        )
        .catch((_error) => {
          res.status(500).send({ status: 'error', error: [_error] })
        })
    }
  )

  logger.info('\tAdding route "auth"...')
  return router
}

module.exports = auth_route
