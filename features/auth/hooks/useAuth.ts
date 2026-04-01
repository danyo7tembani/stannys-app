"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/shared/constants";
import { apiUrl } from "@/shared/api/client";
import { showErrorToast } from "@/shared/ui";
import { useAuthStore } from "../store";
import type { AuthRole } from "../store/auth-store";
import type { LoginCredentials } from "../types";

export function useAuth() {
  const router = useRouter();
  const {
    login: setSession,
    isAuthenticated,
    username,
    logout,
    setShowPostLoginSplash,
  } = useAuthStore();
  const login = useCallback(
    async (credentials: LoginCredentials) => {
      try {
        const res = await fetch(apiUrl("auth/login"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: credentials.username.trim().toLowerCase(),
            password: credentials.password,
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          showErrorToast(data.error ?? "Identifiants incorrects");
          return false;
        }
        if (!data.role || !["admin", "editeur", "lecteur", "atelier"].includes(data.role)) {
          showErrorToast("Identifiants incorrects");
          return false;
        }
        setSession(credentials.username.trim().toLowerCase(), data.role as AuthRole);
        setShowPostLoginSplash(true);
        router.push(data.role === "atelier" ? ROUTES.DOSSIERS_ATELIER : ROUTES.HOME);
        return true;
      } catch {
        showErrorToast("Erreur de connexion");
        return false;
      }
    },
    [setSession, setShowPostLoginSplash, router]
  );

  const logoutAndRedirect = useCallback(() => {
    logout();
    router.push(ROUTES.LOGIN);
  }, [logout, router]);

  return { login, logout: logoutAndRedirect, isAuthenticated, username };
}
