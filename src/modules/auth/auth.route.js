const express = require('express');
const controller = require('./auth.controller');
const { loginSchema, profilSchema, motDePasseSchema } = require('./auth.validation');
const validate = require('../../middlewares/validate.middleware');
const requireAuth = require('../../middlewares/auth.middleware');
const { limiteurLogin } = require('../../middlewares/rateLimiter.middleware');

const router = express.Router();

router.post('/login', limiteurLogin, validate(loginSchema), controller.login);
router.get('/me', requireAuth, controller.me);
router.post('/logout', requireAuth, controller.logout);
router.put('/profil', requireAuth, validate(profilSchema), controller.mettreAJourProfil);
router.put('/mot-de-passe', requireAuth, validate(motDePasseSchema), controller.changerMotDePasse);

module.exports = router;
