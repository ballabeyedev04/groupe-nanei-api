const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Un seul rôle existe pour ce projet (l'admin qui traite les devis) : pas de
// table de rôles séparée, ce serait de la sur-ingénierie pour un compte unique.
const AdminUser = sequelize.define(
  'AdminUser',
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    motDePasseHash: { type: DataTypes.STRING(255), allowNull: false },
    nom: { type: DataTypes.STRING(120), allowNull: false, defaultValue: 'Administrateur' },
    derniereConnexionLe: { type: DataTypes.DATE, allowNull: true },
  },
  {
    tableName: 'admin_users',
    underscored: true,
  }
);

module.exports = AdminUser;
