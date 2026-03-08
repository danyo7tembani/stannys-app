const DEFAULT_SLUG = "costume-croise-navy";

/**
 * Dérive un slug URL-safe à partir d'un texte (ex. "Costume croisé Navy" → "costume-croise-navy").
 * Minuscules, espaces → tirets, accents normalisés, caractères non autorisés supprimés.
 */
export function slugify(text: string | null | undefined, fallback = DEFAULT_SLUG): string {
  if (text == null || typeof text !== "string") return fallback;
  const trimmed = text.trim();
  if (!trimmed) return fallback;
  const normalized = trimmed
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return normalized || fallback;
}
