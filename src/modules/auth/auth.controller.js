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
  res.json({ succes: true, admin: req.admin });
});

const logout = asyncHandler(async (req, res) => {
  res.clearCookie(env.cookieName, { path: '/' });
  res.json({ succes: true });
});

module.exports = { login, me, logout };
