const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Statuts volontairement réduits à deux valeurs : le client a demandé un
// suivi simple ("nombre de demandes traitées"), pas un cycle de vie complet
// façon ticket. Un statut "spam" existe à part pour ne jamais mélanger un
// message piégé par le honeypot avec une vraie demande dans les stats.
const STATUTS = ['nouveau', 'traite'];

const Devis = sequelize.define(
  'Devis',
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },

    // Champs du formulaire — voir le cahier §6 "Formulaire" : nom, société,
    // téléphone, e-mail, ville/chantier, type de besoin, message, RGPD.
    nom: { type: DataTypes.STRING(150), allowNull: false },
    societe: { type: DataTypes.STRING(150), allowNull: true },
    telephone: { type: DataTypes.STRING(30), allowNull: false },
    email: { type: DataTypes.STRING(255), allowNull: false, validate: { isEmail: true } },
    ville: { type: DataTypes.STRING(150), allowNull: true },
    typeBesoin: { type: DataTypes.STRING(150), allowNull: true },
    message: { type: DataTypes.TEXT, allowNull: false },
    consentementRgpd: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },

    statut: {
      type: DataTypes.ENUM(...STATUTS),
      allowNull: false,
      defaultValue: 'nouveau',
    },

    // Réponse envoyée depuis l'admin (bouton "Répondre" → e-mail via Resend).
    reponseSujet: { type: DataTypes.STRING(255), allowNull: true },
    reponseMessage: { type: DataTypes.TEXT, allowNull: true },
    reponduLe: { type: DataTypes.DATE, allowNull: true },
    reponduParId: { type: DataTypes.UUID, allowNull: true },

    // Traçabilité anti-spam légère (pas de CAPTCHA imposé au visiteur — voir
    // le honeypot dans la validation — mais on garde de quoi enquêter).
    ip: { type: DataTypes.STRING(64), allowNull: true },
    userAgent: { type: DataTypes.STRING(500), allowNull: true },
  },
  {
    tableName: 'devis',
    underscored: true,
    indexes: [{ fields: ['statut'] }, { fields: ['created_at'] }],
  }
);

Devis.STATUTS = STATUTS;

module.exports = Devis;
