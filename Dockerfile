FROM node:22-slim

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3009

LABEL org.opencontainers.image.source="abide-sovereign-control-plane"
LABEL org.opencontainers.image.revision="3458a3183d1914799cc16e7e3064cd69f4e27bae"

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl wget ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

EXPOSE 3009

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 CMD curl -fsS "http://127.0.0.1:${PORT:-3009}/healthz" || exit 1

CMD ["npm", "start"]
