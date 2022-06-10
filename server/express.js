const express = require('express')
const http = require('http')
const path = require('path')
const config = require('./config')
const { apiRoutes, publicRoutes } = require('./routes')
const { reactRoute } = require('./react.strict')
const coreConfig = require('./prepare')
const myLogger = require('./services/logger')

const port = config.app.port || 5000

const createServer = (app) => http.createServer(app)

const installRoutes = ({ app, logger }) => {
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
    express.static(path.resolve(__dirname, '../dist'))
  )

  // for any other requests, send `index.html` as a response
  app.use(/^(?!\/(api|backend))(.+)/, (req, res) => reactRoute(req, res))
}

async function startServer() {
  const app = express()

  // configure express
  const lServer = await coreConfig({
    app,
    logger: myLogger /* , routesCallback: allRoutes */,
    routeCallback: installRoutes,
  })

  const server = createServer(lServer)

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
