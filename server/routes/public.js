const express = require('express')
const { validationResult, body } = require('express-validator')
const { sendFromEmail } = require('../services/emailService')
const config = require('../config')

const public_route = ({ logger }) => {
  const router = express.Router()

  // create a GET route
  router.get('/express_backend', (req, res) => {
    res.send({ express: 'YOUR EXPRESS BACKEND IS CONNECTED TO REACT' })
  })

  // contact
  router.post(
    '/contact',
    [
      body('firstname').notEmpty(),
      body('lastname').notEmpty(),
      body('email').isEmail(),
      body('subject').notEmpty(),
      body('message').notEmpty(),
    ],
    (req, res) => {
      // Finds the validation errors in this request and wraps them in an object with handy functions
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(422).json({ status: 'error', errors: errors.array() })
      }

      const { firstname, lastname, email, subject, message } = req.body

      const templateData = {
        user: {
          firstname,
          lastname,
          email,
        },
        subject,
        message,
      }

      return sendFromEmail(
        `'${firstname} ${lastname}' <${email}>`,
        'contactus.mjml',
        templateData,
        config.mail.webmaster,
        `[Kreyolopal] ${subject}`
      )
        .tap(() =>
          sendFromEmail(
            config.mail.webmaster,
            'contact.mjml',
            templateData,
            `'${firstname} ${lastname}' <${email}>`,
            '[Kreyolopal]Mésaj a-w rivé'
          )
        )
        .then(
          () => {
            logger.info('Just sent mail')

            return res.status(200).json({
              status: 'success',
              data: {},
            })
          },
          (reason) => {
            logger.error(reason)
            return res.status(500).send({ status: 'error', error: [reason] })
          }
        )
    }
  )

  logger.info('\tAdding route "public"...')
  return router
}

module.exports = public_route
