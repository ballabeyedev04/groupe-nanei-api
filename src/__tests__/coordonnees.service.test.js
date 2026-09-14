jest.mock('../models', () => ({
  Coordonnees: { findOne: jest.fn(), create: jest.fn() },
}));

const { Coordonnees } = require('../models');
const coordonneesService = require('../modules/coordonnees/coordonnees.service');

describe('coordonneesService.creerOuMettreAJour', () => {
  it("crée la ligne quand aucune n'existe encore", async () => {
    Coordonnees.findOne.mockResolvedValue(null);
    Coordonnees.create.mockResolvedValue({ id: '1', telephone: '0600000000' });

    const resultat = await coordonneesService.creerOuMettreAJour({ telephone: '0600000000' });

    expect(Coordonnees.create).toHaveBeenCalledWith({ telephone: '0600000000', email: null, adresse: null });
    expect(resultat.telephone).toBe('0600000000');
  });

  it("met à jour la ligne existante plutôt que d'en créer une deuxième", async () => {
    const ligneExistante = { id: '1', telephone: '0600000000', set: jest.fn(), save: jest.fn().mockResolvedValue(undefined) };
    Coordonnees.findOne.mockResolvedValue(ligneExistante);

    await coordonneesService.creerOuMettreAJour({ telephone: '0611111111', email: 'contact@groupe-nanei.fr' });

    expect(Coordonnees.create).not.toHaveBeenCalled();
    expect(ligneExistante.set).toHaveBeenCalledWith({ telephone: '0611111111', email: 'contact@groupe-nanei.fr', adresse: null });
    expect(ligneExistante.save).toHaveBeenCalledTimes(1);
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
