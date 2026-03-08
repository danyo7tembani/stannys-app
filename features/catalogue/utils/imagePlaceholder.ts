import type { Vetement, ImageVetement } from "../types";

/**
 * URL placeholder pour démo (Picsum) quand l'image locale n'existe pas.
 */
export function getPlaceholderUrlForVetement(vetement: Vetement, index: number): string {
  const seed = vetement.id.charCodeAt(0) + index;
  return `https://picsum.photos/seed/${seed}/800/1000`;
}

export function getPlaceholderUrlForImage(img: ImageVetement, vetementId: string): string {
  const seed = vetementId.charCodeAt(0) + img.order;
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
