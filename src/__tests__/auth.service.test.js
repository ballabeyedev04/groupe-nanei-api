jest.mock('../models', () => ({ AdminUser: { findOne: jest.fn() } }));
jest.mock('bcryptjs', () => ({ compare: jest.fn() }));

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
    expect(resultat.admin).toEqual({ id: '1', email: 'admin@example.com', nom: 'Admin' });
    expect(save).toHaveBeenCalledTimes(1);
  });
});
