# Backend Stanny's — déploiement Fly.io
FROM node:20-alpine

WORKDIR /app

# Fichiers de dépendances
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Code source et build
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# Fly.io injecte PORT ; l'app écoute 0.0.0.0
ENV NODE_ENV=production
EXPOSE 4000

CMD ["npm", "start"]
