/**
 * Types métier du module Auth (portail admin).
 */
export interface AuthSession {
  isAuthenticated: boolean;
  username?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}
