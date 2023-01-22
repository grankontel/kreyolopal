const sp_route = require('./spellcheck');
const public_route = require('./public');
const auth_route = require('./auth');
const profile_route = require('./profile');
const admin_route = require ('./admin');
const dico_route = require('./dico')
// const wabap_route = require('./wabap')

function apiRoutes({ app, logger }) {
  app.use(sp_route({ logger }));
  app.use(auth_route({ logger }));
  app.use(profile_route({ logger }));
  app.use(dico_route({ logger }));
//  app.use(wabap_route({ logger }));
  app.use(admin_route({logger}));
}

function zakariRoutes({ app, logger }) {
  app.use(sp_route({ logger }));
}

function publicRoutes({ app, logger }) {
  app.use(public_route({ logger }));
}

module.exports = { apiRoutes, publicRoutes, zakariRoutes };
