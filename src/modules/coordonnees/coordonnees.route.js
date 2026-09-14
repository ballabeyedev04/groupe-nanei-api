const express = require('express');
const controller = require('./coordonnees.controller');
const { enregistrerCoordonneesSchema } = require('./coordonnees.validation');
const validate = require('../../middlewares/validate.middleware');
const requireAuth = require('../../middlewares/auth.middleware');

// Réservé à l'admin — la lecture publique passe par le module `public`
// (voir src/modules/public/public.route.js), jamais par ces routes-ci.
const router = express.Router();

router.get('/', requireAuth, controller.obtenir);
router.put('/', requireAuth, validate(enregistrerCoordonneesSchema), controller.enregistrer);
router.delete('/', requireAuth, controller.supprimer);

module.exports = router;
