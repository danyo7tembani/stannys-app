import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";
import type { SectionConfig } from "./types.js";
import { DEFAULT_CONFIG } from "./types.js";

const FILE_NAME = "section-config.json";

function getFilePath(dataDir: string): string {
  return path.join(dataDir, FILE_NAME);
}

async function ensureDataDir(dataDir: string): Promise<void> {
  try {
    await mkdir(dataDir, { recursive: true });
  } catch {
    // ignore
  }
}

export function createSectionConfigStore(dataDir: string) {
  const filePath = getFilePath(dataDir);

  async function readConfig(): Promise<SectionConfig> {
    await ensureDataDir(dataDir);
    try {
      const raw = await readFile(filePath, "utf-8");
      const data = JSON.parse(raw) as Partial<SectionConfig>;
      return {
        murDeStyleSubtitle:
          typeof data.murDeStyleSubtitle === "string" ? data.murDeStyleSubtitle : null,
      };
    } catch {
      return { ...DEFAULT_CONFIG };
    }
  }

  async function writeConfig(config: SectionConfig): Promise<void> {
    await ensureDataDir(dataDir);
    await writeFile(filePath, JSON.stringify(config, null, 2), "utf-8");
  }

  async function getMurDeStyleSubtitle(): Promise<string | null> {
    const config = await readConfig();
    return config.murDeStyleSubtitle;
  }

  async function setMurDeStyleSubtitle(value: string | null): Promise<SectionConfig> {
    const config = await readConfig();
    config.murDeStyleSubtitle = value === "" ? null : value;
    await writeConfig(config);
    return config;
  }

  return { readConfig, writeConfig, getMurDeStyleSubtitle, setMurDeStyleSubtitle };
}
