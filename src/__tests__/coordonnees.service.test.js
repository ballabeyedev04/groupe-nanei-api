jest.mock('../models', () => ({
  Coordonnees: { findOne: jest.fn(), create: jest.fn() },
}));

const { Coordonnees } = require('../models');
const coordonneesService = require('../modules/coordonnees/coordonnees.service');

describe('coordonneesService.creer', () => {
  it("crée la ligne quand aucune n'existe encore", async () => {
    Coordonnees.findOne.mockResolvedValue(null);
    Coordonnees.create.mockResolvedValue({ id: '1', telephone: '0600000000' });

    const resultat = await coordonneesService.creer({ telephone: '0600000000' });

    expect(Coordonnees.create).toHaveBeenCalledWith({ telephone: '0600000000', email: null, adresse: null });
    expect(resultat.telephone).toBe('0600000000');
  });

  it('refuse (409) une deuxième ligne quand une existe déjà', async () => {
    Coordonnees.findOne.mockResolvedValue({ id: '1' });
    Coordonnees.create.mockClear();

    await expect(coordonneesService.creer({ telephone: '0611111111' })).rejects.toMatchObject({ statusCode: 409 });
    expect(Coordonnees.create).not.toHaveBeenCalled();
  });
});

describe('coordonneesService.mettreAJour', () => {
  it('met à jour la ligne existante', async () => {
    const ligneExistante = { id: '1', set: jest.fn(), save: jest.fn().mockResolvedValue(undefined) };
    Coordonnees.findOne.mockResolvedValue(ligneExistante);

    await coordonneesService.mettreAJour({ telephone: '0611111111', email: 'contact@groupe-nanei.fr' });

    expect(ligneExistante.set).toHaveBeenCalledWith({ telephone: '0611111111', email: 'contact@groupe-nanei.fr', adresse: null });
    expect(ligneExistante.save).toHaveBeenCalledTimes(1);
  });

  it("lève une erreur 404 si rien n'existe à modifier", async () => {
    Coordonnees.findOne.mockResolvedValue(null);
    await expect(coordonneesService.mettreAJour({ telephone: '06' })).rejects.toMatchObject({ statusCode: 404 });
  });
});

describe('coordonneesService.obtenir', () => {
  it("renvoie null quand aucune coordonnée n'est enregistrée", async () => {
    Coordonnees.findOne.mockResolvedValue(null);
    await expect(coordonneesService.obtenir()).resolves.toBeNull();
  });
});

describe('coordonneesService.supprimer', () => {
  it('supprime la ligne existante', async () => {
    const ligneExistante = { destroy: jest.fn().mockResolvedValue(undefined) };
    Coordonnees.findOne.mockResolvedValue(ligneExistante);

    await coordonneesService.supprimer();

    expect(ligneExistante.destroy).toHaveBeenCalledTimes(1);
  });

  it("lève une erreur 404 si rien n'existe à supprimer", async () => {
    Coordonnees.findOne.mockResolvedValue(null);
    await expect(coordonneesService.supprimer()).rejects.toMatchObject({ statusCode: 404 });
  });
});
