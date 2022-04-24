const sp_route= require('./spellcheck');
const public_route=require('./public');

function allRoutes({app, dbcon, logger}) {
    app.use(sp_route({dbcon, logger}));
    app.use(public_route({dbcon, logger}));
}

function zakariRoutes({app, dbcon, logger}) {
    app.use(sp_route({dbcon, logger}));
}

function publicRoutes({app, dbcon, logger}) {
    app.use(public_route({dbcon, logger}));
}

module.exports = {allRoutes, publicRoutes, zakariRoutes}