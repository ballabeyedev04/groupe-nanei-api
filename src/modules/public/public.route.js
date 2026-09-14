const express = require('express');
const coordonneesService = require('../coordonnees/coordonnees.service');
const actualiteService = require('../actualites/actualite.service');
const { listeActualitesQuerySchema } = require('../actualites/actualite.validation');
const validate = require('../../middlewares/validate.middleware');
const asyncHandler = require('../../utils/asyncHandler');

// Endpoints exposés au site vitrine, SANS authentification — regroupés ici
// plutôt qu'éclatés dans chaque module, pour qu'un seul fichier réponde à
// la question « qu'est-ce qui est public sur cette API ? ».
const router = express.Router();

router.get(
  '/coordonnees',
  asyncHandler(async (req, res) => {
    const coordonnees = await coordonneesService.obtenir();
    // Pas de coordonnées enregistrées → objet vide plutôt qu'une erreur :
    // le site vitrine sait déjà afficher un état "à renseigner" (voir
    // ContactSection.jsx), il n'a pas besoin de distinguer "pas encore
    // configuré" d'une panne serveur.
    res.json({
      succes: true,
      coordonnees: coordonnees
        ? { telephone: coordonnees.telephone, email: coordonnees.email, adresse: coordonnees.adresse }
        : { telephone: null, email: null, adresse: null },
    });
  })
);

router.get(
  '/actualites',
  validate(listeActualitesQuerySchema, 'query'),
  asyncHandler(async (req, res) => {
    const resultat = await actualiteService.listerPublic(req.query);
    res.json({ succes: true, ...resultat });
  })
);

module.exports = router;
