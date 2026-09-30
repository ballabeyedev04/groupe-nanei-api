const { profilSchema, motDePasseSchema } = require('../modules/auth/auth.validation');

describe('profilSchema', () => {
  it('accepte un nom et un e-mail valides', () => {
    expect(profilSchema.validate({ nom: 'Awa Diop', email: 'awa@example.com' }).error).toBeUndefined();
  });

  it('refuse un e-mail invalide', () => {
    expect(profilSchema.validate({ nom: 'Awa', email: 'pas-un-email' }).error).toBeDefined();
  });
});

describe('motDePasseSchema', () => {
  it('refuse un nouveau mot de passe trop court', () => {
    const { error } = motDePasseSchema.validate({ motDePasseActuel: 'ancien-mdp', nouveauMotDePasse: 'court' });
    expect(error.details[0].message).toMatch(/au moins 8 caractères/);
  });

  it("refuse un nouveau mot de passe identique à l'actuel", () => {
    const { error } = motDePasseSchema.validate({ motDePasseActuel: 'meme-mdp-123', nouveauMotDePasse: 'meme-mdp-123' });
    expect(error.details[0].message).toMatch(/différent/);
  });

  it('accepte un changement valide', () => {
    expect(motDePasseSchema.validate({ motDePasseActuel: 'ancien', nouveauMotDePasse: 'nouveau-mdp-123' }).error).toBeUndefined();
  });
});
