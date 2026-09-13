// Centralise la lecture des variables d'environnement : un seul endroit à
// vérifier si une valeur manque, plutôt que des `process.env.X` éparpillés.
require('dotenv').config();

function requis(nom, valeurParDefaut) {
  const valeur = process.env[nom];
  if (valeur === undefined || valeur === '') {
    if (valeurParDefaut !== undefined) return valeurParDefaut;
    // On ne bloque pas le démarrage pour autant (utile en CI/tests) : les
    // endpoints qui dépendent réellement de la valeur échoueront alors
    // explicitement (ex. Resend) plutôt que de planter tout le process.
    return undefined;
  }
  return valeur;
}

module.exports = {
  env: requis('NODE_ENV', 'development'),
  port: parseInt(requis('PORT', '3000'), 10),
  host: requis('HOST', '0.0.0.0'),

  db: {
    host: requis('DB_HOST', 'localhost'),
    port: parseInt(requis('DB_PORT', '5432'), 10),
    name: requis('DB_NAME', 'groupe_nanei'),
    user: requis('DB_USER', 'groupe_nanei'),
    password: requis('DB_PASSWORD', ''),
    ssl: requis('DB_SSL', 'false') === 'true',
  },

  jwtSecret: requis('JWT_SECRET'),
  jwtExpiresIn: requis('JWT_EXPIRES_IN', '8h'),
  cookieName: requis('COOKIE_NAME', 'gn_admin_token'),

  adminEmail: requis('ADMIN_EMAIL'),
  adminPassword: requis('ADMIN_PASSWORD'),
  adminNom: requis('ADMIN_NOM', 'Administrateur'),

  // Liste d'origines séparées par une virgule → tableau, pour cors().
  corsOrigins: requis('CORS_ORIGIN', 'http://localhost:5173')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean),

  resendApiKey: requis('RESEND_API_KEY'),
  resendFrom: requis('RESEND_FROM', 'Groupe Nanei <contact@groupe-nanei.fr>'),
  adminNotificationEmail: requis('ADMIN_NOTIFICATION_EMAIL'),
};
