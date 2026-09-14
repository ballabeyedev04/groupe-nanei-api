const { enregistrerCoordonneesSchema } = require('../modules/coordonnees/coordonnees.validation');

describe('enregistrerCoordonneesSchema', () => {
  it('accepte les trois champs renseignés', () => {
    const { error } = enregistrerCoordonneesSchema.validate({
      telephone: '01 23 45 67 89',
      email: 'contact@groupe-nanei.fr',
      adresse: '12 rue des Chantiers, 92000 Nanterre',
    });
    expect(error).toBeUndefined();
  });

  it('accepte un seul champ renseigné (les autres restent optionnels)', () => {
    const { error } = enregistrerCoordonneesSchema.validate({ telephone: '01 23 45 67 89' });
    expect(error).toBeUndefined();
  });

  it("refuse un objet entièrement vide — au moins un champ doit être fourni", () => {
    const { error } = enregistrerCoordonneesSchema.validate({});
    expect(error).toBeDefined();
  });

  it('refuse un e-mail invalide', () => {
    const { error } = enregistrerCoordonneesSchema.validate({ email: 'pas-un-email' });
    expect(error).toBeDefined();
  });
});
