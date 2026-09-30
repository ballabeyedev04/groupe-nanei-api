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

function normaliser(data) {
  return {
    telephone: data.telephone || null,
    email: data.email || null,
    adresse: data.adresse || null,
  };
}

// "Ajouter" dans l'admin : refusé s'il existe déjà une ligne — c'est ce qui
// garantit qu'il n'y en a jamais deux (l'admin masque d'ailleurs le bouton).
async function creer(data) {
  const existant = await obtenirLigneUnique();
  if (existant) throw new AppError('Les informations de contact existent déjà : modifiez-les plutôt.', 409);
  return Coordonnees.create(normaliser(data));
}

async function mettreAJour(data) {
  const existant = await obtenirLigneUnique();
  if (!existant) throw new AppError('Aucune information de contact à modifier.', 404);
  existant.set(normaliser(data));
  await existant.save();
  return existant;
}

async function supprimer() {
  const existant = await obtenirLigneUnique();
  if (!existant) throw new AppError('Aucune coordonnée à supprimer.', 404);
  await existant.destroy();
}

module.exports = { obtenir, creer, mettreAJour, supprimer };
