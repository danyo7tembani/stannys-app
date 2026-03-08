import type { LoginCredentials } from "../types";

const DEFAULT_USERNAME = "admin";
const DEFAULT_PASSWORD = "admin";

/**
 * Vérifie les identifiants admin (logique pure, sans React).
 * Phase actuelle : identifiants fixés.
 */
export function verifyCredentials({
  username,
  password,
}: LoginCredentials): boolean {
  return (
    username.trim() === DEFAULT_USERNAME && password.trim() === DEFAULT_PASSWORD
  );
}
