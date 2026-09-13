const rateLimit = require('express-rate-limit');

// Le formulaire de devis est public et donc la cible la plus probable de
// spam/abus — on limite par IP sans pénaliser un usage normal (quelques
// demandes par heure suffisent largement pour un visiteur légitime).
const limiteurDevis = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { succes: false, message: 'Trop de demandes envoyées. Merci de réessayer plus tard.' },
});

// Le login admin n'a qu'un seul compte à protéger : limite stricte contre
// le bruteforce, sans bloquer un admin qui se trompe deux fois de mot de passe.
const limiteurLogin = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { succes: false, message: 'Trop de tentatives. Merci de réessayer dans quelques minutes.' },
});

module.exports = { limiteurDevis, limiteurLogin };
