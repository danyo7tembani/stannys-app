# Guide de lancement – Stanny's Tailor Connect

Suivez ces étapes dans l’ordre pour lancer le projet et vérifier qu’il fonctionne sans erreur.

---

## Étape 1 : Installer les dépendances (racine)

Ouvrez un terminal à la **racine** du projet (`Stanny's` ou `Stanny's/`) et exécutez :

```bash
npm install
```

Vérifiez qu’il n’y a pas d’erreur (exit code 0). Cela installe les dépendances du frontend (Next.js, @dnd-kit, etc.) et **concurrently** pour lancer backend + frontend ensemble.

---

## Étape 2 : Installer les dépendances du backend

Toujours dans le terminal, allez dans le dossier backend et installez ses dépendances :

```bash
cd backend
npm install
cd ..
```

Vous devez revenir à la racine (`cd ..`) pour les commandes suivantes.

---

## Étape 3 : Fichiers d’environnement

### Backend

Si le fichier `backend/.env` n’existe pas, créez-le à partir de l’exemple :

- **Windows (PowerShell)** :  
  `Copy-Item backend\.env.example backend\.env`
- **Ou** copiez manuellement `backend/.env.example` vers `backend/.env`.

Contenu typique de `backend/.env` :

```
PORT=4000
DATA_DIR=./data
UPLOAD_DIR=./uploads
FRONTEND_ORIGIN=http://localhost:3000
```

### Frontend (optionnel en dev)

Si vous lancez le front sur `http://localhost:3000` et le backend sur `http://localhost:4000`, vous n’avez pas obligatoirement besoin de `.env.local` : le front utilise par défaut `http://localhost:4000` pour l’API en dev.

Pour personnaliser l’URL de l’API, créez à la racine un fichier `.env.local` avec :

```
NEXT_PUBLIC_API_URL=http://localhost:4000
```

---

## Étape 4 : Migration des données (si vous avez déjà des blocs)

Si vous avez déjà des données dans le projet Next.js (fichier `data/mur-de-style-blocs.json` et/ou dossier `public/uploads/mur-de-style/`), copiez-les vers le backend :

À la **racine** du projet :

```bash
node scripts/migrate-to-backend.cjs
```

Cela crée/remplit `backend/data/` et `backend/uploads/mur-de-style/`. Si vous n’avez pas encore de données, vous pouvez ignorer cette étape.

---

## Étape 5 : Lancer backend + frontend

À la **racine** du projet :

```bash
npm run dev:all
```

Vous devriez voir :

- Un processus **backend** qui affiche quelque chose comme : `Backend running at http://localhost:4000`
- Un processus **front** (Next.js) qui affiche : `Ready on http://localhost:3000` (ou équivalent)

Si une erreur s’affiche (ex. port déjà utilisé), fermez l’autre application qui utilise le port 3000 ou 4000, ou changez `PORT` dans `backend/.env` et éventuellement le port Next.js.

---

## Étape 6 : Vérifications dans le navigateur

1. Ouvrez **http://localhost:3000** dans votre navigateur.
2. Allez sur la page du **Mur de style** (catalogue / mur de style selon votre menu).
3. Vérifiez que :
   - La page s’affiche sans erreur dans la console (F12 → Console).
   - Si vous avez migré des données, les blocs existants s’affichent avec leurs images.

---

## Étape 7 : Tester les actions (tout passe par le backend)

Pour confirmer que le backend répond bien :

| Action | Où | Résultat attendu |
|--------|-----|-------------------|
| **Création** | Bouton « Ajouter » → formulaire → Enregistrer | Message « Section créée. », modale se ferme, nouveau bloc apparaît. |
| **Édition** | Bouton « Modifier » sur un bloc → modifier champs/images → Enregistrer | Message « Section enregistrée. », modale se ferme, liste à jour. |
| **Suppression** | Bouton « Supprimer » sur un bloc → confirmer | Bloc disparaît ; depuis la modale : « Section supprimée. » puis fermeture. |
| **Réordre blocs** | Poignée (⋮⋮) à gauche d’un bloc → glisser-déposer | L’ordre change et reste après rechargement. |
| **Réordre images (slide)** | Modifier un bloc → glisser une miniature du slide | L’ordre des images change ; après Enregistrer, il est conservé. |

En cas d’erreur réseau ou backend (ex. backend arrêté), un message d’erreur doit s’afficher (dans la modale ou au-dessus de la liste) et la modale ne doit pas se fermer / la liste ne doit pas être mise à jour tant que l’action n’a pas réussi.

---

## En cas de problème

- **« Cannot find module '@dnd-kit/...' »**  
  À la racine : `npm install`, puis relancer `npm run dev:all`.

- **Backend ne démarre pas (port 4000)**  
  Vérifiez que `backend/.env` existe et que `PORT=4000` (ou un autre port libre). Vérifiez qu’aucune autre app n’utilise ce port.

- **Frontend affiche des erreurs API / CORS**  
  Vérifiez que le backend tourne bien sur le port indiqué par `NEXT_PUBLIC_API_URL` (ou 4000 par défaut) et que `FRONTEND_ORIGIN=http://localhost:3000` est bien défini dans `backend/.env`.

- **Images ne s’affichent pas**  
  Vérifiez que les fichiers ont bien été migrés dans `backend/uploads/mur-de-style/` (étape 4) et que le backend sert les fichiers statiques sous `/uploads`.

---

## Récapitulatif des commandes (à la racine)

```bash
npm install
cd backend && npm install && cd ..
node scripts/migrate-to-backend.cjs   # si vous avez déjà des données
npm run dev:all
```

Puis ouvrir **http://localhost:3000** et tester les actions du tableau ci-dessus.
