const express = require('express')
const { check, validationResult } = require('express-validator')
const config = require('../config')
const spellchecker = require('../services/spellchecker')
const db = require('../database/models')
const webhook = require('../services/slackService')
const { protectedRoute } = require('../services/lib.auth')

const { User, Spellchecked: Msg } = db

const sp_route = ({ logger }) => {
  const router = express.Router()

  router.post(
    '/spellcheck',
    [check('kreyol').isIn(['GP', 'MQ']), check('request').notEmpty()],
    protectedRoute,
    async (req, res) => {
      // Finds the validation errors in this request and wraps them in an object with handy functions
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(422).json({ status: 'error', errors: errors.array() })
      }

      const profile = await User.findByPk(req.user.id)
      logger.info(profile)
      if (profile === null) {
        return res.status(401).json({
          status: 'error',
          code: 401,
          message: 'Unauthorized',
          error: new Error('Unauthorized'),
        })
      }

      const lMessage = {
        user: req.user.id,
        tool: req.headers['user-agent'],
        service: 'spellcheck',
        kreyol: req.body.kreyol,
        request: req.body.request.replace(/ç/, 's'),
      }

      // var message = cloneDeep(_message);

      return spellchecker
        .check(lMessage)
        .then(async (response) => {
          const msg = await Msg.create({
            userId: lMessage.user,
            kreyol: lMessage.kreyol,
            request: lMessage.request,
            message: response.message,
            status: response.status,
            response,
          })

          return msg
        })
        .tap((savedMsg) => {
          if (config.slack.noSend) {
            return
          }

          const checkedMsg = savedMsg.response
          if (!checkedMsg.unknown_words.length) {
            return
          }

          const wlist = checkedMsg.unknown_words.join(',')
          const str = `Words [${wlist}] are unknown.\nMessage id : ${savedMsg?.id}`

          try {
            webhook.send({ text: str })
          } catch (eSlack) {
            logger.error(eSlack)
          }
        })
        .then(async (msg) => {
          lMessage.response = msg.response
          // console.info('%o',message)
          res.status(200).json(lMessage)
          return lMessage
        })
    }
  )

  logger.info('\tAdding route "spellcheck"...')
  return router
}

module.exports = sp_route
