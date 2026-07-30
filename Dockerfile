FROM node:22-slim AS builder

WORKDIR /app

# Install all dependencies including dev tools (Vite, esbuild)
COPY package*.json ./
RUN npm ci --include=dev

# Copy source and build
COPY . .
RUN npm run build

# Prune dev dependencies for the final image
RUN npm prune --omit=dev

# Production stage
FROM node:22-slim

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3009

LABEL org.opencontainers.image.source="abide-sovereign-control-plane"
LABEL org.opencontainers.image.revision="3458a3183d1914799cc16e7e3064cd69f4e27bae"

# Install curl for HEALTHCHECK, avoid installing wget as flagged in PR #9
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy production files and set ownership to non-root 'node' user
COPY --from=builder --chown=node:node /app/package*.json ./
COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/dist ./dist

# Use the built-in non-root node user as required by PR #9
USER node

EXPOSE 3009

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 CMD curl -fsS "http://127.0.0.1:${PORT:-3009}/healthz" || exit 1

CMD ["npm", "start"]
