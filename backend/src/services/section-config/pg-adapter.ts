import type { SectionConfig } from "./types.js";

/**
 * Adapte le store config catalogue (section vestes) vers l'interface section-config
 * utilisée par la route mur-de-style (sous-titre global "Mur de style" = vestes).
 */
export function createSectionConfigStoreFromCatalogue(store: {
  getSubtitle: (section: string) => Promise<string | null>;
  setSubtitle: (section: string, value: string | null) => Promise<unknown>;
}) {
  const VESTES = "vestes";
  return {
    async readConfig(): Promise<SectionConfig> {
      const murDeStyleSubtitle = await store.getSubtitle(VESTES);
      return { murDeStyleSubtitle };
    },

    async getMurDeStyleSubtitle(): Promise<string | null> {
      return store.getSubtitle(VESTES);
    },

    async setMurDeStyleSubtitle(value: string | null): Promise<SectionConfig> {
      await store.setSubtitle(VESTES, value === "" ? null : value);
      const murDeStyleSubtitle = await store.getSubtitle(VESTES);
      return { murDeStyleSubtitle };
    },
  };
}
