/**
 * Feature Catalogue — Public API.
 * Les pages et autres features n'importent que depuis @/features/catalogue.
 */
export { MurDeStyle, ViewerHD } from "./components";
export { useCatalogue, useVetementBySlug, useViewerZoom } from "./hooks";
export { getCatalogueVetements, getVetementBySlug } from "./services";
export type { Vetement, ImageVetement, AngleVetement } from "./types";
