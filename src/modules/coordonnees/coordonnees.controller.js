const coordonneesService = require('./coordonnees.service');
const asyncHandler = require('../../utils/asyncHandler');

const obtenir = asyncHandler(async (req, res) => {
  const coordonnees = await coordonneesService.obtenir();
  res.json({ succes: true, coordonnees });
});

const creer = asyncHandler(async (req, res) => {
  const coordonnees = await coordonneesService.creer(req.body);
  res.status(201).json({ succes: true, coordonnees });
});

const mettreAJour = asyncHandler(async (req, res) => {
  const coordonnees = await coordonneesService.mettreAJour(req.body);
  res.json({ succes: true, coordonnees });
});

const supprimer = asyncHandler(async (req, res) => {
  await coordonneesService.supprimer();
  res.json({ succes: true });
});

module.exports = { obtenir, creer, mettreAJour, supprimer };
