const config = require('./config')
const express = require('express')
const configureApp = require('./app')
const logger = require('./services/logger')
const path = require('path')
const port = config.app.port || 5000

const _createServer = (app) => {
  if (process.env.NODE_ENV === 'production') {
    const http = require('http')
    return http.createServer(app)
  }
  const https = require('https')
  const fs = require('fs')

  console.log(__dirname)
  const options = {
    key: fs.readFileSync(path.join(__dirname, './devcert/key.pem')),
    cert: fs.readFileSync(path.join(__dirname, './devcert/cert.pem')),
  }

  return https.createServer(options, app)
}

async function startServer() {
  const app = express()

  //configure express
  const _server = await configureApp({
    app,
    logger /* , routesCallback: allRoutes */,
  })

  let server = _createServer(_server)

  server.listen(port, (err) => {
    if (err) {
      logger.error(err)
      return
    }

    console.log('Your server is ready on http://localhost:' + port)
  })
}

startServer()
