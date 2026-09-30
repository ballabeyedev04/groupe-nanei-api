#!/usr/bin/env bash
# ============================================================
#  Groupe Nanei API — Sauvegarde PostgreSQL
#  Usage   : bash deploy/backup-postgres.sh
#  Cron    : 30 2 * * * /var/www/groupe-nanei-api/deploy/backup-postgres.sh >> /var/log/groupe-nanei-backup.log 2>&1
#
#  Fonctionnement :
#   • Docker Compose → pg_dump via le conteneur postgres
#   • PM2 / bare metal → pg_dump direct (postgres doit être installé sur l'hôte)
#   • Compresse le dump en .gz
#   • Envoie une copie sur Google Drive si rclone est configuré
#   • Purge les sauvegardes locales de plus de KEEP_DAYS jours
# ============================================================
set -euo pipefail

APP_DIR="/var/www/groupe-nanei-api"
BACKUP_DIR="${APP_DIR}/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/groupe_nanei_${TIMESTAMP}.sql.gz"
KEEP_DAYS=3

# Charger les variables d'environnement depuis .env
if [ -f "${APP_DIR}/.env" ]; then
    set -o allexport
    # shellcheck disable=SC1090
    source <(grep -E '^(DB_|PGPASSWORD)' "${APP_DIR}/.env" | sed 's/ *= */=/')
    set +o allexport
fi

DB_NAME="${DB_NAME:-groupe_nanei}"
DB_USER="${DB_USER:-groupe_nanei}"
DB_HOST="${DB_HOST:-127.0.0.1}"
DB_PORT="${DB_PORT:-5432}"

mkdir -p "${BACKUP_DIR}"

echo "[backup] $(date '+%Y-%m-%d %H:%M:%S') — Début sauvegarde de '${DB_NAME}'"

# Détecter le mode (Docker ou bare metal)
if docker compose -f "${APP_DIR}/docker-compose.prod.yml" ps postgres 2>/dev/null | grep -q "Up"; then
    echo "[backup] Mode : Docker Compose"
    docker compose -f "${APP_DIR}/docker-compose.prod.yml" exec -T postgres \
        pg_dump -U "${DB_USER}" "${DB_NAME}" \
        | gzip > "${BACKUP_FILE}"
else
    echo "[backup] Mode : bare metal (pg_dump direct)"
    PGPASSWORD="${DB_PASSWORD:-}" pg_dump \
        -h "${DB_HOST}" \
        -p "${DB_PORT}" \
        -U "${DB_USER}" \
        "${DB_NAME}" \
        | gzip > "${BACKUP_FILE}"
fi

SIZE=$(du -sh "${BACKUP_FILE}" | cut -f1)
echo "[backup] Sauvegarde créée : ${BACKUP_FILE} (${SIZE})"

# Upload vers Google Drive
RCLONE_BIN=$(command -v rclone || echo "/usr/bin/rclone")
GDRIVE_FOLDER="gdrive:groupe-nanei-api-backups"
if [ -x "${RCLONE_BIN}" ]; then
    echo "[backup] Upload vers Google Drive..."
    "${RCLONE_BIN}" copy "${BACKUP_FILE}" "${GDRIVE_FOLDER}"
    echo "[backup] Upload terminé → ${GDRIVE_FOLDER}"
else
    echo "[backup] rclone introuvable — upload Drive ignoré"
fi

# Purger les sauvegardes de plus de KEEP_DAYS jours (local)
find "${BACKUP_DIR}" -name "groupe_nanei_*.sql.gz" -mtime "+${KEEP_DAYS}" -delete
REMAINING=$(find "${BACKUP_DIR}" -name "groupe_nanei_*.sql.gz" | wc -l)
echo "[backup] Sauvegardes locales conservées : ${REMAINING}"

echo "[backup] $(date '+%Y-%m-%d %H:%M:%S') — Terminé"
