const express = require('express');
const path = require('path');
const config = require('./config');
const { apiRoutes, publicRoutes } = require('./routes');
const { reactRoute } = require('./react.strict');
const coreConfig = require('./prepare');
const logger = require('./services/logger');

const port = config.app.port || 5000;

const _createServer = (app) => {
  const http = require('http');
  return http.createServer(app);
};

const installRoutes = ({ app, logger }) => {
  console.log('inside installRoutes');
  const apiRouter = express.Router();
  apiRoutes({ app: apiRouter, logger });
  // prefix
  app.use('/api', apiRouter);

  const publicRouter = express.Router();
  publicRoutes({ app: publicRouter, logger });
  // prefix
  app.use('/', publicRouter);

  // serve static assets
  app.get(
    /\.(js|css|map|webmanifest|json|xml|txt|svg|png|jpeg|ico)$/,
    express.static(path.resolve(__dirname, '../dist'))
  );

  // for any other requests, send `index.html` as a response
  app.use(/^(?!\/api)(.+)/, (req, res) => reactRoute(req, res));
};

async function startServer() {
  const app = express();

  // configure express
  const _server = await coreConfig({
    app,
    logger /* , routesCallback: allRoutes */,
    routeCallback: installRoutes,
  });

  const server = _createServer(_server);

  server.listen(port, (err) => {
    if (err) {
      logger.error(err);
      return;
    }

    console.log(`Your server is ready on http://localhost:${port}`);
  });
}

startServer();
