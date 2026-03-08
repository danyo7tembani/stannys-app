import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";
import type { BlocMurDeStyle } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const FILE_PATH = path.join(DATA_DIR, "mur-de-style-blocs.json");

async function ensureDataDir(): Promise<void> {
  try {
    await mkdir(DATA_DIR, { recursive: true });
  } catch {
    // ignore
  }
}

export async function readBlocs(): Promise<BlocMurDeStyle[]> {
  await ensureDataDir();
  try {
    const raw = await readFile(FILE_PATH, "utf-8");
    const data = JSON.parse(raw) as BlocMurDeStyle[];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function writeBlocs(blocs: BlocMurDeStyle[]): Promise<void> {
  await ensureDataDir();
  await writeFile(FILE_PATH, JSON.stringify(blocs, null, 2), "utf-8");
}

export async function getBlocById(id: string): Promise<BlocMurDeStyle | null> {
  const blocs = await readBlocs();
  return blocs.find((b) => b.id === id) ?? null;
}

export async function updateBloc(
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
