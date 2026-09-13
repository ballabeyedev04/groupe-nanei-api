const env = require('../config/env');

// Middleware final : toute erreur (AppError métier, erreur Joi, erreur
// Sequelize, ou bug non prévu) passe par ici et ressort au même format JSON.
// eslint-disable-next-line no-unused-vars
module.exports = function errorHandler(err, req, res, next) {
  const statusCode = err.isAppError ? err.statusCode : err.statusCode || 500;

  if (statusCode >= 500) {
    // On log la stack complète côté serveur, jamais renvoyée au client.
    console.error('[erreur]', err);
  }

  res.status(statusCode).json({
    succes: false,
    message: statusCode >= 500 && env.env === 'production' ? 'Erreur serveur inattendue.' : err.message,
    details: err.details,
  });
};
