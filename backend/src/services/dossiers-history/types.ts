/**
 * Types pour l'historique des dossiers client.
 * Alignés sur le frontend (features/dossier/types + DossierEnregistre).
 * Prêt pour remplacement par une base de données : même contrat, autre implémentation.
 */

export interface ImageChoixModele {
  blockId: string;
  slug: string;
  imageUrl: string;
  titre?: string;
}

export type AnnotationColor = "red" | "yellow" | "green";

export interface AnnotationShape {
  color: AnnotationColor;
  points: { x: number; y: number }[];
  comment?: string;
  cloudPosition?: { x: number; y: number };
}

export interface DossierAnnotations {
  or?: AnnotationShape[];
  bleu?: AnnotationShape[][];
}

export interface DossierClientPayload {
  nom: string;
  prenom: string;
  /** @deprecated Utiliser contact1/contact2. Conservé pour lecture des anciens dossiers. */
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
  imageBaseOr?: ImageChoixModele;
  imagesComparaisonBleu?: ImageChoixModele[];
  mesures?: Record<string, number>;
  imagesChaussures?: ImageChoixModele[];
  imagesAccessoires?: ImageChoixModele[];
  annotations?: DossierAnnotations;
  status?: "brouillon" | "definitif";
  /** Statut atelier : en cours de travail / terminé (pour le rôle atelier). */
  atelierStatut?: "en_cours" | "termine";
}

/** Dossier tel que stocké (avec id et createdAt générés côté serveur). */
export interface DossierEnregistre extends DossierClientPayload {
  id: string;
  createdAt: string;
}
