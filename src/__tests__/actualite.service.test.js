const { Op } = require('sequelize');

jest.mock('../models', () => ({
  Actualite: { create: jest.fn(), findAndCountAll: jest.fn(), findByPk: jest.fn() },
}));

const { Actualite } = require('../models');
const actualiteService = require('../modules/actualites/actualite.service');

describe('actualiteService.creer', () => {
  it("utilise la date fournie quand elle est présente", async () => {
    const date = new Date('2026-01-01T00:00:00.000Z');
    Actualite.create.mockResolvedValue({ id: '1' });

    await actualiteService.creer({ titre: 'T', contenu: 'C', publieLe: date });

    expect(Actualite.create).toHaveBeenCalledWith({ titre: 'T', contenu: 'C', publieLe: date });
  });

  it('retombe sur "maintenant" quand aucune date n\'est fournie', async () => {
    Actualite.create.mockResolvedValue({ id: '1' });
    const avant = Date.now();

    await actualiteService.creer({ titre: 'T', contenu: 'C' });

    const argument = Actualite.create.mock.calls[0][0];
    expect(argument.publieLe.getTime()).toBeGreaterThanOrEqual(avant);
  });
});

describe('actualiteService.listerPublic', () => {
  it("ne renvoie que les actualités déjà publiées (publieLe <= maintenant)", async () => {
    Actualite.findAndCountAll.mockResolvedValue({ rows: [], count: 0 });

    await actualiteService.listerPublic({ page: 1, limite: 20 });

    const options = Actualite.findAndCountAll.mock.calls[0][0];
    expect(options.where.publieLe[Op.lte]).toBeInstanceOf(Date);
  });
});

describe('actualiteService.listerAdmin', () => {
  it('ne filtre pas par date (l\'admin voit aussi les actualités programmées)', async () => {
    Actualite.findAndCountAll.mockResolvedValue({ rows: [], count: 0 });

    await actualiteService.listerAdmin({ page: 1, limite: 20 });

    const options = Actualite.findAndCountAll.mock.calls[0][0];
    expect(options.where).toBeUndefined();
  });
});

describe('actualiteService.supprimer', () => {
  it("lève une erreur 404 quand l'actualité n'existe pas", async () => {
    Actualite.findByPk.mockResolvedValue(null);
    await expect(actualiteService.supprimer('id-inconnu')).rejects.toMatchObject({ statusCode: 404 });
  });
});
