const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { AdminUser } = require('../../models');
const env = require('../../config/env');
const AppError = require('../../utils/AppError');

async function login(email, motDePasse) {
  const admin = await AdminUser.findOne({ where: { email: email.toLowerCase() } });
  // Message volontairement identique que l'email existe ou non : ne pas
  // révéler à un attaquant si une adresse est enregistrée.
  if (!admin) throw new AppError('Identifiants incorrects.', 401);

  const valide = await bcrypt.compare(motDePasse, admin.motDePasseHash);
  if (!valide) throw new AppError('Identifiants incorrects.', 401);

  admin.derniereConnexionLe = new Date();
  await admin.save();

  const token = jwt.sign({ sub: admin.id, email: admin.email }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  });

  return { token, admin: { id: admin.id, email: admin.email, nom: admin.nom } };
}

module.exports = { login };
