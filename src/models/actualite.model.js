const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Actualite = sequelize.define(
  'Actualite',
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    titre: { type: DataTypes.STRING(200), allowNull: false },
    contenu: { type: DataTypes.TEXT, allowNull: false },
    // Date affichée ET date de visibilité publique — voir la migration et
    // actualite.service.js.
    publieLe: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  },
  {
    tableName: 'actualites',
    underscored: true,
  }
);

module.exports = Actualite;
