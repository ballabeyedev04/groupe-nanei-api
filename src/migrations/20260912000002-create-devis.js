'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('devis').catch(() => null);
    if (table) return;

    await queryInterface.createTable('devis', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      nom: { type: Sequelize.STRING(150), allowNull: false },
      societe: { type: Sequelize.STRING(150), allowNull: true },
      telephone: { type: Sequelize.STRING(30), allowNull: false },
      email: { type: Sequelize.STRING(255), allowNull: false },
      ville: { type: Sequelize.STRING(150), allowNull: true },
      type_besoin: { type: Sequelize.STRING(150), allowNull: true },
      message: { type: Sequelize.TEXT, allowNull: false },
      consentement_rgpd: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      statut: { type: Sequelize.ENUM('nouveau', 'traite'), allowNull: false, defaultValue: 'nouveau' },
      reponse_sujet: { type: Sequelize.STRING(255), allowNull: true },
      reponse_message: { type: Sequelize.TEXT, allowNull: true },
      repondu_le: { type: Sequelize.DATE, allowNull: true },
      repondu_par_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'admin_users', key: 'id' },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      },
      ip: { type: Sequelize.STRING(64), allowNull: true },
      user_agent: { type: Sequelize.STRING(500), allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
    });

    await queryInterface.addIndex('devis', ['statut']);
    await queryInterface.addIndex('devis', ['created_at']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('devis');
  },
};
