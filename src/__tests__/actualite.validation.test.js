const { creerActualiteSchema, modifierActualiteSchema } = require('../modules/actualites/actualite.validation');

describe('creerActualiteSchema', () => {
  it('accepte un titre et un contenu valides', () => {
    const { error } = creerActualiteSchema.validate({ titre: 'Nouveau chantier', contenu: 'Nous démarrons un nouveau chantier à Nanterre.' });
    expect(error).toBeUndefined();
  });

  it('refuse un titre manquant', () => {
    const { error } = creerActualiteSchema.validate({ contenu: 'Contenu suffisant.' });
    expect(error).toBeDefined();
  });

  it('refuse un contenu trop court', () => {
    const { error } = creerActualiteSchema.validate({ titre: 'Titre', contenu: 'a' });
    expect(error).toBeDefined();
  });

  it('accepte une date de publication future (programmation)', () => {
    const { error } = creerActualiteSchema.validate({
      titre: 'Titre',
      contenu: 'Contenu suffisant.',
      publieLe: new Date(Date.now() + 86400000).toISOString(),
    });
    expect(error).toBeUndefined();
  });
});

describe('modifierActualiteSchema', () => {
  it('accepte une modification partielle (seul le titre)', () => {
    const { error } = modifierActualiteSchema.validate({ titre: 'Titre corrigé' });
    expect(error).toBeUndefined();
  });

  it("refuse un objet vide — au moins un champ à modifier", () => {
    const { error } = modifierActualiteSchema.validate({});
    expect(error).toBeDefined();
  });
});
