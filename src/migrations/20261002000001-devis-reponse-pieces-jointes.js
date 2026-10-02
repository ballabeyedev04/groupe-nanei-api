'use strict';

// Garde la trace des pièces jointes envoyées avec la réponse (nom et taille
// uniquement : les fichiers eux-mêmes ne sont pas conservés sur le serveur).
module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('devis');
    if (table.reponse_pieces_jointes) return;

    await queryInterface.addColumn('devis', 'reponse_pieces_jointes', {
      type: Sequelize.JSONB,
      allowNull: false,
      defaultValue: [],
    });
  },

  async down(queryInterface) {
    const table = await queryInterface.describeTable('devis');
    if (!table.reponse_pieces_jointes) return;

    await queryInterface.removeColumn('devis', 'reponse_pieces_jointes');
  },
};
