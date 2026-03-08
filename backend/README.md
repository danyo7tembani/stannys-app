# API Backend – Mur de style

API Express (Node.js + TypeScript) pour les blocs du mur de style et l’upload d’images.

## Lancer le backend

```bash
npm install
npm run dev
```

Le serveur écoute sur **http://localhost:4000** (configurable via `PORT` dans `.env`).

## Variables d’environnement

Copier `.env.example` vers `.env` et adapter :

- `PORT` : port du serveur (défaut 4000)
- `DATA_DIR` : dossier des données JSON (ex. `./data`)
- `UPLOAD_DIR` : dossier des uploads (ex. `./uploads`)
- `FRONTEND_ORIGIN` : origine CORS du frontend (ex. `http://localhost:3000`)

## Depuis la racine du projet

Pour lancer backend et frontend ensemble :

```bash
npm run dev:all
```

Pour lancer uniquement le backend depuis la racine :

```bash
npm run dev:backend
```
