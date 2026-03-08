import pg from "pg";
import { config } from "../config.js";

let pool: pg.Pool | null = null;

/**
 * Retourne le pool PostgreSQL si DATABASE_URL est défini, sinon null.
 */
export function getPool(): pg.Pool | null {
  if (pool) return pool;
  const url = config.DATABASE_URL;
  if (!url || url === "") return null;
  pool = new pg.Pool({ connectionString: url, max: 10 });
  return pool;
}

/**
 * Ferme le pool (à appeler au shutdown).
 */
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
