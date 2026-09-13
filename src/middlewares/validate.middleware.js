const AppError = require('../utils/AppError');

// Valide req[source] avec un schéma Joi et remplace la valeur par la
// version "nettoyée" (stripUnknown, valeurs par défaut appliquées) — les
// contrôleurs lisent alors des données déjà sûres.
module.exports = function validate(schema, source = 'body') {
  return function (req, res, next) {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,
      stripUnknown: true,
    });
    if (error) {
      const details = error.details.map((d) => d.message);
      return next(new AppError('Données invalides.', 422, details));
    }
    req[source] = value;
    return next();
  };
};
