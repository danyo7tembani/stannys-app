"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/shared/constants";
import { useAuthStore } from "@/features/auth/store";
import { useSettingsStore } from "../store";
import type { AppTheme, AppLanguage } from "../store";

export function ParametresPageContent() {
  const router = useRouter();
  const role = useAuthStore((s) => s.role);
  const logout = useAuthStore((s) => s.logout);
  const setShowParametresSplash = useAuthStore((s) => s.setShowParametresSplash);
  const theme = useSettingsStore((s) => s.theme);
  const language = useSettingsStore((s) => s.language);
  const setTheme = useSettingsStore((s) => s.setTheme);
  const setLanguage = useSettingsStore((s) => s.setLanguage);
  const isAdmin = role === "admin";
  const isAtelier = role === "atelier";

  const handleLogout = () => {
    logout();
    router.push(ROUTES.LOGIN);
  };

  const handleRetour = () => {
    setShowParametresSplash(true);
    router.push(ROUTES.HOME);
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <button
          type="button"
          onClick={handleRetour}
          className="inline-flex items-center justify-center rounded border border-luxe-or-muted/40 bg-luxe-noir-soft px-4 py-2 text-sm font-medium text-luxe-or transition-colors hover:border-luxe-or/50 hover:bg-white/5"
        >
          Retour
        </button>
      </div>
      <h1 className="font-serif text-3xl font-semibold text-luxe-blanc">
        Paramètres
      </h1>
      <p className="mt-2 text-luxe-blanc-muted">
        Historique des dossiers, langue et thème de l'application.
      </p>

      {isAdmin && (
        <section className="mt-10">
          <h2 className="font-serif text-xl font-medium text-luxe-or">
            Utilisateurs
          </h2>
          <p className="mt-1 text-sm text-luxe-blanc-muted">
            Créer les comptes et attribuer les rôles (admin, éditeur, lecteur, atelier) et codes. Réservé à l&apos;admin.
          </p>
          <Link
            href={ROUTES.PARAMETRES_UTILISATEURS}
            className="mt-3 inline-block rounded border border-luxe-or-muted/40 bg-luxe-noir-soft px-4 py-2 text-sm text-luxe-blanc transition-colors hover:border-luxe-or/50 hover:bg-white/5"
          >
            Gérer les utilisateurs →
          </Link>
        </section>
      )}

      {isAdmin && (
        <section className="mt-10">
          <h2 className="font-serif text-xl font-medium text-luxe-or">
            Dossiers (en cours / terminés)
          </h2>
          <p className="mt-1 text-sm text-luxe-blanc-muted">
            Consultez les dossiers par statut atelier : en cours, terminés ou non commencés.
          </p>
          <Link
            href={ROUTES.PARAMETRES_DOSSIERS_STATUT}
            className="mt-3 inline-block rounded border border-luxe-or-muted/40 bg-luxe-noir-soft px-4 py-2 text-sm text-luxe-blanc transition-colors hover:border-luxe-or/50 hover:bg-white/5"
          >
            Voir les dossiers par statut →
          </Link>
        </section>
      )}

      {!isAtelier && (
        <section className="mt-10">
          <h2 className="font-serif text-xl font-medium text-luxe-or">
            Historique des dossiers client
          </h2>
          <p className="mt-1 text-sm text-luxe-blanc-muted">
            Consultez et gérez l'historique des dossiers clients.
          </p>
          <Link
            href={ROUTES.PARAMETRES_HISTORIQUE}
            className="mt-3 inline-block rounded border border-luxe-or-muted/40 bg-luxe-noir-soft px-4 py-2 text-sm text-luxe-blanc transition-colors hover:border-luxe-or/50 hover:bg-white/5"
          >
            Ouvrir l'historique →
          </Link>
        </section>
      )}
      {isAtelier && (
        <section className="mt-10">
          <h2 className="font-serif text-xl font-medium text-luxe-or">
            Dossiers client
          </h2>
          <p className="mt-1 text-sm text-luxe-blanc-muted">
            Recherchez et suivez les dossiers. Marquez « En cour » ou « Terminé » selon l'avancement.
          </p>
          <Link
            href={ROUTES.DOSSIERS_ATELIER}
            className="mt-3 inline-block rounded border border-luxe-or-muted/40 bg-luxe-noir-soft px-4 py-2 text-sm text-luxe-blanc transition-colors hover:border-luxe-or/50 hover:bg-white/5"
          >
            Ouvrir les dossiers →
          </Link>
        </section>
      )}

      <section className="mt-10">
        <h2 className="font-serif text-xl font-medium text-luxe-or">
          Langue de l'application
        </h2>
        <p className="mt-1 text-sm text-luxe-blanc-muted">
          Choisissez la langue d'affichage (traduction à venir).
        </p>
        <div className="mt-4 flex gap-2">
          {(["fr", "en"] as AppLanguage[]).map((lang) => (
            <button
              key={lang}
              type="button"
              onClick={() => setLanguage(lang)}
              className={`rounded border px-4 py-2 text-sm font-medium transition-colors ${
                language === lang
                  ? "border-luxe-or bg-luxe-or/20 text-luxe-or"
                  : "border-luxe-or-muted/40 text-luxe-blanc-muted hover:border-luxe-or/50 hover:text-luxe-blanc"
              }`}
            >
              {lang === "fr" ? "Français" : "English"}
            </button>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-serif text-xl font-medium text-luxe-or">
          Thème de l'application
        </h2>
        <p className="mt-1 text-sm text-luxe-blanc-muted">
          Sombre, clair ou selon la préférence du système.
        </p>
        <div className="mt-4 flex gap-2">
          {(["dark", "light", "system"] as AppTheme[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTheme(t)}
              className={`rounded border px-4 py-2 text-sm font-medium transition-colors ${
                theme === t
                  ? "border-luxe-or bg-luxe-or/20 text-luxe-or"
                  : "border-luxe-or-muted/40 text-luxe-blanc-muted hover:border-luxe-or/50 hover:text-luxe-blanc"
              }`}
            >
              {t === "dark" ? "Sombre" : t === "light" ? "Clair" : "Système"}
            </button>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-serif text-xl font-medium text-luxe-or">
          Compte
        </h2>
        <p className="mt-1 text-sm text-luxe-blanc-muted">
          Déconnectez-vous de l&apos;application.
        </p>
        <button
          type="button"
          onClick={handleLogout}
          className="mt-3 inline-block rounded border border-red-400/50 bg-red-950/30 px-4 py-2 text-sm font-medium text-red-400 transition-colors hover:border-red-400/70 hover:bg-red-950/50"
        >
          Déconnexion
        </button>
      </section>
    </div>
  );
}
