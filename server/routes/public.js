const express = require('express')
const path = require('path')

const public_route = ({ logger }) => {
  var router = express.Router()

  // create a GET route
  router.get('/express_backend', (req, res) => {
    res.send({ express: 'YOUR EXPRESS BACKEND IS CONNECTED TO REACT' })
  })

  router.use('/', express.static('./frontend/build'))

  router.get(/^(?!\/api)(.+)/, function (req, res) {
    const indexFile = path.join(__dirname, '../../frontend/build/index.html')
    console.log(`\n\n${indexFile}\n\n`)
    res.sendFile(indexFile)
  })

  logger.info('\tAdding route "public"...')
  return router
}

module.exports = public_route
