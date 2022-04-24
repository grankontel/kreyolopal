const config = require('./config')
const express = require('express')
const configureApp = require('./app')
const logger = require('./services/logger')
const port = config.app.port || 5000

async function startServer() {
  const app = express()

  //configure express
  const server = await configureApp({
    app,
    logger /* , routesCallback: allRoutes */,
  })

  server.listen(port, (err) => {
    if (err) {
      logger.error(err)
      return
    }

    console.log('Your server is ready on http://localhost:' + port)
  })
}

startServer()
