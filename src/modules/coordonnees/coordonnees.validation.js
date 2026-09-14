const Joi = require('joi');

// Les 3 champs sont optionnels chacun (un admin peut vouloir renseigner
// seulement le téléphone dans un premier temps), mais au moins un doit être
// fourni — un enregistrement entièrement vide n'aurait aucun sens.
const enregistrerCoordonneesSchema = Joi.object({
  telephone: Joi.string().trim().max(30).allow('', null),
  email: Joi.string().trim().email().max(255).allow('', null),
  adresse: Joi.string().trim().max(500).allow('', null),
}).or('telephone', 'email', 'adresse');

module.exports = { enregistrerCoordonneesSchema };
