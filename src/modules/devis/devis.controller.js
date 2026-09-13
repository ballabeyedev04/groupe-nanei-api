const devisService = require('./devis.service');
const asyncHandler = require('../../utils/asyncHandler');

const creer = asyncHandler(async (req, res) => {
  await devisService.creer(req.body, { ip: req.ip, userAgent: req.get('user-agent') });
  // Réponse identique que la demande soit réelle ou piégée par le honeypot.
  res.status(201).json({ succes: true, message: 'Votre demande a bien été envoyée.' });
});

const lister = asyncHandler(async (req, res) => {
  const resultat = await devisService.lister(req.query);
  res.json({ succes: true, ...resultat });
});

const obtenir = asyncHandler(async (req, res) => {
  const devis = await devisService.obtenir(req.params.id);
  res.json({ succes: true, devis });
});

const repondre = asyncHandler(async (req, res) => {
  const devis = await devisService.repondre(req.params.id, req.body, req.admin.id);
  res.json({ succes: true, devis });
});

module.exports = { creer, lister, obtenir, repondre };
