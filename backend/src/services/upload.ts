import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { Readable } from "stream";
import { v2 as cloudinary } from "cloudinary";

const MAX_SLIDER_FILES = 50;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB par fichier
const MUR_DE_STYLE_SUBDIR = "mur-de-style";
const CLOUDINARY_FOLDER = "stannys/mur-de-style";

export interface CloudinaryConfig {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
}

function safeName(originalName: string): string {
  const ext = path.extname(originalName) || ".jpg";
  const base = path
    .basename(originalName, ext)
    .replace(/[^a-zA-Z0-9-_]/g, "_")
    .slice(0, 40);
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}-${base}${ext}`;
}

function uploadBufferToCloudinary(
  buffer: Buffer,
  cloudinaryConfig: CloudinaryConfig,
  options: { folder: string }
): Promise<string> {
  return new Promise((resolve, reject) => {
    cloudinary.config({
      cloud_name: cloudinaryConfig.cloudName,
      api_key: cloudinaryConfig.apiKey,
      api_secret: cloudinaryConfig.apiSecret,
    });
    const stream = cloudinary.uploader.upload_stream(
      { folder: options.folder },
      (err, result) => {
        if (err) return reject(err);
        if (!result?.secure_url) return reject(new Error("Pas d'URL retournée par Cloudinary"));
        resolve(result.secure_url);
      }
    );
    Readable.from(buffer).pipe(stream);
  });
}

export async function handleUpload(
  files: Express.Multer.File[],
  uploadDir: string,
  cloudinaryConfig: CloudinaryConfig | null = null
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

  const useCloudinary =
    cloudinaryConfig &&
    cloudinaryConfig.cloudName &&
    cloudinaryConfig.apiKey &&
    cloudinaryConfig.apiSecret;

  const urls: string[] = [];

  if (useCloudinary) {
    for (const file of toProcess) {
      if (file.size > MAX_FILE_SIZE) {
        return {
          error: `Fichier trop volumineux: ${file.originalname} (max 10 Mo)`,
          status: 400,
        };
      }
      try {
        const url = await uploadBufferToCloudinary(file.buffer, cloudinaryConfig, {
          folder: CLOUDINARY_FOLDER,
        });
        urls.push(url);
      } catch (err) {
        console.error("Upload Cloudinary échoué:", err);
        return {
          error: `Échec de l'upload vers Cloudinary: ${file.originalname}`,
          status: 500,
        };
      }
    }
    return { urls };
  }

  const dir = path.join(uploadDir, MUR_DE_STYLE_SUBDIR);
  await mkdir(dir, { recursive: true });
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
