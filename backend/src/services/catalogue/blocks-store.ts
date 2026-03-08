import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";
import type { BlocMurDeStyle } from "../mur-de-style/types.js";
import type { CatalogueSection } from "./types.js";
import { isCatalogueSection } from "./types.js";

/**
 * Nom de fichier par section. Vestes utilise l'ancien fichier pour compatibilité.
 * En base de données : une table blocks avec colonne section.
 */
function getFileName(section: CatalogueSection): string {
  if (section === "vestes") return "mur-de-style-blocs.json";
  return `catalogue-${section}-blocs.json`;
}

function getFilePath(dataDir: string, section: CatalogueSection): string {
  return path.join(dataDir, getFileName(section));
}

async function ensureDataDir(dataDir: string): Promise<void> {
  try {
    await mkdir(dataDir, { recursive: true });
  } catch {
    // ignore
  }
}

export type CatalogueBlocksStore = {
  readBlocs: () => Promise<BlocMurDeStyle[]>;
  writeBlocs: (blocs: BlocMurDeStyle[]) => Promise<void>;
  getBlocById: (id: string) => Promise<BlocMurDeStyle | null>;
  getBlocBySlug: (slug: string) => Promise<BlocMurDeStyle | null>;
  updateBloc: (
    id: string,
    update: Partial<Omit<BlocMurDeStyle, "id" | "createdAt">>
  ) => Promise<BlocMurDeStyle | null>;
};

export function createCatalogueBlocksStore(
  dataDir: string,
  section: string
): CatalogueBlocksStore | null {
  if (!isCatalogueSection(section)) return null;
  const filePath = getFilePath(dataDir, section);

  async function readBlocs(): Promise<BlocMurDeStyle[]> {
    await ensureDataDir(dataDir);
    try {
      const raw = await readFile(filePath, "utf-8");
      const data = JSON.parse(raw) as BlocMurDeStyle[];
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  }

  async function writeBlocs(blocs: BlocMurDeStyle[]): Promise<void> {
    await ensureDataDir(dataDir);
    await writeFile(filePath, JSON.stringify(blocs, null, 2), "utf-8");
  }

  async function getBlocById(id: string): Promise<BlocMurDeStyle | null> {
    const blocs = await readBlocs();
    return blocs.find((b) => b.id === id) ?? null;
  }

  async function getBlocBySlug(slug: string): Promise<BlocMurDeStyle | null> {
    const blocs = await readBlocs();
    return blocs.find((b) => (b.slug ?? "").trim() === slug.trim()) ?? null;
  }

  async function updateBloc(
    id: string,
    update: Partial<Omit<BlocMurDeStyle, "id" | "createdAt">>
  ): Promise<BlocMurDeStyle | null> {
    const blocs = await readBlocs();
    const index = blocs.findIndex((b) => b.id === id);
    if (index === -1) return null;
    const existing = blocs[index];
    const updated: BlocMurDeStyle = {
      ...existing,
      ...update,
      id: existing.id,
      updatedAt: new Date().toISOString(),
    };
    blocs[index] = updated;
    await writeBlocs(blocs);
    return updated;
  }

  return { readBlocs, writeBlocs, getBlocById, getBlocBySlug, updateBloc };
}
