const express = require('express')
const http = require('http')
const path = require('path')
const config = require('./config')
const myLogger = require('./services/logger')
const coreConfig = require('./express')
const { apiRoutes, publicRoutes } = require('./routes')

const CLIENT_BUILD_PATH = path.join(__dirname, '../front')

const installRoutes = ({ app, logger }) => {
  app.get('/api', (req, res) => {
    res.send({ message: 'Welcome to server!' })
  })

  const apiRouter = express.Router()
  apiRoutes({ app: apiRouter, logger })
  // prefix
  app.use('/api', apiRouter)

  const publicRouter = express.Router()
  publicRoutes({ app: publicRouter, logger })
  // prefix
  app.use('/backend', publicRouter)

  // serve static assets
  app.get(
    /\.(js|css|map|webmanifest|json|xml|txt|svg|png|webp|jpeg|ico)$/,
    express.static(CLIENT_BUILD_PATH)
  )

  // for any other requests, send `index.html` as a response
  app.get(/^(?!\/(api|backend))(.+)/, (request, response) => {
    response.sendFile(path.join(CLIENT_BUILD_PATH, 'index.html'))
  })
}

const port = config.app.port || 5000
async function startServer() {
  const app = express()

  // configure express
  const lServer = await coreConfig({
    app,
    logger: myLogger /* , routesCallback: allRoutes */,
    routeCallback: installRoutes,
  })

  const server = http.createServer(lServer)

  server.listen(port, (err) => {
    if (err) {
      myLogger.error(err)
      return
    }

    process.stdout.write(
      `\n🚀 Your server is ready on http://localhost:${port}\n\n`
    )
  })
}

startServer()
