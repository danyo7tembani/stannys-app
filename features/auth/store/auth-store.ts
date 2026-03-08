import { create } from "zustand";
import { persist } from "zustand/middleware";

const STORAGE_KEY = "stanny_admin_session";

export type AuthRole = "admin" | "editeur" | "lecteur" | "atelier";

interface AuthState {
  isAuthenticated: boolean;
  username: string | null;
  role: AuthRole | null;
  showPostLoginSplash: boolean;
  showBlockViewerSplash: boolean;
  showMesureSplash: boolean;
  showParametresSplash: boolean;
  showVestesSplash: boolean;
  showChaussuresSplash: boolean;
  showAccessoiresSplash: boolean;
  login: (username: string, role: AuthRole) => void;
  logout: () => void;
  setShowPostLoginSplash: (value: boolean) => void;
  setShowBlockViewerSplash: (value: boolean) => void;
  setShowMesureSplash: (value: boolean) => void;
  setShowParametresSplash: (value: boolean) => void;
  setShowVestesSplash: (value: boolean) => void;
  setShowChaussuresSplash: (value: boolean) => void;
  setShowAccessoiresSplash: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      username: null,
      role: null,
      showPostLoginSplash: false,
      showBlockViewerSplash: false,
      showMesureSplash: false,
      showParametresSplash: false,
      showVestesSplash: false,
      showChaussuresSplash: false,
      showAccessoiresSplash: false,
      login: (username, role) =>
        set({ isAuthenticated: true, username, role }),
      logout: () =>
        set({ isAuthenticated: false, username: null, role: null }),
      setShowPostLoginSplash: (value) => set({ showPostLoginSplash: value }),
      setShowBlockViewerSplash: (value) => set({ showBlockViewerSplash: value }),
      setShowMesureSplash: (value) => set({ showMesureSplash: value }),
      setShowParametresSplash: (value) => set({ showParametresSplash: value }),
      setShowVestesSplash: (value) => set({ showVestesSplash: value }),
      setShowChaussuresSplash: (value) => set({ showChaussuresSplash: value }),
      setShowAccessoiresSplash: (value) => set({ showAccessoiresSplash: value }),
    }),
    {
      name: STORAGE_KEY,
      partialize: (s) => ({
        isAuthenticated: s.isAuthenticated,
        username: s.username,
        role: s.role,
      }),
    }
  )
);
