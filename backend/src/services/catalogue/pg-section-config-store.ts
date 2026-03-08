import type { Pool } from "pg";
import { CATALOGUE_SECTIONS, isCatalogueSection } from "./types.js";
import type { CatalogueSectionConfig } from "./section-config-store.js";

export function createCatalogueSectionConfigStorePg(pool: Pool) {
  async function readConfig(): Promise<CatalogueSectionConfig> {
    const { rows } = await pool.query<{ section: string; subtitle: string | null }>(
      "SELECT section, subtitle FROM catalogue_section_config"
    );
    const config = Object.fromEntries(
      CATALOGUE_SECTIONS.map((s) => [s, null as string | null])
    ) as CatalogueSectionConfig;
    for (const r of rows) {
      if (isCatalogueSection(r.section)) config[r.section] = r.subtitle;
    }
    return config;
  }

  return {
    async getSubtitle(section: string): Promise<string | null> {
      if (!isCatalogueSection(section)) return null;
      const { rows } = await pool.query(
        "SELECT subtitle FROM catalogue_section_config WHERE section = $1",
        [section]
      );
      return rows.length > 0 ? rows[0].subtitle : null;
    },

    async setSubtitle(
      section: string,
      value: string | null
    ): Promise<CatalogueSectionConfig> {
      if (!isCatalogueSection(section)) {
        throw new Error(`Invalid section: ${section}`);
      }
      await pool.query(
        "UPDATE catalogue_section_config SET subtitle = $1 WHERE section = $2",
        [value === "" ? null : value, section]
      );
      return readConfig();
    },

    readConfig,
  };
}
