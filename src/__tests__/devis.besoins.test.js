// Besoins multiples d'une demande de devis : validation, normalisation par
// le service et rendu dans les e-mails.
process.env.ADMIN_NOTIFICATION_EMAIL = 'contact@groupe-nanei.fr';

jest.mock('../models', () => ({
  Devis: { create: jest.fn(), findByPk: jest.fn(), findAndCountAll: jest.fn() },
  AdminUser: {},
}));
jest.mock('../infrastructure/emailService', () => ({ envoyer: jest.fn() }));

const { Devis } = require('../models');
const emailService = require('../infrastructure/emailService');
const devisService = require('../modules/devis/devis.service');
const { creerDevisSchema } = require('../modules/devis/devis.validation');
const { devisNotificationInterneHtml } = require('../templates/mail/devisNotificationInterne.template');

const base = {
  nom: 'Jean Dupont',
  telephone: '0601020304',
  email: 'jean@example.com',
  message: 'Un message suffisamment long pour passer la validation.',
  consentementRgpd: true,
};

describe('creerDevisSchema — typesBesoin', () => {
  it('accepte plusieurs besoins', () => {
    const { error, value } = creerDevisSchema.validate({ ...base, typesBesoin: ['Gestion des bennes', 'Autre besoin'] });
    expect(error).toBeUndefined();
    expect(value.typesBesoin).toEqual(['Gestion des bennes', 'Autre besoin']);
  });

  it('vaut une liste vide quand aucun besoin n’est choisi', () => {
    const { error, value } = creerDevisSchema.validate(base);
    expect(error).toBeUndefined();
    expect(value.typesBesoin).toEqual([]);
  });

  it('refuse un besoin vide ou trop long', () => {
    expect(creerDevisSchema.validate({ ...base, typesBesoin: [''] }).error).toBeDefined();
    expect(creerDevisSchema.validate({ ...base, typesBesoin: ['x'.repeat(151)] }).error).toBeDefined();
  });

  it('refuse une liste démesurée', () => {
    const typesBesoin = Array.from({ length: 16 }, (_, i) => `Besoin ${i}`);
    expect(creerDevisSchema.validate({ ...base, typesBesoin }).error).toBeDefined();
  });

  it('accepte encore l’ancien champ unique typeBesoin', () => {
    const { error } = creerDevisSchema.validate({ ...base, typeBesoin: 'Gestion des bennes' });
    expect(error).toBeUndefined();
  });
});

describe('devisService.creer — typesBesoin', () => {
  beforeEach(() => {
    Devis.create.mockImplementation(async (donnees) => ({ id: 'd1', ...donnees }));
    emailService.envoyer.mockResolvedValue({ id: 'email-1' });
  });

  it('enregistre les besoins sans doublon ni espace superflu, dans l’ordre choisi', async () => {
    await devisService.creer(
      { ...base, site_web: '', typesBesoin: [' Gestion des bennes ', 'Contrôle des accès', 'Gestion des bennes'] },
      {}
    );

    expect(Devis.create).toHaveBeenCalledWith(
      expect.objectContaining({ typesBesoin: ['Gestion des bennes', 'Contrôle des accès'] })
    );
  });

  it('reprend l’ancien champ unique dans la liste', async () => {
    await devisService.creer({ ...base, site_web: '', typeBesoin: 'Autre besoin' }, {});

    expect(Devis.create).toHaveBeenCalledWith(expect.objectContaining({ typesBesoin: ['Autre besoin'] }));
  });

  it('enregistre une liste vide quand aucun besoin n’est choisi', async () => {
    await devisService.creer({ ...base, site_web: '' }, {});

    expect(Devis.create).toHaveBeenCalledWith(expect.objectContaining({ typesBesoin: [] }));
  });
});

describe('devisNotificationInterneHtml — besoins', () => {
  it('liste chaque besoin et échappe le HTML saisi par le visiteur', () => {
    const html = devisNotificationInterneHtml({ ...base, typesBesoin: ['Gestion des bennes', '<b>pirate</b>'] });

    expect(html).toContain('• Gestion des bennes');
    expect(html).toContain('&lt;b&gt;pirate&lt;/b&gt;');
    expect(html).not.toContain('<b>pirate</b>');
  });

  it('masque la ligne quand aucun besoin n’est choisi', () => {
    const html = devisNotificationInterneHtml({ ...base, typesBesoin: [] });

    expect(html).not.toContain('Besoins');
  });
});
