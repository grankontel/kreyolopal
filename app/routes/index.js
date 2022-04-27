const sp_route = require('./spellcheck')
const public_route = require('./public')
const auth_route = require('./auth')

function apiRoutes({ app, logger }) {
  app.use(sp_route({ logger }))
  app.use(auth_route({ logger }))
}

function zakariRoutes({ app, logger }) {
  app.use(sp_route({ logger }))
}

function publicRoutes({ app, logger }) {
  app.use(public_route({ logger }))
}

module.exports = { apiRoutes, publicRoutes, zakariRoutes }
