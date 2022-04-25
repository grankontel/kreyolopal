const sp_route= require('./spellcheck');
const public_route=require('./public');
const auth_route=require('./auth')

function allRoutes({app, dbcon, logger}) {
    app.use(sp_route({dbcon, logger}));
    app.use(public_route({dbcon, logger}));
    app.use(auth_route({dbcon, logger}))
}

function zakariRoutes({app, dbcon, logger}) {
    app.use(sp_route({dbcon, logger}));
}

function publicRoutes({app, dbcon, logger}) {
    app.use(public_route({dbcon, logger}));
}

module.exports = {allRoutes, publicRoutes, zakariRoutes}