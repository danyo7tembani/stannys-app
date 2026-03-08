"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ROUTES } from "@/shared/constants";
import { useAuthStore } from "@/features/auth/store";
import { useSettingsStore } from "../store";
import type { AppTheme, AppLanguage } from "../store";

function GearIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

export function SettingsMenu() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const role = useAuthStore((s) => s.role);
  const { theme, language, setTheme, setLanguage } = useSettingsStore();
  const isAtelier = role === "atelier";

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [open]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-luxe-or-muted/40 text-luxe-blanc-muted transition-colors hover:border-luxe-or/50 hover:text-luxe-or focus:outline-none focus:ring-2 focus:ring-luxe-or/50"
        aria-label="Ouvrir les paramètres"
        aria-expanded={open}
      >
        <GearIcon className="h-5 w-5" />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-lg border border-luxe-or-muted/30 bg-luxe-noir-soft py-2 shadow-xl">
          <div className="border-b border-luxe-or-muted/20 px-4 py-2">
            <span className="text-sm font-medium text-luxe-or">Paramètres</span>
          </div>

          <Link
            href={isAtelier ? ROUTES.DOSSIERS_ATELIER : ROUTES.PARAMETRES_HISTORIQUE}
            onClick={() => setOpen(false)}
            className="block px-4 py-2.5 text-sm text-luxe-blanc transition-colors hover:bg-white/5"
          >
            {isAtelier ? "Dossiers client" : "Historique des dossiers client"}
          </Link>

          <div className="border-t border-luxe-or-muted/20 px-4 py-2">
            <p className="mb-2 text-xs font-medium text-luxe-blanc-muted">Langue</p>
            <div className="flex gap-2">
              {(["fr", "en"] as AppLanguage[]).map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setLanguage(lang)}
                  className={`rounded px-3 py-1.5 text-sm transition-colors ${
                    language === lang
                      ? "bg-luxe-or/20 text-luxe-or"
                      : "text-luxe-blanc-muted hover:bg-white/5 hover:text-luxe-blanc"
                  }`}
                >
                  {lang === "fr" ? "Français" : "English"}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-luxe-or-muted/20 px-4 py-2">
            <p className="mb-2 text-xs font-medium text-luxe-blanc-muted">Thème</p>
            <div className="flex gap-2">
              {(["dark", "light", "system"] as AppTheme[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTheme(t)}
                  className={`rounded px-3 py-1.5 text-sm transition-colors ${
                    theme === t
                      ? "bg-luxe-or/20 text-luxe-or"
                      : "text-luxe-blanc-muted hover:bg-white/5 hover:text-luxe-blanc"
                  }`}
                >
                  {t === "dark" ? "Sombre" : t === "light" ? "Clair" : "Système"}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
