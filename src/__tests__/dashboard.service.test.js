jest.mock('../models', () => ({
  sequelize: { query: jest.fn() },
  Devis: { count: jest.fn() },
}));

const { sequelize, Devis } = require('../models');
const dashboardService = require('../modules/dashboard/dashboard.service');

describe('dashboardService.debutPeriode', () => {
  // Mercredi 30 septembre 2026
  const date = new Date(2026, 8, 30, 15, 42);

  it('ramène au 1er du mois', () => {
    expect(dashboardService.cle(dashboardService.debutPeriode(date, 'month'), 'month')).toBe('2026-09');
  });

  it('ramène au lundi de la semaine', () => {
    expect(dashboardService.cle(dashboardService.debutPeriode(date, 'week'), 'week')).toBe('2026-09-28');
  });

  it('ramène un dimanche au lundi précédent', () => {
    const dimanche = new Date(2026, 9, 4);
    expect(dashboardService.cle(dashboardService.debutPeriode(dimanche, 'week'), 'week')).toBe('2026-09-28');
  });
});

describe('dashboardService.stats', () => {
  it('complète les séries avec des 0 et expose les compteurs de la période en cours', async () => {
    Devis.count.mockResolvedValueOnce(10).mockResolvedValueOnce(4);
    sequelize.query.mockImplementation(async (sql) => {
      if (sql.includes("'month'")) return [{ periode: '2026-09', total: 3 }, { periode: '2026-01', total: 2 }];
      if (sql.includes("'week'")) return [{ periode: '2026-09-28', total: 2 }];
      return [{ periode: '2026-09-30', total: 1 }];
    });

    const r = await dashboardService.stats(new Date(2026, 8, 30, 12));

    expect(r).toMatchObject({ total: 10, totalTraites: 4, totalEnAttente: 6, ceMois: 3, cetteSemaine: 2, aujourdhui: 1 });
    expect(r.parMois).toHaveLength(12);
    expect(r.parMois[0].periode).toBe('2025-10');
    expect(r.parMois.find((p) => p.periode === '2026-01').total).toBe(2);
    expect(r.parSemaine).toHaveLength(12);
    expect(r.parSemaine[0].periode).toBe('2026-07-13');
    expect(r.parJour).toHaveLength(30);
    expect(r.parJour[0].periode).toBe('2026-09-01');
  });
});
