import type { Vetement, ImageVetement } from "../types";

/**
 * URL placeholder pour démo (Picsum) quand l'image locale n'existe pas.
 */
export function getPlaceholderUrlForVetement(vetement: Vetement, index: number): string {
  const seed = vetement.id.charCodeAt(0) + index;
  return `https://picsum.photos/seed/${seed}/800/1000`;
}

/** Accepte ImageVetement ou un objet minimal { id, url } (ex. ThumbButton). */
export function getPlaceholderUrlForImage(
  img: ImageVetement | { id: string; url: string; order?: number } | null | undefined,
  vetementId: string
): string {
  const order = img && "order" in img && typeof (img as ImageVetement).order === "number"
    ? (img as ImageVetement).order
    : 0;
  const seed = vetementId.charCodeAt(0) + order;
  return `https://picsum.photos/seed/${seed}/1200/1400`;
}

export function resolveImageUrl(
  url: string | undefined,
  fallback: string
): string {
  if (!url) return fallback;
  if (url.startsWith("http") || url.startsWith("/")) return url;
  return fallback;
}
