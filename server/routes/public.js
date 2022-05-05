const express = require('express')
const path = require('path')

const public_route = ({ logger }) => {
  var router = express.Router()

  // create a GET route
  router.get('/express_backend', (req, res) => {
    res.send({ express: 'YOUR EXPRESS BACKEND IS CONNECTED TO REACT' })
  })

  logger.info('\tAdding route "public"...')
  return router
}

module.exports = public_route
