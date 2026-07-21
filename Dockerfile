FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

ENV PORT=3011
EXPOSE 3011

CMD ["npm", "run", "start"]
