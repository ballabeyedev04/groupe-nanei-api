const { Coordonnees } = require('../../models');
const AppError = require('../../utils/AppError');

// Singleton applicatif : on ne connaît qu'une seule ligne à la fois. Plutôt
// que d'imposer une contrainte SQL (un index unique sur une colonne
// constante serait un artifice fragile), on centralise la règle ici — tout
// le module passe par ces fonctions, jamais par Coordonnees.create() en
// direct.
async function obtenirLigneUnique() {
  return Coordonnees.findOne({ order: [['createdAt', 'ASC']] });
}

async function obtenir() {
  return obtenirLigneUnique();
}

async function creerOuMettreAJour(data) {
  const existant = await obtenirLigneUnique();
  const valeurs = {
    telephone: data.telephone || null,
    email: data.email || null,
    adresse: data.adresse || null,
  };

  if (existant) {
    existant.set(valeurs);
    await existant.save();
    return existant;
  }

  return Coordonnees.create(valeurs);
}

async function supprimer() {
  const existant = await obtenirLigneUnique();
  if (!existant) throw new AppError('Aucune coordonnée à supprimer.', 404);
  await existant.destroy();
}

module.exports = { obtenir, creerOuMettreAJour, supprimer };
