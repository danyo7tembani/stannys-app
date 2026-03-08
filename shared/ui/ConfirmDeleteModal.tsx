"use client";

import { useEffect } from "react";

export interface ConfirmDeleteModalProps {
  /** Contrôle l'affichage du modal */
  open: boolean;
  /** Appelé quand l'utilisateur confirme la suppression */
  onConfirm: () => void;
  /** Appelé quand l'utilisateur annule */
  onCancel: () => void;
  /** Titre du modal (optionnel) */
  title?: string;
  /** Message de confirmation (défaut : "Voulez-vous vraiment supprimer cet élément ?") */
  message?: string;
  /** Désactiver les boutons pendant une action (ex. requête en cours) */
  loading?: boolean;
}

const DEFAULT_MESSAGE = "Voulez-vous vraiment supprimer cet élément ?";

export function ConfirmDeleteModal({
  open,
  onConfirm,
  onCancel,
  title = "Confirmer la suppression",
  message = DEFAULT_MESSAGE,
  loading = false,
}: ConfirmDeleteModalProps) {
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[110] flex min-h-screen items-center justify-center bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-delete-title"
      aria-describedby="confirm-delete-desc"
    >
      <div
        className="relative w-full max-w-md rounded-lg border border-luxe-or/30 bg-luxe-noir p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          id="confirm-delete-title"
          className="font-serif text-lg font-semibold text-luxe-blanc"
        >
          {title}
        </h2>
        <p
          id="confirm-delete-desc"
          className="mt-3 text-sm text-luxe-blanc-muted"
        >
          {message}
        </p>
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-sm border border-luxe-or-muted/40 bg-transparent px-4 py-2.5 text-sm font-medium text-luxe-blanc transition-colors hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-luxe-or focus:ring-offset-2 focus:ring-offset-luxe-noir disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="rounded-sm border border-red-400/50 bg-red-950/40 px-4 py-2.5 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/20 focus:outline-none focus:ring-2 focus:ring-red-400/50 focus:ring-offset-2 focus:ring-offset-luxe-noir disabled:opacity-50"
          >
            {loading ? "Suppression…" : "Oui"}
          </button>
        </div>
      </div>
    </div>
  );
}
