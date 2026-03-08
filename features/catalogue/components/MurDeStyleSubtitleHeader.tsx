"use client";

import { useState, useRef, useEffect } from "react";
import { apiUrl } from "@/shared/api/client";
import { ConfirmDeleteModal } from "@/shared/ui";
import { useAuthStore } from "@/features/auth/store";
import { canEditCatalogue } from "@/features/auth";
import type { CatalogueSection } from "@/shared/constants";

const SOUS_TITRE_GRIS = "rgba(255, 255, 255, 0.65)";
const DEFAULT_PLACEHOLDER = "Aucun sous-titre défini.";

export interface MurDeStyleSubtitleHeaderProps {
  /** Section catalogue (vestes, chaussures, accessoires) */
  section: CatalogueSection;
  /** Sous-titre actuel (null = vide) */
  subtitle: string | null;
  /** Appelé après mise à jour (modifier / supprimer / ajouter) */
  onUpdated: () => void;
}

export function MurDeStyleSubtitleHeader({ section, subtitle, onUpdated }: MurDeStyleSubtitleHeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(subtitle ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setEditValue(subtitle ?? "");
  }, [subtitle]);

  useEffect(() => {
    if (!dropdownOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  const handleSave = async () => {
    setError(null);
    setSaving(true);
    try {
      const res = await fetch(apiUrl(`catalogue/${section}/config`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subtitle: (editValue ?? "").trim() || null,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Erreur lors de l’enregistrement");
      }
      onUpdated();
      setEditing(false);
      setDropdownOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setError(null);
    setDropdownOpen(false);
    setSaving(true);
    try {
      const res = await fetch(apiUrl(`catalogue/${section}/config`), { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Erreur lors de la suppression");
      }
      onUpdated();
      setEditValue("");
      setShowConfirmDelete(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setSaving(false);
    }
  };

  const hasSubtitle = Boolean((subtitle ?? "").trim());
  const showModifier = hasSubtitle;
  const showSupprimer = hasSubtitle;
  const showAjouter = !hasSubtitle;
  const role = useAuthStore((s) => s.role);
  const canEdit = canEditCatalogue(role);

  return (
    <div className="mb-4 w-full max-w-2xl px-3">
      <div className="flex flex-wrap items-center gap-2">
        {editing ? (
          <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center">
            <input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              placeholder="Sous-titre de la section"
              className="min-w-0 flex-1 rounded border border-luxe-or/40 bg-luxe-noir-soft/50 px-3 py-2 text-sm text-luxe-blanc placeholder:text-luxe-blanc-muted focus:border-luxe-or focus:outline-none"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="rounded border border-luxe-or/50 bg-luxe-or/20 px-3 py-1.5 text-sm font-medium text-luxe-or transition-colors hover:bg-luxe-or/30 disabled:opacity-50"
              >
                {saving ? "Enregistrement…" : "Enregistrer"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  setEditValue(subtitle ?? "");
                  setError(null);
                }}
                disabled={saving}
                className="rounded border border-luxe-blanc-muted/40 px-3 py-1.5 text-sm text-luxe-blanc-muted hover:bg-white/10 disabled:opacity-50"
              >
                Annuler
              </button>
            </div>
          </div>
        ) : (
          <>
            <p
              className="min-w-0 flex-1 text-sm font-normal"
              style={{
                color: SOUS_TITRE_GRIS,
                fontFamily: "system-ui, sans-serif",
              }}
            >
              {hasSubtitle ? subtitle : DEFAULT_PLACEHOLDER}
            </p>
            {canEdit && (
            <div className="relative shrink-0" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen((o) => !o)}
                className="flex h-9 min-w-9 items-center justify-center rounded border border-luxe-or/40 bg-luxe-noir-soft/50 text-luxe-or hover:bg-luxe-or/10"
                aria-label="Actions sous-titre"
                aria-expanded={dropdownOpen}
                aria-haspopup="true"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                  className={`shrink-0 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
                >
                  <path d="M4 6l4 4 4-4" />
                </svg>
              </button>
              {dropdownOpen && (
                <div
                  className="absolute right-0 top-full z-10 mt-1 min-w-[10rem] rounded border border-luxe-or/30 bg-luxe-noir py-1 shadow-xl"
                  role="menu"
                >
                  {showAjouter && (
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setDropdownOpen(false);
                        setEditing(true);
                      }}
                      className="w-full px-3 py-2 text-left text-sm text-luxe-blanc hover:bg-luxe-or/10"
                    >
                      Ajouter
                    </button>
                  )}
                  {showModifier && (
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setDropdownOpen(false);
                        setEditing(true);
                      }}
                      className="w-full px-3 py-2 text-left text-sm text-luxe-blanc hover:bg-luxe-or/10"
                    >
                      Modifier
                    </button>
                  )}
                  {showSupprimer && (
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setDropdownOpen(false);
                        setShowConfirmDelete(true);
                      }}
                      className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-red-500/10"
                    >
                      Supprimer
                    </button>
                  )}
                </div>
              )}
            </div>
            )}
          </>
        )}
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-400" role="alert">
          {error}
        </p>
      )}

      <ConfirmDeleteModal
        open={showConfirmDelete}
        onConfirm={handleDelete}
        onCancel={() => setShowConfirmDelete(false)}
        title="Confirmer la suppression"
        message="Voulez-vous vraiment supprimer le sous-titre ?"
        loading={saving}
      />
    </div>
  );
}
