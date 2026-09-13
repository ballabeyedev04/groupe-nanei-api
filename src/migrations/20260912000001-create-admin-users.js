'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('admin_users').catch(() => null);
    if (table) return; // idempotent : déjà créée (redéploiement, etc.)

    await queryInterface.createTable('admin_users', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      email: { type: Sequelize.STRING(255), allowNull: false, unique: true },
      mot_de_passe_hash: { type: Sequelize.STRING(255), allowNull: false },
      nom: { type: Sequelize.STRING(120), allowNull: false, defaultValue: 'Administrateur' },
      derniere_connexion_le: { type: Sequelize.DATE, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('admin_users');
  },
};
