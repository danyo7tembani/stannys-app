/**
 * Une image choisie en mode "Choix de modèle" (OR = base, BLEU = comparaison).
 */
export interface ImageChoixModele {
  blockId: string;
  slug: string;
  imageUrl: string;
  titre?: string;
}

/** Couleur du stylet Design Studio (Stanny's Code). */
export type AnnotationColor = "red" | "yellow" | "green";

/** Une forme dessinée sur une image (OR ou BLEU) avec son commentaire éventuel. */
export interface AnnotationShape {
  color: AnnotationColor;
  /** Points en coordonnées relatives 0–1 par rapport à l'image. */
  points: { x: number; y: number }[];
  comment?: string;
  /** Position du nuage (déplaçable), coordonnées relatives 0–1. Si absent, position par défaut. */
  cloudPosition?: { x: number; y: number };
}

/** Annotations par image : OR (une seule) et BLEU (liste indexée). */
export interface DossierAnnotations {
  or?: AnnotationShape[];
  bleu?: AnnotationShape[][];
}

/**
 * Types métier du module Dossier Client.
 */
export interface DossierClient {
  id?: string;
  nom: string;
  prenom: string;
  /** @deprecated Utiliser contact1/contact2. Conservé pour affichage des anciens dossiers. */
  contact?: string;
  contact1?: string;
  contact2?: string;
  contact1Prefix?: string;
  contact2Prefix?: string;
  mail?: string;
  dateDepot?: string;
  dateLivraison?: string;
  adresse?: string;
  photoFaciale?: string;
  photoCorps?: string;
  vetementBaseId?: string;
  vetementComparaisonIds?: string[];
  /** Image de base (OR) — 1ère sélection en Choix de modèle */
  imageBaseOr?: ImageChoixModele;
  /** Images de comparaison (BLEU) — 2e à 4e sélection, max 3 */
  imagesComparaisonBleu?: ImageChoixModele[];
  mesures?: Record<string, number>;
  /** Choix de chaussures : 0 à 3 images (pas de code couleur) */
  imagesChaussures?: ImageChoixModele[];
  /** Choix d'accessoires : 0 à 15 images (pas de code couleur) */
  imagesAccessoires?: ImageChoixModele[];
  annotations?: DossierAnnotations;
  createdAt?: string;
  /** Statut du dossier : brouillon (modifiable) ou définitif (lecture seule). */
  status?: "brouillon" | "definitif";
  /** Statut atelier : en cours de travail / terminé (pour le rôle atelier). */
  atelierStatut?: "en_cours" | "termine";
}

export type DossierFormData = Pick<
  DossierClient,
  | "nom"
  | "prenom"
  | "contact1"
  | "contact2"
  | "contact1Prefix"
  | "contact2Prefix"
  | "mail"
  | "dateDepot"
  | "dateLivraison"
  | "adresse"
>;
