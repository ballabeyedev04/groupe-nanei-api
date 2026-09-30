const Joi = require('joi');

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  motDePasse: Joi.string().min(1).required(),
});

const profilSchema = Joi.object({
  nom: Joi.string().trim().min(2).max(120).required(),
  email: Joi.string().trim().email().max(255).required(),
});

const motDePasseSchema = Joi.object({
  motDePasseActuel: Joi.string().min(1).required(),
  nouveauMotDePasse: Joi.string().min(8).max(128).required().invalid(Joi.ref('motDePasseActuel')).messages({
    'any.invalid': "Le nouveau mot de passe doit être différent de l'actuel.",
    'string.min': 'Le nouveau mot de passe doit contenir au moins 8 caractères.',
  }),
});

module.exports = { loginSchema, profilSchema, motDePasseSchema };
