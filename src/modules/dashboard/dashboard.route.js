const express = require('express');
const controller = require('./dashboard.controller');
const requireAuth = require('../../middlewares/auth.middleware');

const router = express.Router();

router.get('/stats', requireAuth, controller.stats);

module.exports = router;
