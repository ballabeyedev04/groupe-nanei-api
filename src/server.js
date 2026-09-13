const app = require('./app');
const env = require('./config/env');
const { sequelize } = require('./models');

async function demarrer() {
  try {
    await sequelize.authenticate();
    console.log('[db] connexion établie.');
  } catch (e) {
    console.error('[db] connexion impossible :', e.message);
    process.exit(1);
  }

  app.listen(env.port, env.host, () => {
    console.log(`[api] Groupe Nanei en écoute sur http://${env.host}:${env.port} (${env.env})`);
  });
}

demarrer();
