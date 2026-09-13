// Convertit une durée façon JWT ("8h", "30m", "7d") en millisecondes, pour
// aligner le maxAge du cookie sur l'expiration réelle du token.
const UNITES = { s: 1000, m: 60 * 1000, h: 60 * 60 * 1000, d: 24 * 60 * 60 * 1000 };

module.exports = function dureeEnMs(chaine, valeurParDefaut = 8 * 60 * 60 * 1000) {
  const m = /^(\d+)([smhd])$/.exec(String(chaine).trim());
  if (!m) return valeurParDefaut;
  return parseInt(m[1], 10) * UNITES[m[2]];
};
