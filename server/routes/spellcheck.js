const express = require('express')
const passport = require('passport')
const { check, oneOf, validationResult } = require('express-validator')
const spellchecker = require('../services/spellchecker')
const db = require('../database/models')
const Msg = db['Spellchecked']

const sp_route = ({ logger }) => {
  var router = express.Router()

  router.post(
    '/spellcheck',
    [check('kreyol').isIn(['GP', 'MQ']), check('request').notEmpty()],
    passport.authenticate('jwt-cookiecombo', {
      session: false,
    }),
    async (req, res) => {
      // Finds the validation errors in this request and wraps them in an object with handy functions
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(422).json({ status: 'error', errors: errors.array() })
      }

      var _message = {
        user: req.user.id,
        tool: req.headers['user-agent'],
        service: 'spellcheck',
        kreyol: req.body.kreyol,
        request: req.body.request,
      }

      // var message = cloneDeep(_message);

      return spellchecker.check(_message).then(async (response) => {
        await Msg.create({
          userId: _message.user,
          kreyol: _message.kreyol,
          request: _message.request,
          message: response.message,
          status: response.status,
          response: response,
        })
        _message.response = response
        //console.info('%o',message)
        res.status(200).json(_message)
        return _message
      })
    }
  )

  logger.info('\tAdding route "spellcheck"...')
  return router
}

module.exports = sp_route
