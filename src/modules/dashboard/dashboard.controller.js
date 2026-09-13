const dashboardService = require('./dashboard.service');
const asyncHandler = require('../../utils/asyncHandler');

const stats = asyncHandler(async (req, res) => {
  const resultat = await dashboardService.stats();
  res.json({ succes: true, ...resultat });
});

module.exports = { stats };
