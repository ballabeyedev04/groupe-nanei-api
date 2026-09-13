const express = require('express');
const controller = require('./devis.controller');
const { creerDevisSchema, listeDevisQuerySchema, repondreSchema } = require('./devis.validation');
const validate = require('../../middlewares/validate.middleware');
const requireAuth = require('../../middlewares/auth.middleware');
const { limiteurDevis } = require('../../middlewares/rateLimiter.middleware');

const router = express.Router();

// Public : formulaire "Demander un devis" du site vitrine.
router.post('/', limiteurDevis, validate(creerDevisSchema), controller.creer);

// Admin : liste, détail, réponse.
router.get('/', requireAuth, validate(listeDevisQuerySchema, 'query'), controller.lister);
router.get('/:id', requireAuth, controller.obtenir);
router.post('/:id/repondre', requireAuth, validate(repondreSchema), controller.repondre);

module.exports = router;
