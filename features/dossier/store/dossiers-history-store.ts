import { create } from "zustand";
import type { DossierClient } from "../types";
import {
  fetchDossiersList,
  apiAddDossier,
  apiRemoveDossier,
  apiUpdateDossierStatus,
  apiUpdateDossierAtelierStatut,
  type DossierEnregistreApi,
} from "../api/dossiers-history";

export type DossierEnregistre = DossierEnregistreApi;

interface DossiersHistoryState {
  dossiers: DossierEnregistre[];
  loading: boolean;
  error: string | null;
  fetchDossiers: () => Promise<void>;
  addDossier: (dossier: Partial<DossierClient>) => Promise<DossierEnregistre>;
  updateDossierStatus: (id: string, status: "brouillon" | "definitif") => Promise<void>;
  updateDossierAtelierStatut: (id: string, atelierStatut: "en_cours" | "termine") => Promise<void>;
  removeDossier: (id: string) => Promise<void>;
  setDossiers: (dossiers: DossierEnregistre[]) => void;
}

export const useDossiersHistoryStore = create<DossiersHistoryState>()((set, get) => ({
  dossiers: [],
  loading: false,
  error: null,

  fetchDossiers: async () => {
    set({ loading: true, error: null });
    try {
      const dossiers = await fetchDossiersList();
      set({ dossiers, loading: false });
    } catch (e) {
      const message = e instanceof Error ? e.message : "Erreur réseau";
      set({ error: message, loading: false, dossiers: [] });
    }
  },

  addDossier: async (dossier: Partial<DossierClient>) => {
    const saved = await apiAddDossier(dossier);
    set((s) => ({ dossiers: [saved, ...s.dossiers], error: null }));
    return saved;
  },

  updateDossierStatus: async (id: string, status: "brouillon" | "definitif") => {
    const updated = await apiUpdateDossierStatus(id, status);
    set((s) => ({
      dossiers: s.dossiers.map((d) => (d.id === id ? updated : d)),
      error: null,
    }));
  },

  updateDossierAtelierStatut: async (id: string, atelierStatut: "en_cours" | "termine") => {
    const updated = await apiUpdateDossierAtelierStatut(id, atelierStatut);
    set((s) => ({
      dossiers: s.dossiers.map((d) => (d.id === id ? updated : d)),
      error: null,
    }));
  },

  removeDossier: async (id: string) => {
    await apiRemoveDossier(id);
    set((s) => ({ dossiers: s.dossiers.filter((d) => d.id !== id), error: null }));
  },

  setDossiers: (dossiers) => set({ dossiers }),
}));
