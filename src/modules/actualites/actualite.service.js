const { Op } = require('sequelize');
const { Actualite } = require('../../models');
const AppError = require('../../utils/AppError');

async function creer(data) {
  return Actualite.create({
    titre: data.titre,
    contenu: data.contenu,
    publieLe: data.publieLe || new Date(),
  });
}

// Vue admin : toutes les actualités, y compris celles programmées dans le
// futur — l'admin doit pouvoir les retrouver pour les corriger avant leur
// publication effective.
async function listerAdmin({ page, limite }) {
  const { rows, count } = await Actualite.findAndCountAll({
    order: [['publieLe', 'DESC']],
    limit: limite,
    offset: (page - 1) * limite,
  });
  return { items: rows, total: count, page, limite, totalPages: Math.ceil(count / limite) || 1 };
}

// Vue publique (site vitrine) : seulement les actualités déjà "passées" —
// voir le commentaire sur le modèle. Pas de statut brouillon/publié séparé,
// la date suffit et évite un champ de plus à gérer côté admin.
async function listerPublic({ page, limite }) {
  const where = { publieLe: { [Op.lte]: new Date() } };
  const { rows, count } = await Actualite.findAndCountAll({
    where,
    order: [['publieLe', 'DESC']],
    limit: limite,
    offset: (page - 1) * limite,
  });
  return { items: rows, total: count, page, limite, totalPages: Math.ceil(count / limite) || 1 };
}

async function obtenir(id) {
  const actualite = await Actualite.findByPk(id);
  if (!actualite) throw new AppError('Actualité introuvable.', 404);
  return actualite;
}

async function modifier(id, data) {
  const actualite = await obtenir(id);
  actualite.set(data);
  await actualite.save();
  return actualite;
}

async function supprimer(id) {
  const actualite = await obtenir(id);
  await actualite.destroy();
}

module.exports = { creer, listerAdmin, listerPublic, obtenir, modifier, supprimer };
