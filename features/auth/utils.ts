import type { AuthRole } from "../store/auth-store";

/**
 * Retourne true si le rôle peut modifier le catalogue (blocs, sous-titres, réordonnancement).
 * admin et editeur : oui. lecteur : non (lecture seule catalogue).
 */
export function canEditCatalogue(role: AuthRole | null): boolean {
  return role === "admin" || role === "editeur";
}
