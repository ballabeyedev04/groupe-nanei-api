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

  return { token: signerToken(admin), admin: versProfil(admin) };
}

function signerToken(admin) {
  return jwt.sign({ sub: admin.id, email: admin.email }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
}

// Seules données du compte exposées au front — jamais le hash du mot de passe.
function versProfil(admin) {
  return { id: admin.id, email: admin.email, nom: admin.nom, derniereConnexionLe: admin.derniereConnexionLe };
}

async function trouverAdmin(id) {
  const admin = await AdminUser.findByPk(id);
  // Compte supprimé alors que le cookie était encore valide.
  if (!admin) throw new AppError('Session invalide ou expirée, merci de vous reconnecter.', 401);
  return admin;
}

async function obtenirProfil(id) {
  return versProfil(await trouverAdmin(id));
}

// Renvoie aussi un nouveau token : l'e-mail figure dans le JWT, il doit
// refléter la nouvelle adresse sans attendre la prochaine connexion.
async function mettreAJourProfil(id, { nom, email }) {
  const admin = await trouverAdmin(id);
  const emailNormalise = email.toLowerCase();

  if (emailNormalise !== admin.email) {
    const pris = await AdminUser.findOne({ where: { email: emailNormalise } });
    if (pris) throw new AppError('Cette adresse e-mail est déjà utilisée par un autre compte.', 409);
  }

  admin.set({ nom, email: emailNormalise });
  await admin.save();
  return { token: signerToken(admin), admin: versProfil(admin) };
}

async function changerMotDePasse(id, { motDePasseActuel, nouveauMotDePasse }) {
  const admin = await trouverAdmin(id);
  const valide = await bcrypt.compare(motDePasseActuel, admin.motDePasseHash);
  if (!valide) throw new AppError('Le mot de passe actuel est incorrect.', 400);

  admin.motDePasseHash = await bcrypt.hash(nouveauMotDePasse, 12);
  await admin.save();
}

module.exports = { login, obtenirProfil, mettreAJourProfil, changerMotDePasse };
