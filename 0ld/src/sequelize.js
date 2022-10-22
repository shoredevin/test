const Sequelize = require('sequelize');

module.exports.sequelize = function sequelize(app) {
  const connectionString = app.get('databaseUrl');
  if (!connectionString) throw new Error('Database connection string is not set in config \'databaseUrl\'');
  const sequelize = new Sequelize(connectionString, {
    //logging: console.log,
    logging: false,
    define: {
      freezeTableName: true
    }
  });
  const oldSetup = app.setup;

  app.set('sequelizeClient', sequelize);

  app.setup = function (...args) {
    const result = oldSetup.apply(this, args);

    // Set up data relationships
    const models = sequelize.models;
    Object.keys(models).forEach(name => {
      if ('associate' in models[name]) {
        models[name].associate(models);
      }
    });

    return result;
  };
};


module.exports.connectAndSync = async function connectAndSync(app) {
  const sequelize = app.get('sequelizeClient');
  if (!sequelize) throw new Error('Internal error: sequelizeClient not set');

  // Wait a while for the database to be up
  let tries = 20;
  while (--tries >= 0) {
    try {
      await sequelize.authenticate();
      break;
    } catch (err) {
      if (tries === 0) throw err;
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  const opts = { force: true };
  await sequelize.sync(opts);
};
