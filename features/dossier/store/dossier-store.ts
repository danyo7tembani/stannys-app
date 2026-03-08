import { create } from "zustand";
import type { DossierClient, ImageChoixModele } from "../types";

const MAX_BLEU = 3;
const MAX_CHAUSSURES = 3;
const MAX_ACCESSOIRES = 15;

export type SelectionFor = "vestes" | "chaussures" | "accessoires";

interface DossierState {
  dossier: Partial<DossierClient>;
  setDossier: (data: Partial<DossierClient>) => void;
  setPhotoFaciale: (url: string) => void;
  setPhotoCorps: (url: string) => void;
  reset: () => void;
  /** Mode sélection (depuis "Choix de modèle" vestes) */
  selectionMode: boolean;
  setSelectionMode: (v: boolean) => void;
  /** Section en cours de sélection (chaussures / accessoires) ; vestes = selectionMode true */
  selectionFor: SelectionFor | null;
  setSelectionFor: (v: SelectionFor | null) => void;
  /** Sélection en cours : OR (1) + BLEU (0 à 3) */
  selectedOr: ImageChoixModele | null;
  selectedBleu: ImageChoixModele[];
  /** Sélectionner comme image de base (OR). Une seule. */
  selectImageAsOr: (item: ImageChoixModele) => void;
  /** Ajouter comme image de comparaison (BLEU). Max 3. */
  addSelectedBleu: (item: ImageChoixModele) => void;
  /** Annuler la dernière sélection (BLEU puis OR). */
  removeLastSelection: () => void;
  /** Réinitialiser la sélection en cours (OR + BLEU). */
  clearSelection: () => void;
  /** Valider la sélection : copie dans dossier puis réinitialise le mode. */
  validateSelection: () => void;
  /** Choix de chaussures : 0 à 3 images */
  selectedChaussures: ImageChoixModele[];
  setSelectedChaussures: (items: ImageChoixModele[]) => void;
  addChaussure: (item: ImageChoixModele) => void;
  removeLastChaussure: () => void;
  validateChaussures: () => void;
  /** Choix d'accessoires : 0 à 15 images */
  selectedAccessoires: ImageChoixModele[];
  setSelectedAccessoires: (items: ImageChoixModele[]) => void;
  addAccessoire: (item: ImageChoixModele) => void;
  removeLastAccessoire: () => void;
  validateAccessoires: () => void;
}

const initial: Partial<DossierClient> = {
  nom: "",
  prenom: "",
  contact1: "",
  contact2: "",
  contact1Prefix: "+242",
  contact2Prefix: "+242",
  mail: "",
  dateDepot: undefined,
  dateLivraison: "",
  adresse: "",
};

function sameImage(a: ImageChoixModele, b: ImageChoixModele): boolean {
  return a.blockId === b.blockId && a.imageUrl === b.imageUrl;
}

export const useDossierStore = create<DossierState>((set, get) => ({
  dossier: initial,
  setDossier: (data) =>
    set((s) => ({ dossier: { ...s.dossier, ...data } })),
  setPhotoFaciale: (url) =>
    set((s) => ({ dossier: { ...s.dossier, photoFaciale: url } })),
  setPhotoCorps: (url) =>
    set((s) => ({ dossier: { ...s.dossier, photoCorps: url } })),
  reset: () =>
    set({
      dossier: initial,
      selectedOr: null,
      selectedBleu: [],
      selectedChaussures: [],
      selectedAccessoires: [],
      selectionMode: false,
      selectionFor: null,
    }),

  selectionMode: false,
  setSelectionMode: (v) => set({ selectionMode: v }),
  selectionFor: null,
  setSelectionFor: (v) =>
    set({
      selectionFor: v,
      selectionMode: false,
    }),

  selectedOr: null,
  selectedBleu: [],

  selectImageAsOr: (item) =>
    set({ selectedOr: item, selectedBleu: [] }),

  addSelectedBleu: (item) =>
    set((s) => {
      if (s.selectedBleu.length >= MAX_BLEU) return s;
      if (s.selectedBleu.some((b) => sameImage(b, item))) return s;
      return { selectedBleu: [...s.selectedBleu, item] };
    }),

  removeLastSelection: () =>
    set((s) => {
      if (s.selectedBleu.length > 0)
        return { selectedBleu: s.selectedBleu.slice(0, -1) };
      return { selectedOr: null };
    }),

  clearSelection: () =>
    set({ selectedOr: null, selectedBleu: [] }),

  validateSelection: () => {
    const { selectedOr, selectedBleu } = get();
    set((s) => ({
      dossier: {
        ...s.dossier,
        imageBaseOr: selectedOr ?? undefined,
        imagesComparaisonBleu:
          selectedBleu.length > 0 ? [...selectedBleu] : undefined,
      },
      selectedOr: null,
      selectedBleu: [],
      selectionMode: false,
      selectionFor: null,
    }));
  },

  selectedChaussures: [],
  setSelectedChaussures: (items) =>
    set({
      selectedChaussures:
        items.length <= MAX_CHAUSSURES ? items : items.slice(0, MAX_CHAUSSURES),
    }),
  addChaussure: (item) =>
    set((s) => {
      if (s.selectedChaussures.length >= MAX_CHAUSSURES) return s;
      if (s.selectedChaussures.some((c) => sameImage(c, item))) return s;
      return { selectedChaussures: [...s.selectedChaussures, item] };
    }),
  removeLastChaussure: () =>
    set((s) => ({
      selectedChaussures:
        s.selectedChaussures.length > 0
          ? s.selectedChaussures.slice(0, -1)
          : [],
    })),
  validateChaussures: () => {
    const { selectedChaussures } = get();
    set((s) => ({
      dossier: {
        ...s.dossier,
        imagesChaussures:
          selectedChaussures.length > 0 ? [...selectedChaussures] : undefined,
      },
      selectedChaussures: [],
      selectionFor: null,
    }));
  },

  selectedAccessoires: [],
  setSelectedAccessoires: (items) =>
    set({
      selectedAccessoires:
        items.length <= MAX_ACCESSOIRES
          ? items
          : items.slice(0, MAX_ACCESSOIRES),
    }),
  addAccessoire: (item) =>
    set((s) => {
      if (s.selectedAccessoires.length >= MAX_ACCESSOIRES) return s;
      if (s.selectedAccessoires.some((a) => sameImage(a, item))) return s;
      return { selectedAccessoires: [...s.selectedAccessoires, item] };
    }),
  removeLastAccessoire: () =>
    set((s) => ({
      selectedAccessoires:
        s.selectedAccessoires.length > 0
          ? s.selectedAccessoires.slice(0, -1)
          : [],
    })),
  validateAccessoires: () => {
    const { selectedAccessoires } = get();
    set((s) => ({
      dossier: {
        ...s.dossier,
        imagesAccessoires:
          selectedAccessoires.length > 0 ? [...selectedAccessoires] : undefined,
      },
      selectedAccessoires: [],
      selectionFor: null,
    }));
  },
}));
