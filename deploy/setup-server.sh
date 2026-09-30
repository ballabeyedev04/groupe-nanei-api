#!/usr/bin/env bash
# ============================================================
#  Groupe Nanei API — Installation du site sur le VPS (Ubuntu 22.04 / 24.04)
#  Usage  : sudo bash deploy/setup-server.sh --domain api.groupe-nanei.fr
#  Lancer UNE SEULE FOIS, après avoir cloné le dépôt dans APP_DIR.
#
#  Prévu pour un VPS qui peut déjà héberger une autre application :
#  n'installe que ce qui manque, ne réinitialise pas le pare-feu et ne
#  touche pas aux autres sites Nginx.
# ============================================================
set -euo pipefail

# ── Paramètres configurables ─────────────────────────────────────────────────
APP_USER="${APP_USER:-nodeapp}"
APP_DIR="/var/www/groupe-nanei-api"
SITE_NAME="groupe-nanei-api"
DOMAIN="${DOMAIN:-YOUR_DOMAIN}"   # passer via : DOMAIN=api.groupe-nanei.fr sudo bash setup-server.sh

# Parse --domain flag
while [[ $# -gt 0 ]]; do
    case "$1" in
        --domain) DOMAIN="$2"; shift 2 ;;
        *) shift ;;
    esac
done

if [[ "$DOMAIN" == "YOUR_DOMAIN" ]]; then
    echo "ATTENTION : DOMAIN non défini. Utilisation : DOMAIN=api.example.com sudo bash setup-server.sh"
    echo "           Ou : sudo bash deploy/setup-server.sh --domain api.example.com"
    exit 1
fi

echo "==> [1/6] Installation des paquets manquants"
apt-get update -qq
for pkg in curl git ufw nginx certbot python3-certbot-nginx; do
    dpkg -s "$pkg" &>/dev/null || apt-get install -y -qq "$pkg"
done
if ! command -v docker &>/dev/null; then
    curl -fsSL https://get.docker.com | sh
fi

echo "==> [2/6] Utilisateur applicatif '${APP_USER}'"
id "${APP_USER}" &>/dev/null || useradd -m -s /bin/bash "${APP_USER}"
usermod -aG docker "${APP_USER}"

echo "==> [3/6] Arborescence de l'application"
mkdir -p "${APP_DIR}/logs" "${APP_DIR}/backups" /var/www/certbot
chown -R "${APP_USER}:${APP_USER}" "${APP_DIR}"
chmod 750 "${APP_DIR}"

echo "==> [4/6] Pare-feu (UFW) — ouverture SSH / HTTP / HTTPS"
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

echo "==> [5/6] Configuration Nginx"
cp "$(dirname "$0")/nginx.conf" "/etc/nginx/sites-available/${SITE_NAME}"
sed -i "s/YOUR_DOMAIN/${DOMAIN}/g" "/etc/nginx/sites-available/${SITE_NAME}"

# Le bloc 443 référence le certificat : on démarre avec le seul bloc HTTP
# le temps que Certbot l'obtienne, puis on active la configuration complète.
if [ ! -f "/etc/letsencrypt/live/${DOMAIN}/fullchain.pem" ]; then
    cat > "/etc/nginx/sites-enabled/${SITE_NAME}" <<EOF
server {
    listen 80;
    listen [::]:80;
    server_name ${DOMAIN};
    location /.well-known/acme-challenge/ { root /var/www/certbot; }
}
EOF
    nginx -t && systemctl reload nginx

    echo "==> [6/6] Obtention du certificat SSL via Certbot"
    certbot certonly --webroot -w /var/www/certbot \
        -d "${DOMAIN}" \
        --non-interactive \
        --agree-tos \
        --register-unsafely-without-email
    rm -f "/etc/nginx/sites-enabled/${SITE_NAME}"
else
    echo "==> [6/6] Certificat déjà présent pour ${DOMAIN}"
fi

ln -sf "/etc/nginx/sites-available/${SITE_NAME}" "/etc/nginx/sites-enabled/${SITE_NAME}"
nginx -t && systemctl reload nginx

echo ""
echo "============================================"
echo " Setup terminé pour ${DOMAIN} !"
echo ""
echo " Étapes suivantes :"
echo "   1. cd ${APP_DIR}"
echo "   2. cp .env.example .env && nano .env   (remplir TOUTES les valeurs)"
echo "   3. docker compose -f docker-compose.prod.yml up -d --build"
echo "   4. docker compose -f docker-compose.prod.yml exec backend npm run seed:admin"
echo "   5. curl https://${DOMAIN}/health"
echo ""
echo " Ensuite, chaque push sur main redéploie automatiquement"
echo " (.github/workflows/deploy.yml)."
echo "============================================"
