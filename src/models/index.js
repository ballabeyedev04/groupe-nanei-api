const sequelize = require('../config/database');
const AdminUser = require('./adminUser.model');
const Devis = require('./devis.model');

// Association simple pour savoir qui a répondu — pas de include profond
// nécessaire ailleurs, donc pas d'alias élaboré.
Devis.belongsTo(AdminUser, { foreignKey: 'reponduParId', as: 'reponduPar' });

module.exports = { sequelize, AdminUser, Devis };
