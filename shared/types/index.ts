/**
 * Types partagés entre plusieurs features (ex. sélections OR/BLEU utilisées par catalogue + studio).
 */
export type PointOr = { vetementId: string; imageId: string };
export type PointBleu = { vetementId: string; imageId: string }[];
