const authService = require('./auth.service');
const asyncHandler = require('../../utils/asyncHandler');
const env = require('../../config/env');
const dureeEnMs = require('../../utils/dureeEnMs');

function optionsCookie() {
  return {
    httpOnly: true,
    secure: env.env === 'production',
    sameSite: 'lax',
    maxAge: dureeEnMs(env.jwtExpiresIn),
    path: '/',
  };
}

const login = asyncHandler(async (req, res) => {
  const { email, motDePasse } = req.body;
  const { token, admin } = await authService.login(email, motDePasse);
  res.cookie(env.cookieName, token, optionsCookie());
  res.json({ succes: true, admin });
});

const me = asyncHandler(async (req, res) => {
  const admin = await authService.obtenirProfil(req.admin.id);
  res.json({ succes: true, admin });
});

const mettreAJourProfil = asyncHandler(async (req, res) => {
  const { token, admin } = await authService.mettreAJourProfil(req.admin.id, req.body);
  res.cookie(env.cookieName, token, optionsCookie());
  res.json({ succes: true, admin });
});

const changerMotDePasse = asyncHandler(async (req, res) => {
  await authService.changerMotDePasse(req.admin.id, req.body);
  res.json({ succes: true });
});

const logout = asyncHandler(async (req, res) => {
  res.clearCookie(env.cookieName, { path: '/' });
  res.json({ succes: true });
});

module.exports = { login, me, logout, mettreAJourProfil, changerMotDePasse };
