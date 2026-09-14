const Joi = require('joi');

const creerActualiteSchema = Joi.object({
  titre: Joi.string().trim().min(2).max(200).required(),
  contenu: Joi.string().trim().min(2).max(10000).required(),
  // Optionnelle : par défaut, publiée immédiatement (voir le modèle). Une
  // date future permet de préparer une actualité à l'avance.
  publieLe: Joi.date().iso().optional(),
});

// Mise à jour : mêmes règles, mais tous les champs optionnels (un admin
// peut ne vouloir corriger que le titre).
const modifierActualiteSchema = Joi.object({
  titre: Joi.string().trim().min(2).max(200),
  contenu: Joi.string().trim().min(2).max(10000),
  publieLe: Joi.date().iso(),
}).min(1);

const listeActualitesQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limite: Joi.number().integer().min(1).max(100).default(20),
});

module.exports = { creerActualiteSchema, modifierActualiteSchema, listeActualitesQuerySchema };
