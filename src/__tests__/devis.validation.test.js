const { creerDevisSchema, repondreSchema } = require('../modules/devis/devis.validation');

const donneesValides = {
  nom: 'Jean Dupont',
  telephone: '0601020304',
  email: 'jean@example.com',
  message: 'Nous avons besoin d\'aide pour la logistique de notre chantier.',
  consentementRgpd: true,
};

describe('creerDevisSchema', () => {
  it('accepte une demande complète et valide', () => {
    const { error } = creerDevisSchema.validate(donneesValides);
    expect(error).toBeUndefined();
  });

  it('refuse une demande sans consentement RGPD', () => {
    const { error } = creerDevisSchema.validate({ ...donneesValides, consentementRgpd: false });
    expect(error).toBeDefined();
  });

  it('refuse une demande sans consentement RGPD explicite (champ absent)', () => {
    const { consentementRgpd, ...sansConsentement } = donneesValides;
    const { error } = creerDevisSchema.validate(sansConsentement);
    expect(error).toBeDefined();
  });

  it('refuse un e-mail invalide', () => {
    const { error } = creerDevisSchema.validate({ ...donneesValides, email: 'pas-un-email' });
    expect(error).toBeDefined();
  });

  it('accepte le champ honeypot vide et le passe tel quel', () => {
    const { error, value } = creerDevisSchema.validate({ ...donneesValides, site_web: '' });
    expect(error).toBeUndefined();
    expect(value.site_web).toBe('');
  });

  it('accepte un champ honeypot rempli sans erreur (le tri se fait au niveau service)', () => {
    const { error, value } = creerDevisSchema.validate({ ...donneesValides, site_web: 'http://spam.example' });
    expect(error).toBeUndefined();
    expect(value.site_web).toBe('http://spam.example');
  });

  it('rejette un message trop court', () => {
    const { error } = creerDevisSchema.validate({ ...donneesValides, message: 'hi' });
    expect(error).toBeDefined();
  });
});

describe('repondreSchema', () => {
  it('exige un sujet et un message', () => {
    const { error } = repondreSchema.validate({ sujet: '', message: '' });
    expect(error).toBeDefined();
  });

  it('accepte un sujet et un message valides', () => {
    const { error } = repondreSchema.validate({ sujet: 'Votre devis', message: 'Bonjour, voici notre proposition.' });
    expect(error).toBeUndefined();
  });
});
