/**
 * Bloc "Mur de style" : une carte complète (titre, ligne, slider, panneau gauche).
 */
export interface BlocMurDeStyle {
  id: string;
  /** Titre affiché en haut et en bas (ex. "Costumes") */
  titre: string;
  /** Sous-titre au-dessus du titre (ex. "Choisissez un modèle...") */
  sousTitre: string;
  /** URLs des images du ruban défilant (ordre conservé) */
  imagesSlider: string[];
  /** URL de l'image du panneau gauche ("Voir plus") */
  imageGaucheUrl: string;
  /** Texte long dans la bande noire (ex. "Costume croisé Navy") */
  texteLong: string;
  /** Texte court en bas (ex. "Costume") — même libellé que titre en principe */
  texteCourt: string;
  /** Slug pour le lien vers la fiche catalogue */
  slug: string;
  /** Ordre d'affichage des blocs */
  ordre: number;
  createdAt?: string;
  updatedAt?: string;
}

export type BlocMurDeStyleInsert = Omit<BlocMurDeStyle, "id" | "createdAt" | "updatedAt"> &
  Partial<Pick<BlocMurDeStyle, "ordre">>;

export type BlocMurDeStyleUpdate = Partial<Omit<BlocMurDeStyle, "id" | "createdAt">>;
