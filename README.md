# Stanny's Tailor Connect

Application Next.js (frontend) + API Express (backend) pour le mur de style et le catalogue.

## Lancer le projet

### Option 1 : Tout lancer en une commande (recommandé en dev)

À la racine du repo, après `npm install` :

```bash
npm run dev:all
```

Cela démarre le backend (port 4000) et le frontend (port 3000) en parallèle.

### Option 2 : Lancer séparément

**Backend (API)**

```bash
cd backend
npm install
npm run dev
```

Le serveur API écoute sur **http://localhost:4000**.

**Frontend (Next.js)**

À la racine du repo :

```bash
npm install
npm run dev
```

Ou `npm run dev:front` (identique à `npm run dev`). L’application est disponible sur **http://localhost:3000**.

## Variables d’environnement

### Backend (`backend/.env`)

Créer `backend/.env` à partir de `backend/.env.example` :

| Variable         | Description                          | Exemple              |
|------------------|--------------------------------------|----------------------|
| `PORT`           | Port du serveur API                  | `4000`               |
| `DATA_DIR`       | Dossier des données JSON             | `./data`             |
| `UPLOAD_DIR`     | Dossier des fichiers uploadés        | `./uploads`          |
| `FRONTEND_ORIGIN`| Origine CORS (URL du frontend)       | `http://localhost:3000` |

### Frontend (racine `.env.local`)

Créer `.env.local` à la racine (voir `.env.local.example`) :

| Variable                | Description                    | Exemple              |
|-------------------------|--------------------------------|----------------------|
| `NEXT_PUBLIC_API_URL`   | URL de l’API backend           | `http://localhost:4000` |

Si `NEXT_PUBLIC_API_URL` n’est pas définie, le frontend utilise par défaut `http://localhost:4000` en développement.

## Migration des données vers le backend

Si des blocs et des images existent déjà (dans `data/mur-de-style-blocs.json` et `public/uploads/mur-de-style/`), vous pouvez les copier vers le backend avant de l’utiliser :

```bash
node scripts/migrate-to-backend.cjs
```

Ce script :

- copie `data/mur-de-style-blocs.json` vers `backend/data/` ;
- copie le contenu de `public/uploads/mur-de-style/` vers `backend/uploads/mur-de-style/`.

**Les fichiers originaux ne sont pas supprimés.** Vérifier que le backend affiche bien les données avant d’éventuellement nettoyer les originaux.

## Structure

- **Racine** : application Next.js (pages, composants, styles).
- **backend/** : API Express (routes mur-de-style, upload, fichiers statiques sous `/uploads`).
- **scripts/migrate-to-backend.cjs** : script de migration des données vers le backend.

## Fonctionnalités Mur de style

Toutes les actions passent par le backend : création, édition, suppression et réordonnancement des blocs, réordonnancement des images du slide en édition. En cas d’échec (PUT / PATCH / DELETE), un message d’erreur s’affiche et la modale reste ouverte ; en cas de succès, un message discret s’affiche puis la modale se ferme et la liste est rafraîchie.
