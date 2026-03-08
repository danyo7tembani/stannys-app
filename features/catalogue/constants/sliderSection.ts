/**
 * Constantes et helpers pour la section slider réutilisable.
 * Une seule source pour largeur du ruban, vitesse, boucle infinie.
 */

export const BLOCK_WIDTH = 280;
export const BLOCK_HEIGHT = 380;
export const GAP = 3;
export const SLIDE_DURATION_MS = 120000;

/**
 * Largeur d'un "set" (une répétition des images) pour la boucle infinie.
 */
export function getSetWidth(imageCount: number): number {
  const n = Math.max(1, imageCount);
  return n * BLOCK_WIDTH + (n - 1) * GAP;
}

/**
 * Vitesse de défilement (px/ms) pour un tour complet en SLIDE_DURATION_MS.
 */
export function getSlideVelocityPxMs(imageCount: number): number {
  return getSetWidth(imageCount) / SLIDE_DURATION_MS;
}

/**
 * Ramène l'offset dans l'intervalle ]-setWidth, 0] pour boucle infinie.
 */
export function clampSlideOffset(x: number, setWidth: number): number {
  let n = x;
  while (n > 0) n -= setWidth;
  while (n <= -setWidth) n += setWidth;
  return n;
}
