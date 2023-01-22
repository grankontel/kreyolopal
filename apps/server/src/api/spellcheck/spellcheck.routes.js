import handlers from './spellcheck.handlers'
const express = require('express')
const { check, param } = require('express-validator')
const routes = express.Router()

// get spellcheck
routes.get('/', handlers.getSpellChecks)

routes.post(
  '/',
  check('kreyol').isIn(['GP', 'MQ']),
  check('request').notEmpty(),

  handlers.postSpellCheck
)

routes.post(
  '/:id/rating',
  param('id').isNumeric(),
  check('rating').isInt({ min: 0, max: 5 }),
  check('user_correction').optional().isString(),
  check('user_notes').optional().isString(),

  handlers.postRating
)

export default routes
