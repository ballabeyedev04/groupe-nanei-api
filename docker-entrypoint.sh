#!/bin/sh
set -e

# Attend que Postgres accepte les connexions avant de lancer les migrations —
# au premier démarrage du stack docker-compose, l'API démarre souvent avant
# que la base soit prête.
echo "[entrypoint] attente de la base de données ${DB_HOST}:${DB_PORT}..."
attempts=0
until node -e "
  const { Client } = require('pg');
  const c = new Client({ host: process.env.DB_HOST, port: process.env.DB_PORT, user: process.env.DB_USER, password: process.env.DB_PASSWORD, database: process.env.DB_NAME });
  c.connect().then(() => c.end()).then(() => process.exit(0)).catch(() => process.exit(1));
"; do
  attempts=$((attempts + 1))
  if [ "$attempts" -ge 30 ]; then
    echo "[entrypoint] la base de données ne répond toujours pas après 30 tentatives — abandon."
    exit 1
  fi
  sleep 2
done
echo "[entrypoint] base de données disponible."

echo "[entrypoint] application des migrations..."
npx sequelize-cli db:migrate

echo "[entrypoint] démarrage : $*"
exec "$@"
