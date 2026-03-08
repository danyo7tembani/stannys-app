import type { Vetement } from "../types";

/**
 * Données de démo — à remplacer par Supabase / API.
 */
const catalogueVetements: Vetement[] = [
  {
    id: "1",
    slug: "costume-croise-navy",
    nom: "Costume croisé Navy",
    description: "Costume deux pièces croisé, finition satinée.",
    categorie: "Costume",
    images: [
      { id: "i1-1", angle: "face", url: "/catalogue/1-face.jpg", label: "Face", order: 1 },
      { id: "i1-2", angle: "dos", url: "/catalogue/1-dos.jpg", label: "Dos", order: 2 },
      { id: "i1-3", angle: "profil_gauche", url: "/catalogue/1-profil-g.jpg", label: "Profil gauche", order: 3 },
      { id: "i1-4", angle: "profil_droit", url: "/catalogue/1-profil-d.jpg", label: "Profil droit", order: 4 },
      { id: "i1-5", angle: "detail", url: "/catalogue/1-detail.jpg", label: "Détail tissu", order: 5 },
    ],
  },
  {
    id: "2",
    slug: "veste-sport-brun",
    nom: "Veste sport Brun",
    description: "Veste décontractée, un bouton, patch pockets.",
    categorie: "Veste",
    images: [
      { id: "i2-1", angle: "face", url: "/catalogue/2-face.jpg", label: "Face", order: 1 },
      { id: "i2-2", angle: "dos", url: "/catalogue/2-dos.jpg", label: "Dos", order: 2 },
      { id: "i2-3", angle: "profil_gauche", url: "/catalogue/2-profil-g.jpg", label: "Profil gauche", order: 3 },
      { id: "i2-4", angle: "profil_droit", url: "/catalogue/2-profil-d.jpg", label: "Profil droit", order: 4 },
      { id: "i2-5", angle: "detail", url: "/catalogue/2-detail.jpg", label: "Détail", order: 5 },
    ],
  },
  {
    id: "3",
    slug: "smoking-ivoire",
    nom: "Smoking Ivoire",
    description: "Smoking classique col shawl, satin noir.",
    categorie: "Smoking",
    images: [
      { id: "i3-1", angle: "face", url: "/catalogue/3-face.jpg", label: "Face", order: 1 },
      { id: "i3-2", angle: "dos", url: "/catalogue/3-dos.jpg", label: "Dos", order: 2 },
      { id: "i3-3", angle: "trois_quarts", url: "/catalogue/3-34.jpg", label: "¾", order: 3 },
      { id: "i3-4", angle: "detail", url: "/catalogue/3-detail.jpg", label: "Détail", order: 4 },
    ],
  },
];

/**
 * Récupère la liste des vêtements du catalogue.
 */
export function getCatalogueVetements(): Vetement[] {
  return catalogueVetements;
}

/**
 * Récupère un vêtement par son slug.
 */
export function getVetementBySlug(slug: string): Vetement | undefined {
  return catalogueVetements.find((v) => v.slug === slug);
}
