const jwt = require('jsonwebtoken');
const env = require('../config/env');
const AppError = require('../utils/AppError');

// Un seul type de compte existe (l'admin) : ce middleware protège donc
// simplement "tout ce qui n'est pas public", sans distinction de rôle.
module.exports = function requireAuth(req, res, next) {
  const token = req.cookies?.[env.cookieName];
  if (!token) return next(new AppError('Authentification requise.', 401));

  try {
    const payload = jwt.verify(token, env.jwtSecret);
    req.admin = { id: payload.sub, email: payload.email };
    return next();
  } catch (e) {
    return next(new AppError('Session invalide ou expirée, merci de vous reconnecter.', 401));
  }
};
