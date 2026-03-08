import type { DossierEnregistre } from "./types.js";

/**
 * Contrat du stockage de l'historique des dossiers.
 * Implémentation actuelle : fichier JSON.
 * Future : base de données (même interface, autre implémentation).
 */
export interface DossiersHistoryRepository {
  list: () => Promise<DossierEnregistre[]>;
  getById: (id: string) => Promise<DossierEnregistre | null>;
  add: (dossier: Omit<DossierEnregistre, "id" | "createdAt">) => Promise<DossierEnregistre>;
  updateStatus: (id: string, status: "brouillon" | "definitif") => Promise<boolean>;
  updateAtelierStatut: (id: string, atelierStatut: "en_cours" | "termine") => Promise<boolean>;
  remove: (id: string) => Promise<boolean>;
}
