// Doit être fixé avant le require de devis.service (donc avant le require de
// config/env, qui lit process.env une seule fois au chargement du module) —
// sinon la notification interne est silencieusement désactivée en test.
process.env.ADMIN_NOTIFICATION_EMAIL = 'contact@groupe-nanei.fr';

jest.mock('../models', () => ({
  Devis: { create: jest.fn(), findByPk: jest.fn(), findAndCountAll: jest.fn() },
  AdminUser: {},
}));
jest.mock('../infrastructure/emailService', () => ({ envoyer: jest.fn() }));

const { Devis } = require('../models');
const emailService = require('../infrastructure/emailService');
const devisService = require('../modules/devis/devis.service');

const donnees = {
  nom: 'Jean Dupont',
  telephone: '0601020304',
  email: 'jean@example.com',
  message: 'Un message suffisamment long pour passer la validation.',
  consentementRgpd: true,
  site_web: '',
};

describe('devisService.creer', () => {
  it('crée la demande et envoie les deux e-mails (confirmation + notification interne)', async () => {
    Devis.create.mockResolvedValue({ id: 'abc-123', nom: donnees.nom, email: donnees.email });
    emailService.envoyer.mockResolvedValue({ id: 'email-1' });

    const resultat = await devisService.creer(donnees, { ip: '1.2.3.4', userAgent: 'test' });

    expect(resultat).toEqual({ id: 'abc-123', ignoree: false });
    expect(Devis.create).toHaveBeenCalledTimes(1);
    expect(emailService.envoyer).toHaveBeenCalledTimes(2);
  });

  it('ignore silencieusement une soumission piégée par le honeypot (aucune création, aucun e-mail)', async () => {
    const resultat = await devisService.creer({ ...donnees, site_web: 'http://spam.example' }, {});

    expect(resultat).toEqual({ id: null, ignoree: true });
    expect(Devis.create).not.toHaveBeenCalled();
    expect(emailService.envoyer).not.toHaveBeenCalled();
  });
});

describe('devisService.repondre', () => {
  function fabriquerDevisMock() {
    return { id: 'd1', nom: 'Jean', email: 'jean@example.com', save: jest.fn(), statut: 'nouveau' };
  }

  it("marque la demande traitée seulement si l'e-mail part réellement", async () => {
    const devisMock = fabriquerDevisMock();
    Devis.findByPk.mockResolvedValue(devisMock);
    emailService.envoyer.mockResolvedValue({ id: 'email-2' });

    const resultat = await devisService.repondre('d1', { sujet: 'Votre devis', message: 'Bonjour' }, 'admin-1');

    expect(resultat.statut).toBe('traite');
    expect(resultat.reponduParId).toBe('admin-1');
    expect(devisMock.save).toHaveBeenCalledTimes(1);
  });

  it("refuse de répondre une seconde fois à une demande déjà traitée, sans envoyer d'e-mail", async () => {
    const devisMock = { ...fabriquerDevisMock(), statut: 'traite' };
    Devis.findByPk.mockResolvedValue(devisMock);

    await expect(
      devisService.repondre('d1', { sujet: 'Relance', message: 'Bonjour' }, 'admin-1')
    ).rejects.toMatchObject({ statusCode: 409 });

    expect(emailService.envoyer).not.toHaveBeenCalled();
    expect(devisMock.save).not.toHaveBeenCalled();
  });

  it("ne modifie jamais le statut si l'envoi de l'e-mail échoue", async () => {
    const devisMock = fabriquerDevisMock();
    Devis.findByPk.mockResolvedValue(devisMock);
    emailService.envoyer.mockResolvedValue(null);

    await expect(
      devisService.repondre('d1', { sujet: 'Votre devis', message: 'Bonjour' }, 'admin-1')
    ).rejects.toThrow(/échoué/);

    expect(devisMock.statut).toBe('nouveau');
    expect(devisMock.save).not.toHaveBeenCalled();
  });
});
