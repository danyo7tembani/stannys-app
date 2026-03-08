/**
 * Classes partagées pour le rendu visible des modales « Modifier » et « Ajouter »
 * (taille, disposition, style). Chaque modale conserve sa propre logique et contenu.
 */
export const MODAL_BACKDROP_CLASSES =
  "fixed inset-0 z-[100] flex min-h-screen items-center justify-center bg-black/70 p-4 sm:p-6";

export const MODAL_PANEL_CLASSES =
  "relative my-auto max-h-[90vh] w-[min(94vw,52rem)] min-w-[320px] overflow-y-auto overflow-x-hidden rounded-lg border border-luxe-or/30 bg-luxe-noir p-6 shadow-xl";
