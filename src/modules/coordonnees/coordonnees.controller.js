const coordonneesService = require('./coordonnees.service');
const asyncHandler = require('../../utils/asyncHandler');

const obtenir = asyncHandler(async (req, res) => {
  const coordonnees = await coordonneesService.obtenir();
  res.json({ succes: true, coordonnees });
});

const enregistrer = asyncHandler(async (req, res) => {
  const coordonnees = await coordonneesService.creerOuMettreAJour(req.body);
  res.json({ succes: true, coordonnees });
});

const supprimer = asyncHandler(async (req, res) => {
  await coordonneesService.supprimer();
  res.json({ succes: true });
});

module.exports = { obtenir, enregistrer, supprimer };
