// Crée le compte admin à partir des variables d'environnement — idempotent :
// relancer ce script ne duplique rien et ne réinitialise pas le mot de passe
// d'un compte déjà existant (évite une mauvaise surprise en production si le
// script tourne à nouveau par erreur).
const bcrypt = require('bcryptjs');
const { sequelize, AdminUser } = require('../models');
const env = require('../config/env');

async function run() {
  if (!env.adminEmail || !env.adminPassword) {
    console.error('ADMIN_EMAIL et ADMIN_PASSWORD doivent être définis dans .env pour créer le compte admin.');
    process.exit(1);
  }

  await sequelize.authenticate();

  const existant = await AdminUser.findOne({ where: { email: env.adminEmail.toLowerCase() } });
  if (existant) {
    console.log(`Le compte admin ${env.adminEmail} existe déjà — aucune action effectuée.`);
    process.exit(0);
  }

  const motDePasseHash = await bcrypt.hash(env.adminPassword, 12);
  await AdminUser.create({
    email: env.adminEmail.toLowerCase(),
    motDePasseHash,
    nom: env.adminNom,
  });

  console.log(`Compte admin créé : ${env.adminEmail}`);
  process.exit(0);
}

run().catch((e) => {
  console.error('Échec de la création du compte admin :', e);
  process.exit(1);
});
