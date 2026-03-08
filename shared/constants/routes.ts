import type { CatalogueSection } from "./catalogue";

/**
 * Routes de l'application — single source of truth pour la navigation.
 */
export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  CATALOGUE: "/catalogue",
  /** Page d'une section (vestes, chaussures, accessoires) */
  CATALOGUE_SECTION: (section: CatalogueSection | string) => `/catalogue/${section}`,
  /** Fiche détail d'un bloc (section + slug) */
  CATALOGUE_ITEM: (section: CatalogueSection | string, slug: string) => `/catalogue/${section}/${slug}`,
  DOSSIER: "/dossier",
  /** Page dossiers pour le rôle atelier (liste, recherche, filtres en cours / terminés) */
  DOSSIERS_ATELIER: "/dossiers",
  MESURES: "/mesures",
  /** Paramètres (historique, langue, thème, etc.) */
  PARAMETRES: "/parametres",
  PARAMETRES_HISTORIQUE: "/parametres/historique",
  /** Gestion des utilisateurs et codes (réservé admin) */
  PARAMETRES_UTILISATEURS: "/parametres/utilisateurs",
  /** Détail d'un dossier enregistré (lecture seule) */
  PARAMETRES_DOSSIER: (id: string) => `/parametres/historique/${id}`,
  /** Admin : vue dossiers par statut atelier (en cours / terminés) */
  PARAMETRES_DOSSIERS_STATUT: "/parametres/dossiers-statut",
  STUDIO: "/studio",
} as const;

export type RouteKey = keyof typeof ROUTES;
