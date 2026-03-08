/**
 * Ordre d'affichage des familles au catalogue (luxe & organisation).
 * Vestes costume ensemble, puis autres pièces en tissu veste, etc.
 */
export const CATEGORY_ORDER = [
  "Costume",
  "Veste",
  "Smoking",
] as const;

export type CatalogueCategory = (typeof CATEGORY_ORDER)[number];

export const CATEGORY_LABELS: Record<string, string> = {
  Costume: "Costumes",
  Veste: "Vestes",
  Smoking: "Smoking",
};
