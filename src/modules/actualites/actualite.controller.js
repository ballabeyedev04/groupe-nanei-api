const actualiteService = require('./actualite.service');
const asyncHandler = require('../../utils/asyncHandler');

const creer = asyncHandler(async (req, res) => {
  const actualite = await actualiteService.creer(req.body);
  res.status(201).json({ succes: true, actualite });
});

const lister = asyncHandler(async (req, res) => {
  const resultat = await actualiteService.listerAdmin(req.query);
  res.json({ succes: true, ...resultat });
});

const obtenir = asyncHandler(async (req, res) => {
  const actualite = await actualiteService.obtenir(req.params.id);
  res.json({ succes: true, actualite });
});

const modifier = asyncHandler(async (req, res) => {
  const actualite = await actualiteService.modifier(req.params.id, req.body);
  res.json({ succes: true, actualite });
});

const supprimer = asyncHandler(async (req, res) => {
  await actualiteService.supprimer(req.params.id);
  res.json({ succes: true });
});

module.exports = { creer, lister, obtenir, modifier, supprimer };
