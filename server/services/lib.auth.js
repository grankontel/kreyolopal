const jwt = require('jsonwebtoken')
const config = require('../config')
const userService = require('./userService')
const authService = require('./authService')
const logger = require('./logger')

export const authenticateUser = (email, password) =>
  new Promise((resolve, reject) => {
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

export const logUserIn = (user, req, res) => {
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

      const payload = { email: req.user.email, jwt: token }
      // Return json web token
      return res.json({
        status: 'success',
        data: payload,
      })
    }
  )
}
