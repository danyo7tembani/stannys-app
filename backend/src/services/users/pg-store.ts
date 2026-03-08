import type { Pool } from "pg";
import bcrypt from "bcrypt";
import type { UserRole } from "./types.js";

const ROLES: UserRole[] = ["admin", "editeur", "lecteur", "atelier"];

function isUserRole(r: string): r is UserRole {
  return ROLES.includes(r as UserRole);
}

/**
 * Store utilisateurs en PostgreSQL.
 * Les mots de passe sont hashés avec bcrypt (si le hash commence par $2b$),
 * sinon comparaison en clair pour migration depuis les anciennes données.
 */
export function createUsersPgStore(pool: Pool) {
  return {
    async verify(role: string, password: string): Promise<boolean> {
      if (!isUserRole(role)) return false;
      const { rows } = await pool.query(
        "SELECT password_hash FROM users WHERE role = $1",
        [role]
      );
      if (rows.length === 0) return false;
      const hash = rows[0].password_hash as string;
      if (hash.startsWith("$2b$") || hash.startsWith("$2a$")) {
        return bcrypt.compare(password, hash);
      }
      return hash === password;
    },

    async setPassword(role: UserRole, password: string): Promise<void> {
      const hash = await bcrypt.hash(password, 10);
      await pool.query("UPDATE users SET password_hash = $1 WHERE role = $2", [
        hash,
        role,
      ]);
    },

    async getRoles(): Promise<UserRole[]> {
      return ROLES;
    },
  };
}
