import type { Vetement } from "../types";
import { CATEGORY_ORDER, CATEGORY_LABELS } from "../constants/categories";

export interface CatalogueSection {
  category: string;
  label: string;
  vetements: Vetement[];
}

/**
 * Groupe les vêtements par catégorie dans l'ordre luxe (Costume, Veste, Smoking).
 */
export function groupVetementsByCategory(vetements: Vetement[]): CatalogueSection[] {
  const order = [...CATEGORY_ORDER];
  const byCategory = new Map<string, Vetement[]>();

  for (const v of vetements) {
    const cat = v.categorie || "Autres";
    if (!byCategory.has(cat)) byCategory.set(cat, []);
    byCategory.get(cat)!.push(v);
  }

  const sections: CatalogueSection[] = [];
  for (const cat of order) {
    const list = byCategory.get(cat);
    if (list?.length) {
      sections.push({
        category: cat,
        label: CATEGORY_LABELS[cat] ?? cat,
        vetements: list,
      });
      byCategory.delete(cat);
    }
  }
  byCategory.forEach((list, cat) => {
    sections.push({ category: cat, label: CATEGORY_LABELS[cat] ?? cat, vetements: list });
  });
  return sections;
}
