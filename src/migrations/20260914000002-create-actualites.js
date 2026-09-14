'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('actualites').catch(() => null);
    if (table) return;

    await queryInterface.createTable('actualites', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      titre: { type: Sequelize.STRING(200), allowNull: false },
      contenu: { type: Sequelize.TEXT, allowNull: false },
      // Sert à la fois de date affichée et de date de visibilité publique :
      // une actualité dont publie_le est dans le futur n'apparaît pas
      // encore sur l'API publique (voir actualite.service.js), ce qui
      // permet à l'admin de préparer une actualité à l'avance sans avoir
      // besoin d'un statut brouillon/publié séparé.
      publie_le: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
    });

    await queryInterface.addIndex('actualites', ['publie_le']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('actualites');
  },
};
