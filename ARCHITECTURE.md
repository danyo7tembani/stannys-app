# Architecture Stanny's

Ce projet suit une **Clean Architecture** avec une organisation **Feature-first** et des principes **SOLID** / **DRY**. **Ne jamais s'écarter de cette organisation** pour toute nouvelle fonctionnalité.

---

## 1. Structure des dossiers

```
Stanny's/
├── app/                    # Next.js App Router (couche fine : routes + layout uniquement)
│   ├── layout.tsx
│   ├── page.tsx
│   ├── catalogue/
│   ├── dossier/
│   ├── mesures/
│   └── studio/
├── features/               # Modules métier (Feature-first)
│   ├── catalogue/
│   ├── dossier/
│   ├── measures/
│   └── studio/
└── shared/                 # Partagé : UI générique, constantes, utilitaires
    ├── constants/
    ├── layout/
    ├── lib/
    ├── types/
    └── ui/
```

---

## 2. Règles par couche

### `app/`
- **Rôle** : Déclarer les routes et le layout racine. Aucune logique métier.
- **Imports** : Uniquement depuis `@/features/*` et `@/shared/*`.
- **Exemple** : `app/dossier/page.tsx` importe `DossierPageContent` depuis `@/features/dossier`.

### `features/<nom>/`
Chaque feature est un **module autonome** avec :
- **`types.ts`** : Types métier de la feature.
- **`services/`** : Logique métier pure (appels données, validation, calculs). Pas de React.
- **`hooks/`** : Logique réutilisable côté client (état, effets). Peuvent utiliser les services et le store.
- **`components/`** : UI uniquement. Utilisent les hooks et les composants `@/shared/ui`.
- **`store/`** (si besoin) : État global de la feature (ex. Zustand).
- **`utils/`** (optionnel) : Helpers propres à la feature.
- **`index.ts`** : **API publique** du module. Tout import externe se fait via `@/features/<nom>`.

**Séparation des responsabilités** :
- Les **composants** ne contiennent pas de logique métier (pas de fetch, validation complexe).
- Les **hooks** orchestrent état + services.
- Les **services** sont testables sans React.

### `shared/`
- **`ui/`** : Composants atomiques réutilisables (Button, Card, Input, etc.).
- **`layout/`** : Structure globale (NavMain, footer, etc.).
- **`constants/`** : Routes, config, constantes globales.
- **`lib/`** : Utilitaires (cn, formatters, etc.).
- **`types/`** : Types partagés entre plusieurs features (ex. PointOr, PointBleu).

---

## 3. Aliases de chemins

Utiliser les alias pour des imports clairs et maintenables :

| Alias | Cible |
|-------|--------|
| `@/*` | Racine du projet |
| `@/features/*` | `./features/*` |
| `@/shared/*` | `./shared/*` |

**Règle** : Les pages dans `app/` n'importent **jamais** directement un fichier profond d'une feature (ex. `@/features/dossier/services/dossier.service`). Toujours importer depuis le **barrel** : `@/features/dossier`.

---

## 4. Conventions

- **DRY** : Factoriser dans `shared/` ou dans le module concerné ; pas de duplication entre features.
- **SOLID** : Une responsabilité par couche ; dépendances vers l’intérieur (features ne dépendent pas d’autres features si possible ; partagé via `shared/`).
- **Nouvelle feature** : Créer le dossier `features/<nom>` avec au minimum `types.ts`, `index.ts`, et les sous-dossiers `components/`, `hooks/`, `services/` selon les besoins.
- **Nouveau composant UI générique** : L’ajouter dans `shared/ui/` et l’exporter dans `shared/ui/index.ts`.

---

## 5. Résumé

| Où mettre… | Emplacement |
|------------|-------------|
| Route / page Next.js | `app/<route>/page.tsx` |
| Type métier d’une feature | `features/<nom>/types.ts` |
| Appel API / validation / calcul | `features/<nom>/services/` |
| Hook React (état, side-effects) | `features/<nom>/hooks/` |
| Composant d’écran ou de feature | `features/<nom>/components/` |
| Bouton, input, card générique | `shared/ui/` |
| Routes, config globale | `shared/constants/` |
| Type utilisé par 2+ features | `shared/types/` |

**Ne jamais déroger à cette organisation.** Toute nouvelle fonctionnalité doit respecter ce découpage.
