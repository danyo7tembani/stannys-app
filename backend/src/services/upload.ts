import { writeFile, mkdir } from "fs/promises";
import path from "path";

const MAX_SLIDER_FILES = 50;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB par fichier
const MUR_DE_STYLE_SUBDIR = "mur-de-style";

function safeName(originalName: string): string {
  const ext = path.extname(originalName) || ".jpg";
  const base = path
    .basename(originalName, ext)
    .replace(/[^a-zA-Z0-9-_]/g, "_")
    .slice(0, 40);
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}-${base}${ext}`;
}

export async function handleUpload(
  files: Express.Multer.File[],
  uploadDir: string
): Promise<{ urls: string[] } | { error: string; status: number }> {
  const toProcess = files.filter((f) => f && f.size > 0);
  if (toProcess.length === 0) {
    return { error: "Aucun fichier fourni", status: 400 };
  }
  if (toProcess.length > MAX_SLIDER_FILES) {
    return {
      error: `Maximum ${MAX_SLIDER_FILES} images pour le slide`,
      status: 400,
    };
  }
  const dir = path.join(uploadDir, MUR_DE_STYLE_SUBDIR);
  await mkdir(dir, { recursive: true });
  const urls: string[] = [];
  for (const file of toProcess) {
    if (file.size > MAX_FILE_SIZE) {
      return {
        error: `Fichier trop volumineux: ${file.originalname} (max 10 Mo)`,
        status: 400,
      };
    }
    const name = safeName(file.originalname || "file");
    const filePath = path.join(dir, name);
    await writeFile(filePath, file.buffer);
    urls.push(`/uploads/${MUR_DE_STYLE_SUBDIR}/${name}`);
  }
  return { urls };
}
