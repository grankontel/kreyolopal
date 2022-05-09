const express = require('express')
const { body, validationResult } = require('express-validator')
const passport = require('passport')
const db = require('../database/models')

const { User } = db

const profile_route = ({ logger }) => {
  const router = express.Router()

  // create a GET route
  router.get(
    '/profile',
    passport.authenticate('jwt-cookiecombo', {
      session: false,
    }),
    async (req, res) => {
      const profile = await User.findByPk(req.user.id)
      if (profile === null) {
        logger.error('cannot find user')
        logger.error(req.user)
        return res
          .status(500)
          .json({ status: 'error', error: 'Internal error' })
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
    }
  )

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

  logger.info('\tAdding route "profile"...')
  return router
}

module.exports = profile_route
