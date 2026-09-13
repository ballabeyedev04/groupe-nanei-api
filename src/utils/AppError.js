// Erreur métier avec un code HTTP explicite — le handler central (voir
// middlewares/errorHandler.js) s'en sert pour répondre correctement sans
// que chaque contrôleur ait à connaître les codes HTTP.
class AppError extends Error {
  constructor(message, statusCode = 400, details = undefined) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.isAppError = true;
  }
}

module.exports = AppError;
