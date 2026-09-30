#!/usr/bin/env bash
# ============================================================
#  Groupe Nanei API — Déploiement manuel (mise à jour)
#  Usage : bash deploy/deploy.sh [--mode docker|pm2]
#  À lancer depuis la racine du projet sur le VPS
#  (le déploiement automatique passe par .github/workflows/deploy.yml)
# ============================================================
set -euo pipefail

APP_DIR="/var/www/groupe-nanei-api"
MODE="${DEPLOY_MODE:-docker}"   # docker | pm2

# Parse --mode flag
while [[ $# -gt 0 ]]; do
    case "$1" in
        --mode) MODE="$2"; shift 2 ;;
        *) shift ;;
    esac
done

echo "[deploy] Répertoire : ${APP_DIR}"
echo "[deploy] Mode       : ${MODE}"

# 1. Se positionner dans le bon répertoire
cd "${APP_DIR}"

# 2. Vérifier que .env est présent
if [ ! -f ".env" ]; then
    echo "[deploy] ERREUR : fichier .env manquant dans ${APP_DIR}"
    echo "         Copier .env.example vers .env et remplir toutes les valeurs."
    exit 1
fi

# 3. Créer les dossiers nécessaires si absents
mkdir -p logs

# 4. Récupérer les derniers changements
echo "[deploy] git pull..."
git pull --ff-only

if [[ "$MODE" == "docker" ]]; then
    # ── Mode Docker Compose ──────────────────────────────────────────────────
    # Les migrations sont appliquées par docker-entrypoint.sh au démarrage.
    echo "[deploy] Build et rechargement des conteneurs..."
    docker compose -f docker-compose.prod.yml up -d --build --remove-orphans

    echo "[deploy] Statut des conteneurs :"
    docker compose -f docker-compose.prod.yml ps

    echo "[deploy] Nettoyage des images inutilisées..."
    docker image prune -f

elif [[ "$MODE" == "pm2" ]]; then
    # ── Mode PM2 ─────────────────────────────────────────────────────────────
    echo "[deploy] npm ci..."
    npm ci --omit=dev --no-audit --no-fund

    echo "[deploy] Migrations..."
    npx sequelize-cli db:migrate

    echo "[deploy] pm2 reload..."
    pm2 reload ecosystem.config.js --env production --update-env

    echo "[deploy] Statut PM2 :"
    pm2 status groupe-nanei-api

else
    echo "[deploy] ERREUR : mode inconnu '${MODE}'. Utiliser 'docker' ou 'pm2'."
    exit 1
fi

echo ""
echo "[deploy] Déploiement terminé — $(date '+%Y-%m-%d %H:%M:%S')"
