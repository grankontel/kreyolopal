const express = require('express')
const { body, validationResult } = require('express-validator')
const passport = require('passport')
const db = require('../database/models')
const { protectedRoute } = require('../services/lib.auth')
const authService = require('../services/authService')

const { User } = db

const profile_route = ({ logger }) => {
  const router = express.Router()

  // create a GET route
  router.get('/profile', protectedRoute, async (req, res) => {
    const profile = await User.findByPk(req.user.id)
    if (profile === null) {
      logger.error('cannot find user')
      logger.error(req.user)
      return res.status(500).json({ status: 'error', error: 'Internal error' })
    }

    const lUser = {
      firstname: profile.firstname,
      lastname: profile.lastname,
      email: profile.email,
    }

    return res.json({
      status: 'success',
      data: { profile: lUser },
    })
  })

  // create a POST route
  router.post(
    '/profile',
    [
      body('firstname').notEmpty(),
      body('lastname').notEmpty(),
      body('gender').optional().isIn(['Homme', 'Femme']),
    ],
    passport.authenticate('jwt-cookiecombo', {
      session: false,
    }),
    async (req, res) => {
      // Finds the validation errors in this request and wraps them in an object with handy functions
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(422).json({ status: 'error', errors: errors.array() })
      }

      const { firstname, lastname } = req.body

      const profile = await User.findByPk(req.user.id)
      if (profile === null) {
        logger.error(`Cannot find user : ${req.user.id}`)
        return res
          .status(500)
          .json({ status: 'error', error: 'Internal error' })
      }

      profile.firstname = firstname
      profile.lastname = lastname

      return profile.save().then(
        () => {
          res.status(200).send({
            status: 'success',
            data: {},
          })
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
    '/updatepwd',
    protectedRoute,
    [
      // password must be at least 6 chars long
      body('currentPassword'),
      body('newPassword').isLength({ min: 5 }),
      body('verification').custom((value, { req }) => {
        if (value !== req.body.newPassword) {
          throw new Error('Password confirmation does not match password')
        }
        return true
      }),
    ],
    async (req, res) => {
      // Finds the validation errors in this request and wraps them in an object with handy functions
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(422).json({ status: 'error', error: errors.array() })
      }

      const { currentPassword, newPassword } = req.body

      const user = await User.findByPk(req.user.id)
      if (user === null) {
        logger.error(`Cannot find user ${req.user.email} in database`)
        return res.status(401).json({
          status: 'error',
          code: 401,
          message: 'Unauthorized',
          error: new Error('Unauthorized'),
        })
      }

      const isValid = await authService.verifyPassword(
        user.password,
        currentPassword
      )

      if (!isValid) {
        return res.status(401).json({
          status: 'error',
          code: 401,
          message: 'Unauthorized',
          error: new Error('Unauthorized'),
        })
      }

      return authService.hashPassword(newPassword).then(
        (hashedPassword) => {
          user.password = hashedPassword
          user.save({ fields: ['password'] }).then(
            () => {
              res.status(200).send({
                status: 'success',
                data: {},
              })
            },
            (reason) => {
              logger.error(reason)
              return res
                .status(500)
                .json({ status: 'error', error: 'Internal error' })
            }
          )
        },
        (reason) => {
          logger.error(`cannot hash password for ${req.user.email}`)
          logger.error(reason)
          return res
            .status(500)
            .json({ status: 'error', error: 'Internal error' })
        }
      )
    }
  )

  router.post(
    '/resetpwd',
    [
      // password must be at least 6 chars long
      body('token')
        .notEmpty()
        .custom((value) => {
          const isToken = /[A-Za-z0-9]{64}/
          return value.length > 0 && isToken.test(value)
        }),
      body('newPassword').isLength({ min: 5 }),
      body('verification').custom((value, { req }) => {
        if (value !== req.body.newPassword) {
          throw new Error('Password confirmation does not match password')
        }
        return true
      }),
    ],
    async (req, res) => {
      // Finds the validation errors in this request and wraps them in an object with handy functions
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(422).json({ status: 'error', error: errors.array() })
      }

      const { token, newPassword } = req.body

      const user = await User.findOne({ where: { reset_pwd_token: token } })
      if (user === null) {
        logger.error(`Cannot find user in database`)
        return res.status(401).json({
          status: 'error',
          code: 401,
          message: 'Unauthorized',
          error: new Error('Unauthorized'),
        })
      }

      return authService.hashPassword(newPassword).then(
        (hashedPassword) => {
          user.password = hashedPassword
          user.save({ fields: ['password'] }).then(
            () => {
              res.status(200).send({
                status: 'success',
                data: {},
              })
            },
            (reason) => {
              logger.error(reason)
              return res
                .status(500)
                .json({ status: 'error', error: 'Internal error' })
            }
          )
        },
        (reason) => {
          logger.error(`cannot hash password for ${user.email}`)
          logger.error(reason)
          return res
            .status(500)
            .json({ status: 'error', error: 'Internal error' })
        }
      )
    }
  )

  logger.info('\tAdding route "profile"...')
  return router
}

module.exports = profile_route
