// Démarrage via PM2 sans Docker (alternative pour un petit VPS). Un seul
// process suffit pour ce volume de trafic (site vitrine + back-office) —
// pas besoin du mode cluster.
module.exports = {
  apps: [
    {
      name: 'groupe-nanei-api',
      script: 'src/server.js',
      instances: 1,
      exec_mode: 'fork',
      env_production: { NODE_ENV: 'production' },
      max_memory_restart: '300M',
      out_file: 'logs/out.log',
      error_file: 'logs/error.log',
      time: true,
    },
  ],
};
