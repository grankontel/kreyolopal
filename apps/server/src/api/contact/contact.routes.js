import handlers from './contact.handlers'
const express = require('express')
const { body, param } = require('express-validator')
const routes = express.Router()

routes.post(
  '/',
  body('firstname').notEmpty(),
  body('lastname').notEmpty(),
  body('email').isEmail(),
  body('subject').notEmpty(),
  body('message').notEmpty(),
  handlers.postContact
)

export default routes
