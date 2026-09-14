const express = require('express');
const controller = require('./actualite.controller');
const { creerActualiteSchema, modifierActualiteSchema, listeActualitesQuerySchema } = require('./actualite.validation');
const validate = require('../../middlewares/validate.middleware');
const requireAuth = require('../../middlewares/auth.middleware');

// Réservé à l'admin — la lecture publique passe par le module `public`.
const router = express.Router();

router.post('/', requireAuth, validate(creerActualiteSchema), controller.creer);
router.get('/', requireAuth, validate(listeActualitesQuerySchema, 'query'), controller.lister);
router.get('/:id', requireAuth, controller.obtenir);
router.put('/:id', requireAuth, validate(modifierActualiteSchema), controller.modifier);
router.delete('/:id', requireAuth, controller.supprimer);

module.exports = router;
