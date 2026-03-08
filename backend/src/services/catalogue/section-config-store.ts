import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";
import type { CatalogueSection } from "./types.js";
import { CATALOGUE_SECTIONS, isCatalogueSection } from "./types.js";

const CATALOGUE_CONFIG_FILE = "catalogue-section-config.json";
const LEGACY_CONFIG_FILE = "section-config.json";

export type CatalogueSectionConfig = Record<CatalogueSection, string | null>;

function getDefaultConfig(): CatalogueSectionConfig {
  return Object.fromEntries(CATALOGUE_SECTIONS.map((s) => [s, null])) as CatalogueSectionConfig;
}

function getFilePath(dataDir: string, filename: string): string {
  return path.join(dataDir, filename);
}

async function ensureDataDir(dataDir: string): Promise<void> {
  try {
    await mkdir(dataDir, { recursive: true });
  } catch {
    // ignore
  }
}

/**
 * Store de la config par section (sous-titre global par onglet).
 * Pour Vestes : migration depuis l'ancien section-config.json si le nouveau fichier n'a pas vestes.
 */
export function createCatalogueSectionConfigStore(dataDir: string) {
  const filePath = getFilePath(dataDir, CATALOGUE_CONFIG_FILE);
  const legacyPath = getFilePath(dataDir, LEGACY_CONFIG_FILE);

  async function readConfig(): Promise<CatalogueSectionConfig> {
    await ensureDataDir(dataDir);
    const config = getDefaultConfig();
    try {
      const raw = await readFile(filePath, "utf-8");
      const data = JSON.parse(raw) as Partial<CatalogueSectionConfig>;
      for (const section of CATALOGUE_SECTIONS) {
        if (typeof data[section] === "string") config[section] = data[section];
      }
    } catch {
      // Fichier absent ou invalide
    }
    // Migration Vestes depuis l'ancien section-config
    if (config.vestes == null) {
      try {
        const legacyRaw = await readFile(legacyPath, "utf-8");
        const legacy = JSON.parse(legacyRaw) as { murDeStyleSubtitle?: string | null };
        if (typeof legacy.murDeStyleSubtitle === "string") {
          config.vestes = legacy.murDeStyleSubtitle;
        }
      } catch {
        // pas d'ancien fichier
      }
    }
    return config;
  }

  async function writeConfig(config: CatalogueSectionConfig): Promise<void> {
    await ensureDataDir(dataDir);
    await writeFile(filePath, JSON.stringify(config, null, 2), "utf-8");
  }

  async function getSubtitle(section: string): Promise<string | null> {
    if (!isCatalogueSection(section)) return null;
    const config = await readConfig();
    return config[section];
  }

  async function setSubtitle(section: string, value: string | null): Promise<CatalogueSectionConfig> {
    if (!isCatalogueSection(section)) {
      throw new Error(`Invalid section: ${section}`);
    }
    const config = await readConfig();
    config[section] = value === "" ? null : value;
    await writeConfig(config);
    return config;
  }

  return { readConfig, writeConfig, getSubtitle, setSubtitle };
}
