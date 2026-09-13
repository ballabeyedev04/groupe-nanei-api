const dureeEnMs = require('../utils/dureeEnMs');

describe('dureeEnMs', () => {
  it('convertit les heures', () => {
    expect(dureeEnMs('8h')).toBe(8 * 60 * 60 * 1000);
  });

  it('convertit les jours', () => {
    expect(dureeEnMs('7d')).toBe(7 * 24 * 60 * 60 * 1000);
  });

  it('convertit les minutes', () => {
    expect(dureeEnMs('30m')).toBe(30 * 60 * 1000);
  });

  it('retombe sur la valeur par défaut si le format est invalide', () => {
    expect(dureeEnMs('n-importe-quoi', 12345)).toBe(12345);
  });
});
