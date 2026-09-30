const { QueryTypes } = require('sequelize');
const { sequelize, Devis } = require('../../models');

// Séries proposées sur le tableau de bord : 12 derniers mois, 12 dernières
// semaines (lundi → dimanche, comme date_trunc('week') de Postgres) et 30
// derniers jours. `unite` est injectée dans le SQL : elle ne vient JAMAIS
// de la requête HTTP, uniquement de cette table figée.
const SERIES = {
  mois: { unite: 'month', nombre: 12, format: 'YYYY-MM' },
  semaine: { unite: 'week', nombre: 12, format: 'YYYY-MM-DD' },
  jour: { unite: 'day', nombre: 30, format: 'YYYY-MM-DD' },
};

const deuxChiffres = (n) => String(n).padStart(2, '0');

// Début de la période (mois, semaine ou jour) contenant `date`, en heure locale.
function debutPeriode(date, unite) {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  if (unite === 'month') d.setDate(1);
  if (unite === 'week') d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); // recule jusqu'au lundi
  return d;
}

function decaler(date, unite, pas) {
  const d = new Date(date);
  if (unite === 'month') d.setMonth(d.getMonth() + pas);
  else d.setDate(d.getDate() + pas * (unite === 'week' ? 7 : 1));
  return d;
}

function cle(date, unite) {
  const base = `${date.getFullYear()}-${deuxChiffres(date.getMonth() + 1)}`;
  return unite === 'month' ? base : `${base}-${deuxChiffres(date.getDate())}`;
}

// Regroupement fait en SQL (plus sûr qu'un group-by en mémoire), puis
// complété côté JS avec des 0 pour les périodes sans aucune demande : le
// graphe reste continu.
async function serie({ unite, nombre, format }, maintenant) {
  const lignes = await sequelize.query(
    `
    SELECT to_char(date_trunc('${unite}', created_at), '${format}') AS periode, COUNT(*)::int AS total
    FROM devis
    WHERE created_at >= date_trunc('${unite}', NOW()) - INTERVAL '${nombre - 1} ${unite}'
    GROUP BY 1
    ORDER BY 1 ASC
    `,
    { type: QueryTypes.SELECT }
  );
  const totaux = new Map(lignes.map((l) => [l.periode, l.total]));

  const points = [];
  let curseur = decaler(debutPeriode(maintenant, unite), unite, -(nombre - 1));
  for (let i = 0; i < nombre; i += 1) {
    const periode = cle(curseur, unite);
    points.push({ periode, total: totaux.get(periode) || 0 });
    curseur = decaler(curseur, unite, 1);
  }
  return points;
}

async function stats(maintenant = new Date()) {
  const [total, totalTraites, parMois, parSemaine, parJour] = await Promise.all([
    Devis.count(),
    Devis.count({ where: { statut: 'traite' } }),
    serie(SERIES.mois, maintenant),
    serie(SERIES.semaine, maintenant),
    serie(SERIES.jour, maintenant),
  ]);

  // La dernière valeur de chaque série correspond à la période en cours.
  const dernier = (points) => points[points.length - 1].total;

  return {
    total,
    totalTraites,
    totalEnAttente: total - totalTraites,
    ceMois: dernier(parMois),
    cetteSemaine: dernier(parSemaine),
    aujourdhui: dernier(parJour),
    parMois,
    parSemaine,
    parJour,
  };
}

module.exports = { stats, debutPeriode, cle };
