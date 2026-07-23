FROM node:22-slim

WORKDIR /app

# Install dependencies needed for build/run if any
RUN apt-get update && apt-get install -y --no-install-recommends \
    wget curl \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

EXPOSE 3009
ENV PORT=3009

CMD ["npm", "start"]
