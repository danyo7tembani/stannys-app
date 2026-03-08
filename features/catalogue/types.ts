/**
 * Types métier du module Catalogue (Mur de Style, Viewer HD).
 */
export type AngleVetement =
  | "face"
  | "dos"
  | "profil_gauche"
  | "profil_droit"
  | "detail"
  | "trois_quarts";

export interface ImageVetement {
  id: string;
  angle: AngleVetement;
  url: string;
  label: string;
  order: number;
}

export interface Vetement {
  id: string;
  slug: string;
  nom: string;
  description: string;
  categorie: string;
  images: ImageVetement[];
  createdAt?: string;
}
