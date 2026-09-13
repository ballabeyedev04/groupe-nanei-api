// Config consommée par sequelize-cli (migrations). Sépare du reste car la
// CLI exige un module.exports "plat" par environnement, sans logique métier.
require('dotenv').config();

const commun = {
  username: process.env.DB_USER || 'groupe_nanei',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'groupe_nanei',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  dialect: 'postgres',
  dialectOptions:
    process.env.DB_SSL === 'true'
      ? { ssl: { require: true, rejectUnauthorized: false } }
      : {},
};

module.exports = {
  development: commun,
  test: { ...commun, database: process.env.DB_NAME_TEST || `${commun.database}_test` },
  production: commun,
};
