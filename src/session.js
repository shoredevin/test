const session = require('express-session');
const sessionSequelize = require('connect-session-sequelize');

// initalize sequelize with session store
const SequelizeStore = sessionSequelize(session.Store);


module.exports = function sessionInit(app) {
  const sequelize = app.get('sequelizeClient');
  if (!sequelize) throw new Error('Internal error: sequelizeClient not set when initializing session');
  const tlsEnabled = app.get('tlsEnabled');

  const sess = session({
    cookie: {
      secure: tlsEnabled,
    },

    // True if we do SSL external to Node
    proxy: tlsEnabled,

    // session-sequelize supports the touch method so per the
    // express-session docs this should be set to false
    resave: false,

    saveUninitialized: true,
    secret: app.get('sessionSecret'),
    store: new SequelizeStore({ db: sequelize }),
  });

  app.set('expressSession', sess);
  app.use(sess);
};
