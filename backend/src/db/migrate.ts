import pg from "pg";
import { readFileSync, readdirSync } from "fs";
import path from "path";

const MIGRATIONS_DIR = path.resolve(process.cwd(), "migrations");

/**
 * Exécute les migrations SQL dans l'ordre (par nom de fichier).
 * Crée la table _migrations pour suivre les migrations appliquées.
 */
export async function runMigrations(client: pg.PoolClient): Promise<void> {
  await client.query(`
    CREATE TABLE IF NOT EXISTS _migrations (
      name TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);

  const files = readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  for (const file of files) {
    const name = path.basename(file);
    const { rows } = await client.query(
      "SELECT 1 FROM _migrations WHERE name = $1",
      [name]
    );
    if (rows.length > 0) continue;

    const sql = readFileSync(path.join(MIGRATIONS_DIR, file), "utf-8");
    await client.query(sql);
    await client.query("INSERT INTO _migrations (name) VALUES ($1)", [name]);
  }
}
