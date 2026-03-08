import { create } from "zustand";
import { persist } from "zustand/middleware";

export type AppTheme = "dark" | "light" | "system";
export type AppLanguage = "fr" | "en";

interface SettingsState {
  theme: AppTheme;
  language: AppLanguage;
  setTheme: (theme: AppTheme) => void;
  setLanguage: (language: AppLanguage) => void;
}

const STORAGE_KEY = "stanny_app_settings";

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: "dark",
      language: "fr",
      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
    }),
    { name: STORAGE_KEY }
  )
);
