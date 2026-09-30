jest.mock('../models', () => ({ AdminUser: { findOne: jest.fn(), findByPk: jest.fn() } }));
jest.mock('bcryptjs', () => ({ compare: jest.fn(), hash: jest.fn() }));

process.env.JWT_SECRET = 'un-secret-de-test-suffisamment-long';

const bcrypt = require('bcryptjs');
const { AdminUser } = require('../models');
const authService = require('../modules/auth/auth.service');

describe('authService.login', () => {
  it("refuse un e-mail qui n'existe pas, avec un message générique", async () => {
    AdminUser.findOne.mockResolvedValue(null);

    await expect(authService.login('inconnu@example.com', 'peu-importe')).rejects.toMatchObject({
      statusCode: 401,
      message: 'Identifiants incorrects.',
    });
  });

  it('refuse un mauvais mot de passe avec le même message générique', async () => {
    AdminUser.findOne.mockResolvedValue({ id: '1', email: 'admin@example.com', motDePasseHash: 'hash', save: jest.fn() });
    bcrypt.compare.mockResolvedValue(false);

    await expect(authService.login('admin@example.com', 'mauvais')).rejects.toMatchObject({
      statusCode: 401,
      message: 'Identifiants incorrects.',
    });
  });

  it('renvoie un token et met à jour la dernière connexion sur un login valide', async () => {
    const save = jest.fn().mockResolvedValue(undefined);
    AdminUser.findOne.mockResolvedValue({
      id: '1',
      email: 'admin@example.com',
      nom: 'Admin',
      motDePasseHash: 'hash',
      save,
    });
    bcrypt.compare.mockResolvedValue(true);

    const resultat = await authService.login('admin@example.com', 'bon-mot-de-passe');

    expect(typeof resultat.token).toBe('string');
    expect(resultat.admin).toMatchObject({ id: '1', email: 'admin@example.com', nom: 'Admin' });
    expect(resultat.admin.derniereConnexionLe).toBeInstanceOf(Date);
    expect(resultat.admin).not.toHaveProperty('motDePasseHash');
    expect(save).toHaveBeenCalledTimes(1);
  });
});

describe('authService.mettreAJourProfil', () => {
  it("met à jour le nom et l'e-mail (normalisé) et renvoie un nouveau token", async () => {
    const admin = { id: '1', email: 'admin@example.com', nom: 'Admin', set: jest.fn(function (v) { Object.assign(this, v); }), save: jest.fn() };
    AdminUser.findByPk.mockResolvedValue(admin);
    AdminUser.findOne.mockResolvedValue(null);

    const resultat = await authService.mettreAJourProfil('1', { nom: 'Awa', email: 'Nouveau@Example.com' });

    expect(admin.set).toHaveBeenCalledWith({ nom: 'Awa', email: 'nouveau@example.com' });
    expect(resultat.admin.email).toBe('nouveau@example.com');
    expect(typeof resultat.token).toBe('string');
  });

  it('refuse (409) une adresse déjà prise par un autre compte', async () => {
    AdminUser.findByPk.mockResolvedValue({ id: '1', email: 'admin@example.com', set: jest.fn(), save: jest.fn() });
    AdminUser.findOne.mockResolvedValue({ id: '2' });

    await expect(authService.mettreAJourProfil('1', { nom: 'Awa', email: 'pris@example.com' })).rejects.toMatchObject({ statusCode: 409 });
  });
});

describe('authService.changerMotDePasse', () => {
  it('refuse si le mot de passe actuel est faux', async () => {
    AdminUser.findByPk.mockResolvedValue({ id: '1', motDePasseHash: 'hash', save: jest.fn() });
    bcrypt.compare.mockResolvedValue(false);

    await expect(
      authService.changerMotDePasse('1', { motDePasseActuel: 'faux', nouveauMotDePasse: 'nouveau-mdp' })
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it('enregistre le nouveau hash si le mot de passe actuel est bon', async () => {
    const admin = { id: '1', motDePasseHash: 'ancien', save: jest.fn() };
    AdminUser.findByPk.mockResolvedValue(admin);
    bcrypt.compare.mockResolvedValue(true);
    bcrypt.hash.mockResolvedValue('nouveau-hash');

    await authService.changerMotDePasse('1', { motDePasseActuel: 'bon', nouveauMotDePasse: 'nouveau-mdp' });

    expect(admin.motDePasseHash).toBe('nouveau-hash');
    expect(admin.save).toHaveBeenCalledTimes(1);
  });

  it("renvoie 401 si le compte n'existe plus", async () => {
    AdminUser.findByPk.mockResolvedValue(null);
    await expect(authService.obtenirProfil('x')).rejects.toMatchObject({ statusCode: 401 });
  });
});
