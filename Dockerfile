# ============================================================
#  Groupe Nanei API — Dockerfile multi-stage (production)
#  Stage 1 : deps    → installe uniquement les dépendances de prod
#  Stage 2 : runner  → image finale légère
# ============================================================

FROM node:22.20.0-slim AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev --no-fund

FROM node:22.20.0-slim AS runner

RUN apt-get update && apt-get install -y --no-install-recommends \
        ca-certificates \
        curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --chown=node:node . .

RUN mkdir -p logs && chown -R node:node /app

# Le bit exécutable ne survit pas toujours à un clone Windows, et les fins de
# ligne CRLF cassent le shebang ("exec format error" au démarrage).
RUN sed -i 's/\r$//' /app/docker-entrypoint.sh \
    && chmod +x /app/docker-entrypoint.sh

USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -fsS "http://$(hostname -i | cut -d' ' -f1):3000/health" || exit 1

ENTRYPOINT ["/app/docker-entrypoint.sh"]
CMD ["node", "src/server.js"]
