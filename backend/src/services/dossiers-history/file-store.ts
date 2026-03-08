import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";
import type { DossiersHistoryRepository } from "./repository.js";
import type { DossierEnregistre } from "./types.js";

const FILE_NAME = "dossiers-history.json";

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

function generateId(): string {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `dossier-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function createDossiersHistoryFileStore(
  dataDir: string
): DossiersHistoryRepository {
  const filePath = getFilePath(dataDir);

  async function readAll(): Promise<DossierEnregistre[]> {
    await ensureDataDir(dataDir);
    try {
      const raw = await readFile(filePath, "utf-8");
      const data = JSON.parse(raw) as DossierEnregistre[];
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  }

  async function writeAll(dossiers: DossierEnregistre[]): Promise<void> {
    await ensureDataDir(dataDir);
    await writeFile(filePath, JSON.stringify(dossiers, null, 2), "utf-8");
  }

  return {
    async list() {
      return readAll();
    },

    async getById(id: string) {
      const all = await readAll();
      return all.find((d) => d.id === id) ?? null;
    },

    async add(dossier: Omit<DossierEnregistre, "id" | "createdAt">) {
      const all = await readAll();
      const id = generateId();
      const createdAt = new Date().toISOString();
      const contact1 = (dossier.contact1 ?? dossier.contact ?? "").trim();
      const dateDepot = dossier.dateDepot ?? createdAt;
      const saved: DossierEnregistre = {
        ...dossier,
        id,
        createdAt,
        nom: dossier.nom ?? "",
        prenom: dossier.prenom ?? "",
        contact: dossier.contact ?? contact1,
        contact1: contact1 || (dossier.contact ?? ""),
        contact2: dossier.contact2?.trim() || undefined,
        contact1Prefix: dossier.contact1Prefix ?? "+242",
        contact2Prefix: dossier.contact2Prefix ?? "+242",
        mail: dossier.mail?.trim() || undefined,
        dateDepot,
        dateLivraison: dossier.dateLivraison?.trim() || undefined,
        status: dossier.status ?? "brouillon",
      };
      all.unshift(saved);
      await writeAll(all);
      return saved;
    },

    async updateStatus(id: string, status: "brouillon" | "definitif") {
      const all = await readAll();
      const index = all.findIndex((d) => d.id === id);
      if (index === -1) return false;
      all[index] = { ...all[index], status };
      await writeAll(all);
      return true;
    },

    async updateAtelierStatut(id: string, atelierStatut: "en_cours" | "termine") {
      const all = await readAll();
      const index = all.findIndex((d) => d.id === id);
      if (index === -1) return false;
      all[index] = { ...all[index], atelierStatut };
      await writeAll(all);
      return true;
    },

    async remove(id: string) {
      const all = await readAll();
      const index = all.findIndex((d) => d.id === id);
      if (index === -1) return false;
      all.splice(index, 1);
      await writeAll(all);
      return true;
    },
  };
}
