const express = require('express')
const {
  check,
  body,
  oneOf,
  validationResult,
  param,
} = require('express-validator')
const userService = require('../services/userService')
const passport = require('passport')
const LocalStrategy = require('passport-local')
const authService = require('../services/authService')
const sendEmail = require('../services/emailService')
const logger = require('../services/logger')
const config = require('../config')
const jwt = require('jsonwebtoken')
const db = require('../database/models')
const User = db['User']

const authenticateUser = (email, password) => {
  return new Promise((resolve, reject) => {
    logger.info('auth request', { email, password })
    userService
      .findbyEmail(email)
      .then(
        async (record) => {
          logger.debug(record)
          if (record === null) {
            resolve(false)
          }
          const isValid = await authService.verifyPassword(
            record.password,
            password
          )
          return isValid ? resolve(record) : resolve(false)
        },
        (reason) => {
          reject(reason)
        }
      )
      .catch((error) => {
        reject(error)
      })
  })
}

const logUserIn = (user, req, res) => {
  req.session.passport = {
    id: user.id,
    username: user.email,
  }

  req.user = user

  jwt.sign(
    {
      user: {
        id: user.id,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
      },
    },
    config.security.salt,
    (err, token) => {
      if (err) return res.json(err)

      req.user.lastlogin = new Date()
      req.user.save()

      // Send Set-Cookie header
      res.cookie('jwt', token, {
        httpOnly: true,
        sameSite: true,
        signed: true,
        secure: true,
      })

      console.log(req.session)

      const payload = { email: req.user.email, jwt: token }
      // Return json web token
      return  res.json({
        status: 'success',
        data: payload,
      })

    }
  )
}

passport.use(
  new LocalStrategy({ usernameField: 'email' }, (username, password, done) => {
    authenticateUser(username, password).then(
      (value) => done(null, value),
      (reason) => done(reason, false)
    )
  })
)

const auth_route = ({ logger }) => {
  var router = express.Router()

  router.post(
    '/auth/login',
    [
      // username must be an email
      body('email').isEmail(),
      // password must be at least 6 chars long
      body('password').isString(),
    ],
    (req, res) => {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(422).json({ status: 'error', error: errors.array() })
      }

      const { email, password } = req.body
      return authenticateUser(email, password).then(
        (user) => {
          if (!user) {
            return res
              .status(401)
              .json({ status: 'error', error: 'Unauthorized' })
          }

          req.session.passport = {
            id: user.id,
            username: user.email,
          }

          return logUserIn(user, req, res)
          
        },
        (reason) => {
          logger.error(reason)
          return res
            .status(500)
            .json({ status: 'error', error: 'Internal error' })
        }
      )
    }
  )

  router.post(
    '/auth/logout',
    passport.authenticate('jwt-cookiecombo', {
      session: false,
    }),
    (req, res) => {
      console.log('ok')
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
        return res.status(422).json({ status: 'error', error: errors.array() })
      }

      let record = {
        email: req.body.email.toLowerCase(),
        password: req.body.password1,
        firstname: req.body.firstname,
        lastname: req.body.lastname,
      }

      return userService
        .register(record)
        .then(
          (_saveduser) => {
            logger.info('register success')

            const templateData = {
              user: {
                id: _saveduser.id,
                firstname: _saveduser.firstname,
                lastname: _saveduser.lastname,
                email: _saveduser.email,
              },
              confirm_url:
                'https://kreyolopal.com/api/verifymail/' +
                _saveduser.email_verif_token,
            }
            const recipient_mail = _saveduser.email

            console.log('here')
            console.log('templateData')

            return sendEmail(
              'verifyemail.mjml',
              templateData,
              `'${_saveduser.firstname} ${_saveduser.lastname}' <${recipient_mail}>`,
              'Kontan vwè-w'
            ).then(
              () => {
                return res.status(201).send({
                  status: 'success',
                  data: {
                    email: record.email,
                    firstname: record.firstname,
                    lastname: record.lastname,
                  },
                })
              },
              (reason) => {
                logger.error(reason)
                return res.status(201).send({
                  status: 'success',
                  data: {
                    email: record.email,
                    firstname: record.firstname,
                    lastname: record.lastname,
                  },
                })
              }
            )
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

  router.get(
    '/verifymail/:token',
    [
      param('token')
      .notEmpty()
      .custom((value) => {
        const isToken = /[A-Za-z0-9]{64}/
        return value.length > 0 && isToken.test(value)
      }),
    ],
    (req, res) => {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(422).json({ status: 'error', error: errors.array() })
      }

      const token = req.params.token

      User.findOne({ where: { email_verif_token: token } }).then((_user) => {
        if (_user === null) {
          return res.status(404).json({ status: 'error', error: 'Not Found' })
        }

        _user.email_verif_token = undefined
        return logUserIn(_user, req, res)
      })
    }
  )

  logger.info('\tAdding route "auth"...')
  return router
}

module.exports = auth_route
