import pg from "pg";
import { config } from "../config.js";

let pool: pg.Pool | null = null;

function isSupabaseUrl(url: string): boolean {
  return url.toLowerCase().includes("supabase.co");
}

/**
 * ?sslmode=require dans l'URI est interprété comme verify-full par pg (Node 22+),
 * ce qui provoque SELF_SIGNED_CERT_IN_CHAIN malgré ssl.rejectUnauthorized: false.
 * On retire sslmode (et sslrootcert) de la query ; le chiffrement reste activé via ssl: {}.
 */
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

/**
 * Retourne le pool PostgreSQL si DATABASE_URL est défini, sinon null.
 */
export function getPool(): pg.Pool | null {
  if (pool) return pool;
  const raw = config.DATABASE_URL;
  if (!raw || raw === "") return null;
  const connectionString = isSupabaseUrl(raw)
    ? connectionStringWithoutSslQueryParams(raw)
    : raw;
  const ssl = isSupabaseUrl(raw)
    ? { rejectUnauthorized: false as const }
    : undefined;
  pool = new pg.Pool({
    connectionString,
    max: 10,
    ...(ssl !== undefined ? { ssl } : {}),
  });
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
