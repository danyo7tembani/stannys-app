/**
 * Met à jour la base PostgreSQL (production) avec le contenu des fichiers JSON locaux
 * (vestes = mur-de-style, chaussures, accessoires). Remplace chaque section en prod
 * par le contenu du fichier local.
 *
 * Prérequis : DATABASE_URL_PROD (ou DATABASE_URL) dans .env pointe vers la base à mettre à jour
 * (ex. la base Render / stannys-db).
 *
 * Exécution : cd backend && npm run sync:cloudinary-to-pg
 */

import { config as loadEnv } from "dotenv";
import { readFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import pg from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
loadEnv({ path: path.join(__dirname, "..", ".env") });

const SECTIONS: { section: string; file: string }[] = [
  { section: "vestes", file: "mur-de-style-blocs.json" },
  { section: "chaussures", file: "catalogue-chaussures-blocs.json" },
  { section: "accessoires", file: "catalogue-accessoires-blocs.json" },
];

interface BlocCatalogue {
  id: string;
  titre?: string;
  sousTitre?: string;
  imagesSlider: string[];
  imageGaucheUrl: string;
  texteLong?: string;
  texteCourt?: string;
  slug?: string;
  ordre?: number;
  createdAt?: string;
  updatedAt?: string;
}

function getEnv(key: string, fallback: string): string {
  const v = process.env[key];
  return v !== undefined && v !== "" ? v : fallback;
}

function isSupabaseUrl(url: string): boolean {
  return url.toLowerCase().includes("supabase.co");
}

/** Même logique que `src/db/pool.ts` : sslmode dans l'URI force verify-full et casse TLS sur certains postes. */
function connectionStringWithoutSslQueryParams(url: string): string {
  const q = url.indexOf("?");
  if (q === -1) return url;
  const base = url.slice(0, q);
  const query = url.slice(q + 1);
  const parts = query.split("&").filter(
    (p) => !/^sslmode=/i.test(p) && !/^sslrootcert=/i.test(p) && !/^uselibpqcompat=/i.test(p)
  );
  return parts.length > 0 ? `${base}?${parts.join("&")}` : base;
}

async function main(): Promise<void> {
  const dataDir = path.resolve(
    path.dirname(__dirname),
    getEnv("DATA_DIR", "data")
  );
  const databaseUrl = getEnv("DATABASE_URL_PROD", "") || getEnv("DATABASE_URL", "");

  if (!databaseUrl) {
    console.error("DATABASE_URL manquant dans .env");
    process.exit(1);
  }

  const rawUrl = databaseUrl;
  const connectionString = isSupabaseUrl(rawUrl)
    ? connectionStringWithoutSslQueryParams(rawUrl)
    : rawUrl;
  const ssl = isSupabaseUrl(rawUrl)
    ? { rejectUnauthorized: false as const }
    : undefined;

  const pool = new pg.Pool({
    connectionString,
    connectionTimeoutMillis: 15000,
    ...(ssl !== undefined ? { ssl } : {}),
  });

  try {
    for (const { section, file } of SECTIONS) {
      const blocsPath = path.join(dataDir, file);
      let blocs: BlocCatalogue[];
      try {
        const raw = await readFile(blocsPath, "utf-8");
        const data = JSON.parse(raw);
        blocs = Array.isArray(data) ? data : [];
      } catch (err) {
        console.log(`[${section}] Fichier absent ou invalide: ${file}, ignoré.`);
        continue;
      }

      const { rows: dbRows } = await pool.query<{ id: string }>(
        "SELECT id FROM catalogue_blocs WHERE section = $1 ORDER BY ordre ASC, id ASC",
        [section]
      );
      const idsInDb = dbRows.map((r) => r.id);
      const idsInJson = blocs.map((b) => b.id);
      const idsMatch =
        idsInDb.length === idsInJson.length &&
        idsInDb.join(",") === idsInJson.join(",");

      if (idsInDb.length === 0 && blocs.length === 0) {
        console.log(`[${section}] Aucun bloc en base ni dans le JSON. Rien à faire.`);
      } else if (!idsMatch && blocs.length > 0) {
        console.log(
          `[${section}] Remplacement complet par le JSON local (${blocs.length} bloc(s)).`
        );
        await pool.query("DELETE FROM catalogue_blocs WHERE section = $1", [
          section,
        ]);
        const now = new Date().toISOString();
        for (const b of blocs) {
          await pool.query(
            `INSERT INTO catalogue_blocs (id, section, titre, sous_titre, images_slider, image_gauche_url, texte_long, texte_court, slug, ordre, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
            [
              b.id,
              section,
              b.titre ?? "",
              b.sousTitre ?? "",
              JSON.stringify(b.imagesSlider ?? []),
              b.imageGaucheUrl ?? "",
              b.texteLong ?? "",
              b.texteCourt ?? "",
              b.slug ?? "",
              b.ordre ?? 0,
              b.createdAt ?? now,
              b.updatedAt ?? now,
            ]
          );
        }
        console.log(`[${section}] Sync terminée: ${blocs.length} bloc(s) remplacés.`);
      } else if (idsMatch && blocs.length > 0) {
        let updated = 0;
        for (const bloc of blocs) {
          const { rows } = await pool.query(
            `UPDATE catalogue_blocs
             SET images_slider = $1, image_gauche_url = $2, updated_at = $3
             WHERE id = $4 AND section = $5
             RETURNING id`,
            [
              JSON.stringify(bloc.imagesSlider ?? []),
              bloc.imageGaucheUrl ?? "",
              new Date().toISOString(),
              bloc.id,
              section,
            ]
          );
          if (rows.length > 0) updated++;
        }
        console.log(`[${section}] Sync terminée: ${updated} bloc(s) mis à jour.`);
      } else {
        console.log(`[${section}] Aucun bloc dans le JSON. Rien à faire.`);
      }
    }
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
