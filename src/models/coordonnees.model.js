const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Singleton applicatif : une seule ligne représente les coordonnées
// affichées sur le site (téléphone, e-mail, adresse). Voir
// coordonnees.service.js pour la logique qui garantit qu'il n'y en a
// jamais deux à la fois.
const Coordonnees = sequelize.define(
  'Coordonnees',
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    telephone: { type: DataTypes.STRING(30), allowNull: true },
    email: { type: DataTypes.STRING(255), allowNull: true, validate: { isEmail: true } },
    adresse: { type: DataTypes.STRING(500), allowNull: true },
  },
  {
    tableName: 'coordonnees',
    underscored: true,
  }
);

module.exports = Coordonnees;
