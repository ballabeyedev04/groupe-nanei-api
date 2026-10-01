'use strict';

// Un visiteur peut désormais cocher plusieurs besoins dans le formulaire de
// devis : la colonne texte `type_besoin` devient un tableau `types_besoin`.
// Les demandes existantes sont reprises telles quelles (leur besoin unique
// devient un tableau d'un élément) avant la suppression de l'ancienne colonne.
module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('devis');
    if (table.types_besoin) return;

    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        'devis',
        'types_besoin',
        { type: Sequelize.ARRAY(Sequelize.STRING(150)), allowNull: false, defaultValue: [] },
        { transaction }
      );

      if (table.type_besoin) {
        await queryInterface.sequelize.query(
          `UPDATE devis SET types_besoin = ARRAY[type_besoin]
           WHERE type_besoin IS NOT NULL AND btrim(type_besoin) <> ''`,
          { transaction }
        );
        await queryInterface.removeColumn('devis', 'type_besoin', { transaction });
      }
    });
  },

  // Retour arrière : les besoins sont regroupés dans l'ancienne colonne texte
  // (séparés par une virgule, tronqués à sa longueur maximale).
  async down(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('devis');
    if (!table.types_besoin) return;

    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn('devis', 'type_besoin', { type: Sequelize.STRING(150), allowNull: true }, { transaction });
      await queryInterface.sequelize.query(
        `UPDATE devis SET type_besoin = left(array_to_string(types_besoin, ', '), 150)
         WHERE cardinality(types_besoin) > 0`,
        { transaction }
      );
      await queryInterface.removeColumn('devis', 'types_besoin', { transaction });
    });
  },
};
