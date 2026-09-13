const { QueryTypes } = require('sequelize');
const { sequelize, Devis } = require('../../models');

async function stats() {
  const [total, totalTraites] = await Promise.all([
    Devis.count(),
    Devis.count({ where: { statut: 'traite' } }),
  ]);

  // Regroupement par mois calendaire, sur les 12 derniers mois — fait en
  // SQL (plus simple et plus sûr qu'un group-by en mémoire pour une série
  // temporelle avec des mois potentiellement sans aucune demande).
  const lignes = await sequelize.query(
    `
    SELECT to_char(date_trunc('month', created_at), 'YYYY-MM') AS mois, COUNT(*)::int AS total
    FROM devis
    WHERE created_at >= date_trunc('month', NOW()) - INTERVAL '11 months'
    GROUP BY 1
    ORDER BY 1 ASC
    `,
    { type: QueryTypes.SELECT }
  );

  // On complète les mois sans aucune demande avec 0, pour un graphe continu.
  const parMois = [];
  const curseur = new Date();
  curseur.setDate(1);
  curseur.setMonth(curseur.getMonth() - 11);
  for (let i = 0; i < 12; i += 1) {
    const cle = `${curseur.getFullYear()}-${String(curseur.getMonth() + 1).padStart(2, '0')}`;
    const trouve = lignes.find((l) => l.mois === cle);
    parMois.push({ mois: cle, total: trouve ? trouve.total : 0 });
    curseur.setMonth(curseur.getMonth() + 1);
  }

  return {
    total,
    totalTraites,
    totalEnAttente: total - totalTraites,
    parMois,
  };
}

module.exports = { stats };
