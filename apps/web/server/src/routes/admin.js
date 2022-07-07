const express = require('express')
const crud = require('express-crud-router').default
const sequelizeCrud =
  require('express-crud-router-sequelize-v6-connector').default
const db = require('../database/models')
const { protectedRoute } = require('../services/lib.auth')

const admin_route = ({ logger }) => {
  const router = express.Router()

  router.use(protectedRoute)
  router.use((req, res, next) => {

    if (!req.user.is_admin) {
      return res.status(401).json({
        status: 'error',
        code: 401,
        message: 'Unauthorized',
        error: new Error('Unauthorized'),
      })
    }
    next()
  })

  // admin routes
  const { User, Spellchecked, Rating } = db
  router.use(crud('/admin/users', sequelizeCrud(User)))
  router.use(crud('/admin/spellcheckeds', sequelizeCrud(Spellchecked)))
  router.use(crud('/admin/ratings', sequelizeCrud(Rating)))

  logger.info('\tAdding route "admin"...')
  return router
}

module.exports = admin_route
