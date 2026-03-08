/**
 * Feature Auth — Public API.
 */
export { LoginForm, AuthPortal, AuthGuard } from "./components";
export { useAuth, useInactivityLogout } from "./hooks";
export { useAuthStore } from "./store";
export { canEditCatalogue } from "./utils";
export { verifyCredentials } from "./services";
export type { AuthSession, LoginCredentials } from "./types";
