const config = require('./config')
const express = require('express')
const {allRoutes} = require('./routes')

async function configureApp({
  app,
  logger , routesCallback = allRoutes,
}) {

    //configure logger
  const expressPino = require('express-pino-logger')({
    logger: logger,
  })

  app.use(expressPino)

  //trust proxy
  app.enable('trust proxy')

  // cross-origin
  const cors = require('cors')
  app.options('*', cors()) // include before other routes

  app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*')
    res.header(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept'
    )
    next()
  })

  /*     //jwt
    const jwt = require('./middlewares/jwt');
    jwt({app, logger});
 */
  //body parser
  app.use(express.json())

  /*     //db connection
    connectMongo = require('./services/db');

    await connectMongo()
    .then(dbcon => {
        routesCallback({app, dbcon, logger});
    })
    .catch(err => {
        logger.error(err);
        res.status(500).send({status:500, message: 'internal error', type:'internal'}); 
    })
 */

    routesCallback({app, dbcon: null, logger});

  //errors
  app.use(function (err, req, res, next) {
    // Do logging and user-friendly error message display
    logger.error(err)
    res
      .status(500)
      .send({ status: 500, message: 'internal error', type: 'internal' })
  })

  app.use(function (req, res) {
    res
      .status(404)
      .send({ status: 404, message: 'Not found', type: 'internal' })
  })

  return app
}

module.exports = configureApp
