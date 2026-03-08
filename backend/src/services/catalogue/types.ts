/**
 * Sections du catalogue (onglets). Prêt pour une future base de données :
 * une table "blocks" avec colonne section, ou une table par section.
 */
export const CATALOGUE_SECTIONS = ["vestes", "chaussures", "accessoires"] as const;
export type CatalogueSection = (typeof CATALOGUE_SECTIONS)[number];

export function isCatalogueSection(s: string): s is CatalogueSection {
  return CATALOGUE_SECTIONS.includes(s as CatalogueSection);
}
