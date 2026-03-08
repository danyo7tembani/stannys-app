/**
 * Feature Dossier — Public API.
 */
export { FormulaireDossier, CapturePhoto, DossierPageContent, MesuresPageContent } from "./components";
export { useDossierForm, useCapturePhoto } from "./hooks";
export { useDossierStore } from "./store";
export { saveDossierDraft, isDossierStepValid, isMesuresStepValid } from "./services";
export type { DossierClient, DossierFormData, ImageChoixModele } from "./types";
