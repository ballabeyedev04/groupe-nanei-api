'use strict';

// Table volontairement pensée comme un singleton applicatif (une seule
// ligne "active" à la fois) : le service ne l'impose pas au niveau SQL
// (pas de contrainte à une ligne unique, ce serait fragile), mais
// coordonnees.service.js ne crée jamais de deuxième ligne — un nouvel
// enregistrement mais à jour celui qui existe déjà. Voir ce service pour
// le détail.
module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('coordonnees').catch(() => null);
    if (table) return;

    await queryInterface.createTable('coordonnees', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      telephone: { type: Sequelize.STRING(30), allowNull: true },
      email: { type: Sequelize.STRING(255), allowNull: true },
      adresse: { type: Sequelize.STRING(500), allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('coordonnees');
  },
};
