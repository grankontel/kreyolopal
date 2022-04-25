const express = require('express')
const { check, body, oneOf, validationResult } = require('express-validator')
const userService = require('../services/userService')
const passport = require('passport')
const LocalStrategy = require('passport-local')
const authService = require('../services/authService')
const logger = require('../services/logger')

passport.use(
  new LocalStrategy({usernameField: 'email'}, (username, password, done) => {
      logger.info('auth request', {username, password})
    userService.findbyEmail(username).then(async (record) => {
        logger.debug(record)
        if (record === null) {
            return done(null, false);
        }
        const isValid = await authService.verifyPassword(record.password, password)
        return isValid ?  done(null, record) :  done(null, false);
    })
  })
)

const auth_route = ({ dbcon, logger }) => {
  var router = express.Router()

  router.post('/auth/login',
  passport.authenticate('local'))


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
        return res.status(422).json({ errors: errors.array() })
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
            res.status(201).send('created')
          },
          (error) => {
            logger.error(error)
            res.status(500).send({ error })
          }
        )
        .catch((_error) => {
          res.status(500).send({ errors: [_error] })
        })
    }
  )

  logger.info('\tAdding route "auth"...')
  return router
}

module.exports = auth_route
