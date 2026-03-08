import path from "path";

function getEnv(key: string, fallback: string): string {
  const value = process.env[key];
  return value !== undefined && value !== "" ? value : fallback;
}

const cwd = process.cwd();

export const config = {
  PORT: parseInt(getEnv("PORT", "4000"), 10),
  DATA_DIR: path.resolve(cwd, getEnv("DATA_DIR", "data")),
  UPLOAD_DIR: path.resolve(cwd, getEnv("UPLOAD_DIR", "uploads")),
  /** URL PostgreSQL (ex. postgresql://user:pass@localhost:5432/stannys). Si vide, le backend utilise les fichiers JSON. */
  DATABASE_URL: getEnv("DATABASE_URL", ""),
  /** Origines CORS autorisées, séparées par des virgules (ex. http://localhost:3000,http://192.168.100.66:3000) */
  FRONTEND_ORIGINS: getEnv("FRONTEND_ORIGIN", "http://localhost:3000")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
} as const;
