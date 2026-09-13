const Joi = require('joi');

// Champ piège invisible pour un visiteur humain (masqué en CSS côté site) :
// un bot qui remplit tous les champs du formulaire le remplira aussi. On ne
// renvoie jamais d'erreur dessus (ça révélerait le piège) — voir le service.
const creerDevisSchema = Joi.object({
  nom: Joi.string().trim().min(2).max(150).required(),
  societe: Joi.string().trim().max(150).allow('', null),
  telephone: Joi.string().trim().min(6).max(30).required(),
  email: Joi.string().trim().email().max(255).required(),
  ville: Joi.string().trim().max(150).allow('', null),
  typeBesoin: Joi.string().trim().max(150).allow('', null),
  message: Joi.string().trim().min(5).max(4000).required(),
  consentementRgpd: Joi.boolean().valid(true).required().messages({
    'any.only': 'Le consentement RGPD est requis pour envoyer une demande.',
  }),
  // Honeypot : n'importe quel client normal laisse ce champ vide.
  site_web: Joi.string().allow('').default(''),
});

const listeDevisQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limite: Joi.number().integer().min(1).max(100).default(20),
  statut: Joi.string().valid('nouveau', 'traite').allow(''),
  recherche: Joi.string().trim().max(150).allow(''),
});

const repondreSchema = Joi.object({
  sujet: Joi.string().trim().min(2).max(255).required(),
  message: Joi.string().trim().min(2).max(5000).required(),
});

module.exports = { creerDevisSchema, listeDevisQuerySchema, repondreSchema };
