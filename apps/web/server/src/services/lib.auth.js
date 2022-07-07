const jwt = require('jsonwebtoken')
const passport = require('passport')
const config = require('../config')
const userService = require('./userService')
const authService = require('./authService')
const logger = require('./logger')

class NotAuthenticatedError extends Error {
  constructor(error) {
    super('Unauthorized')
    this.name = 'NotAuthenticatedError'
    this.error = error
    this.code = 401
  }
}

function passportCb(req, res, next) {
  return async (error, user) => {
    // Wrap errors in not authenticated error
    if (error) {
      return next(new NotAuthenticatedError(error))
    }

    // No user found?
    if (!user) {
      return res.status(401).json({
        status: 'error',
        code: 401,
        message: 'Unauthorized',
        error: new Error('Unauthorized'),
      })
    }

    //find true user
    return userService.findbyEmail(user.email).then(
      (record) => {
        /*       //User pending approval?
      if (user.isPending) {
        return next(new UserPendingError());
      }
  
      //User archived?
      if (user.isArchived) {
        return next(new UserArchivedError());
      } */

        // Set user in request
        req.user = record
        return next()
      },
      (reason) => {
        logger.error(reason)
        return res.status(401).json({
          status: 'error',
          code: 401,
          message: 'Unauthorized',
          error: new Error('Unauthorized'),
        })
      }
    )
  }
}

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

export const logUserIn = (user, req) => {
  req.session.passport = {
    id: user.id,
    username: user.email,
  }

  req.user = user

  return new Promise((resolve, reject) => {
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
      { expiresIn: '1d' },
      (err, token) => {
        if (err) {
          reject(err)
          return
        }

        req.user.lastlogin = new Date()
        req.user.save()

        const payload = { email: req.user.email, jwt: token }
        // Return json web token
        resolve({
          payload,
          setCookie: (res) => {
            // Send Set-Cookie header
            res.cookie('jwt', token, {
              httpOnly: true,
              sameSite: true,
              signed: true,
              secure: true,
            })
          },
        })
      }
    )
  })
}

export const protectedRoute = (req, res, next) => {
  const callback = passportCb(req, res, next)
  return passport.authenticate('jwt-cookiecombo', callback)(req, res, next)
}
