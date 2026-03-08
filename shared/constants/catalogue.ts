/**
 * Sections du catalogue (onglets). Aligné avec le backend pour une future base de données.
 */
export const CATALOGUE_SECTIONS = ["vestes", "chaussures", "accessoires"] as const;
export type CatalogueSection = (typeof CATALOGUE_SECTIONS)[number];

export const CATALOGUE_SECTION_LABELS: Record<CatalogueSection, string> = {
  vestes: "Vestes",
  chaussures: "Chaussures",
  accessoires: "Accessoires",
};

export function isCatalogueSection(s: string): s is CatalogueSection {
  return CATALOGUE_SECTIONS.includes(s as CatalogueSection);
}
