export const ROLES = ["admin", "editeur", "lecteur", "atelier"] as const;
export type UserRole = (typeof ROLES)[number];

export interface UserRecord {
  role: UserRole;
  /** Mot de passe en clair (à hasher en production). */
  password: string;
}

export interface UsersData {
  admin: { password: string };
  editeur: { password: string };
  lecteur: { password: string };
  atelier: { password: string };
}

export interface UserSummary {
  role: UserRole;
  label: string;
}
