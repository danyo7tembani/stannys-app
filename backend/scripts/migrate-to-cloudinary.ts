/**
 * Point 3 : Migration des images existantes vers Cloudinary.
 *
 * - Lit les blocs depuis data/mur-de-style-blocs.json
 * - Pour chaque URL /uploads/mur-de-style/xxx, uploade le fichier local vers Cloudinary
 * - Remplace les URLs dans les blocs par les URLs Cloudinary
 * - Sauvegarde le fichier JSON
 *
 * Prérequis : .env avec CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
 * Exécution : depuis le dossier backend : npx tsx scripts/migrate-to-cloudinary.ts
 */

import { config as loadEnv } from "dotenv";
import { readFile, writeFile } from "fs/promises";
import path from "path";
import { existsSync } from "fs";
import { fileURLToPath } from "url";
import { v2 as cloudinary } from "cloudinary";

// Charger .env depuis le dossier backend (parent de scripts/)
const __dirname = path.dirname(fileURLToPath(import.meta.url));
loadEnv({ path: path.join(__dirname, "..", ".env") });

const MUR_DE_STYLE_PREFIX = "/uploads/mur-de-style/";
const CLOUDINARY_FOLDER = "stannys/mur-de-style";

interface BlocMurDeStyle {
  id: string;
  titre: string;
  sousTitre: string;
  imagesSlider: string[];
  imageGaucheUrl: string;
  texteLong: string;
  texteCourt: string;
  slug: string;
  ordre: number;
  createdAt?: string;
  updatedAt?: string;
}

function getEnv(key: string, fallback: string): string {
  const v = process.env[key];
  return v !== undefined && v !== "" ? v : fallback;
}

async function main(): Promise<void> {
  const cwd = process.cwd();
  const dataDir = path.resolve(cwd, getEnv("DATA_DIR", "data"));
  const uploadDir = path.resolve(cwd, getEnv("UPLOAD_DIR", "uploads"));
  const cloudName = getEnv("CLOUDINARY_CLOUD_NAME", "");
  const apiKey = getEnv("CLOUDINARY_API_KEY", "");
  const apiSecret = getEnv("CLOUDINARY_API_SECRET", "");

  if (!cloudName || !apiKey || !apiSecret) {
    console.error(
      "Variables manquantes. Définis CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY et CLOUDINARY_API_SECRET dans .env"
    );
    process.exit(1);
  }

  cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret });

  const blocsPath = path.join(dataDir, "mur-de-style-blocs.json");
  let blocs: BlocMurDeStyle[];
  try {
    const raw = await readFile(blocsPath, "utf-8");
    blocs = JSON.parse(raw) as BlocMurDeStyle[];
    if (!Array.isArray(blocs)) {
      throw new Error("Le fichier ne contient pas un tableau de blocs.");
    }
  } catch (err) {
    console.error("Impossible de lire les blocs:", err);
    process.exit(1);
  }

  const allUploadUrls = new Set<string>();
  for (const bloc of blocs) {
    for (const url of bloc.imagesSlider ?? []) {
      if (url.startsWith(MUR_DE_STYLE_PREFIX)) allUploadUrls.add(url);
    }
    if ((bloc.imageGaucheUrl ?? "").startsWith(MUR_DE_STYLE_PREFIX)) {
      allUploadUrls.add(bloc.imageGaucheUrl!);
    }
  }

  const urlToCloudinary = new Map<string, string>();
  const localDir = path.join(uploadDir, "mur-de-style");

  for (const oldUrl of allUploadUrls) {
    const filename = path.basename(oldUrl);
    const localPath = path.join(localDir, filename);
    if (!existsSync(localPath)) {
      console.warn("Fichier absent, ignoré:", localPath);
      continue;
    }
    try {
      const result = await cloudinary.uploader.upload(localPath, {
        folder: CLOUDINARY_FOLDER,
        use_filename: true,
        unique_filename: true,
      });
      const newUrl = result.secure_url;
      urlToCloudinary.set(oldUrl, newUrl);
      console.log("Uploadé:", filename, "->", newUrl);
    } catch (err) {
      console.error("Erreur upload", filename, err);
    }
  }

  let replaceCount = 0;
  for (const bloc of blocs) {
    if (bloc.imagesSlider) {
      bloc.imagesSlider = bloc.imagesSlider.map((url) => {
        const newUrl = urlToCloudinary.get(url);
        if (newUrl) {
          replaceCount++;
          return newUrl;
        }
        return url;
      });
    }
    if (bloc.imageGaucheUrl && urlToCloudinary.has(bloc.imageGaucheUrl)) {
      bloc.imageGaucheUrl = urlToCloudinary.get(bloc.imageGaucheUrl)!;
      replaceCount++;
    }
  }

  await writeFile(blocsPath, JSON.stringify(blocs, null, 2), "utf-8");
  console.log(
    "\nMigration terminée. Remplacements:",
    replaceCount,
    "URL(s). Fichier sauvegardé:",
    blocsPath
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
