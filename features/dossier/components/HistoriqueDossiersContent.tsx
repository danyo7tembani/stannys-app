"use client";

import { useEffect, useState, useMemo, useCallback, memo } from "react";
import Link from "next/link";
import { ROUTES } from "@/shared/constants";
import { ConfirmDeleteModal } from "@/shared/ui";
import { useDossiersHistoryStore } from "../store";
import type { DossierEnregistre } from "../store";

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function hasAnnotations(d: DossierEnregistre): boolean {
  const a = d.annotations;
  if (!a) return false;
  const hasOr = Array.isArray(a.or) && a.or.length > 0;
  const hasBleu = Array.isArray(a.bleu) && a.bleu.some((arr) => Array.isArray(arr) && arr.length > 0);
  return hasOr || hasBleu;
}

function formatContactLine(d: DossierEnregistre): string {
  const c1 =
    d.contact1 != null && d.contact1 !== ""
      ? `${d.contact1Prefix ?? ""} ${d.contact1}`.trim()
      : "";
  const c2 =
    (d.contact2 ?? "").trim() !== ""
      ? `${d.contact2Prefix ?? ""} ${d.contact2}`.trim()
      : "";
  if (c1 && c2) return `${c1} · ${c2}`;
  if (c1) return c1;
  return d.contact ?? "";
}

type SortOption = "date-desc" | "date-asc" | "nom-asc" | "nom-desc";

type HistoriqueItemProps = {
  d: DossierEnregistre;
  deletingId: string | null;
  markingId: string | null;
  onRequestRemove: (id: string) => void;
  onMarkDefinitif: (id: string) => void;
};

type AtelierItemProps = {
  d: DossierEnregistre;
  markingAtelierId: string | null;
  onEnCour: (id: string) => void;
  onTermine: (id: string) => void;
};

const HistoriqueDossierItem = memo(function HistoriqueDossierItem({
  d,
  deletingId,
  markingId,
  onRequestRemove,
  onMarkDefinitif,
}: HistoriqueItemProps) {
  return (
    <li className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-luxe-or-muted/30 bg-luxe-noir-soft px-4 py-3">
      <Link href={ROUTES.PARAMETRES_DOSSIER(d.id)} className="min-w-0 flex-1">
        <p className="font-medium text-luxe-blanc hover:text-luxe-or transition-colors">
          {d.prenom} {d.nom}
        </p>
        <p className="text-sm text-luxe-blanc-muted">
          {formatContactLine(d)}
          {d.adresse ? ` · ${d.adresse}` : ""}
        </p>
        <p className="mt-1 text-xs text-luxe-blanc-muted/80">
          Enregistré le {formatDate(d.createdAt)}
          <span className="ml-2">
            {(d.status ?? "brouillon") === "definitif" ? (
              <span className="rounded bg-luxe-or/20 px-1.5 py-0.5 text-xs text-luxe-or">
                Définitif
              </span>
            ) : (
              <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-xs text-amber-400">
                Brouillon
              </span>
            )}
          </span>
        </p>
      </Link>
      <div className="flex flex-wrap items-center gap-2">
        {(d.status ?? "brouillon") === "brouillon" && (
          <button
            type="button"
            disabled={markingId === d.id}
            onClick={(e) => {
              e.preventDefault();
              onMarkDefinitif(d.id);
            }}
            className="rounded border border-green-500/40 px-3 py-1.5 text-xs text-green-400 transition-colors hover:bg-green-500/10 disabled:opacity-50"
          >
            {markingId === d.id ? "…" : "Marquer définitif"}
          </button>
        )}
        <Link
          href={ROUTES.PARAMETRES_DOSSIER(d.id)}
          className="rounded border border-luxe-or-muted/40 px-3 py-1.5 text-xs text-luxe-or transition-colors hover:bg-luxe-or/10"
        >
          Voir le dossier
        </Link>
        <button
          type="button"
          disabled={deletingId === d.id}
          onClick={(e) => {
            e.preventDefault();
            onRequestRemove(d.id);
          }}
          className="rounded border border-red-400/40 px-3 py-1.5 text-xs text-red-400 transition-colors hover:bg-red-400/10 disabled:opacity-50"
        >
          {deletingId === d.id ? "…" : "Supprimer"}
        </button>
      </div>
    </li>
  );
});

const AtelierDossierItem = memo(function AtelierDossierItem({
  d,
  markingAtelierId,
  onEnCour,
  onTermine,
}: AtelierItemProps) {
  const atelierStatut = d.atelierStatut;
  return (
    <li className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-luxe-or-muted/30 bg-luxe-noir-soft px-4 py-3">
      <Link href={ROUTES.PARAMETRES_DOSSIER(d.id)} className="min-w-0 flex-1">
        <p className="font-medium text-luxe-blanc hover:text-luxe-or transition-colors">
          {d.prenom} {d.nom}
        </p>
        <p className="text-sm text-luxe-blanc-muted">
          {formatContactLine(d)}
          {d.adresse ? ` · ${d.adresse}` : ""}
        </p>
        <p className="mt-1 text-xs text-luxe-blanc-muted/80">
          Enregistré le {formatDate(d.createdAt)}
          <span className="ml-2">
            {atelierStatut === "termine" ? (
              <span className="rounded bg-green-500/20 px-1.5 py-0.5 text-xs text-green-400">
                Terminé
              </span>
            ) : atelierStatut === "en_cours" ? (
              <span className="rounded bg-red-500/20 px-1.5 py-0.5 text-xs text-red-400">
                En cours
              </span>
            ) : null}
          </span>
        </p>
      </Link>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={markingAtelierId === d.id}
          onClick={(e) => {
            e.preventDefault();
            onEnCour(d.id);
          }}
          className="rounded border border-red-400/40 px-3 py-1.5 text-xs text-red-400 transition-colors hover:bg-red-400/10 disabled:opacity-50"
        >
          {markingAtelierId === d.id ? "…" : "En cour"}
        </button>
        <Link
          href={ROUTES.PARAMETRES_DOSSIER(d.id)}
          className="rounded border border-luxe-or-muted/40 px-3 py-1.5 text-xs text-luxe-or transition-colors hover:bg-luxe-or/10"
        >
          Voir le dossier
        </Link>
        <button
          type="button"
          disabled={markingAtelierId === d.id}
          onClick={(e) => {
            e.preventDefault();
            onTermine(d.id);
          }}
          className="rounded border border-green-500/40 px-3 py-1.5 text-xs text-green-400 transition-colors hover:bg-green-500/10 disabled:opacity-50"
        >
          {markingAtelierId === d.id ? "…" : "Terminé"}
        </button>
      </div>
    </li>
  );
});

const AdminStatutDossierItem = memo(function AdminStatutDossierItem({ d }: { d: DossierEnregistre }) {
  const atelierStatut = d.atelierStatut;
  return (
    <li className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-luxe-or-muted/30 bg-luxe-noir-soft px-4 py-3">
      <Link href={ROUTES.PARAMETRES_DOSSIER(d.id)} className="min-w-0 flex-1">
        <p className="font-medium text-luxe-blanc hover:text-luxe-or transition-colors">
          {d.prenom} {d.nom}
        </p>
        <p className="text-sm text-luxe-blanc-muted">
          {formatContactLine(d)}
          {d.adresse ? ` · ${d.adresse}` : ""}
        </p>
        <p className="mt-1 text-xs text-luxe-blanc-muted/80">
          Enregistré le {formatDate(d.createdAt)}
          <span className="ml-2">
            {atelierStatut === "termine" ? (
              <span className="rounded bg-green-500/20 px-1.5 py-0.5 text-xs text-green-400">
                Terminé
              </span>
            ) : atelierStatut === "en_cours" ? (
              <span className="rounded bg-red-500/20 px-1.5 py-0.5 text-xs text-red-400">
                En cours
              </span>
            ) : (
              <span className="rounded bg-luxe-blanc-muted/20 px-1.5 py-0.5 text-xs text-luxe-blanc-muted">
                Non commencé
              </span>
            )}
          </span>
        </p>
      </Link>
      <Link
        href={ROUTES.PARAMETRES_DOSSIER(d.id)}
        className="rounded border border-luxe-or-muted/40 px-3 py-1.5 text-xs text-luxe-or transition-colors hover:bg-luxe-or/10"
      >
        Voir le dossier
      </Link>
    </li>
  );
});

export type HistoriqueDossiersMode = "default" | "atelier" | "admin-statut";

export function HistoriqueDossiersContent({ mode = "default" }: { mode?: HistoriqueDossiersMode }) {
  const isAtelier = mode === "atelier";
  const isAdminStatut = mode === "admin-statut";
  const useAtelierFilter = isAtelier || isAdminStatut;
  const dossiers = useDossiersHistoryStore((s) => s.dossiers);
  const loading = useDossiersHistoryStore((s) => s.loading);
  const error = useDossiersHistoryStore((s) => s.error);
  const fetchDossiers = useDossiersHistoryStore((s) => s.fetchDossiers);
  const updateDossierStatus = useDossiersHistoryStore((s) => s.updateDossierStatus);
  const updateDossierAtelierStatut = useDossiersHistoryStore((s) => s.updateDossierAtelierStatut);
  const removeDossier = useDossiersHistoryStore((s) => s.removeDossier);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [markingId, setMarkingId] = useState<string | null>(null);
  const [markingAtelierId, setMarkingAtelierId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatut, setFilterStatut] = useState<"tous" | "brouillon" | "definitif">("tous");
  const [filterAtelierStatut, setFilterAtelierStatut] = useState<"tous" | "en_cours" | "termine">("tous");
  const [filterAvecAnnotations, setFilterAvecAnnotations] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("date-desc");

  useEffect(() => {
    fetchDossiers();
  }, [fetchDossiers]);

  const filteredAndSorted = useMemo(() => {
    let list = [...dossiers];
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter((d) => {
        const dateStr = formatDate(d.createdAt).toLowerCase();
        return (
          (d.nom ?? "").toLowerCase().includes(q) ||
          (d.prenom ?? "").toLowerCase().includes(q) ||
          (d.contact ?? "").toLowerCase().includes(q) ||
          (d.contact1 ?? "").toLowerCase().includes(q) ||
          (d.contact2 ?? "").toLowerCase().includes(q) ||
          (d.mail ?? "").toLowerCase().includes(q) ||
          (d.adresse ?? "").toLowerCase().includes(q) ||
          dateStr.includes(q)
        );
      });
    }
    if (useAtelierFilter) {
      if (filterAtelierStatut !== "tous") {
        list = list.filter((d) => (d.atelierStatut ?? null) === filterAtelierStatut);
      }
    } else {
      if (filterStatut !== "tous") {
        list = list.filter((d) => (d.status ?? "brouillon") === filterStatut);
      }
    }
    if (!useAtelierFilter && filterAvecAnnotations) {
      list = list.filter(hasAnnotations);
    }
    if (sortBy === "date-desc") list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    else if (sortBy === "date-asc") list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    else if (sortBy === "nom-asc") list.sort((a, b) => `${(a.prenom ?? "")} ${a.nom ?? ""}`.localeCompare(`${(b.prenom ?? "")} ${b.nom ?? ""}`));
    else if (sortBy === "nom-desc") list.sort((a, b) => `${(b.prenom ?? "")} ${b.nom ?? ""}`.localeCompare(`${(a.prenom ?? "")} ${a.nom ?? ""}`));
    return list;
  }, [dossiers, searchQuery, filterStatut, filterAtelierStatut, filterAvecAnnotations, sortBy, isAtelier, useAtelierFilter]);

  const handleRemove = useCallback(
    async (id: string) => {
      setDeletingId(id);
      try {
        await removeDossier(id);
        setConfirmDeleteId(null);
      } finally {
        setDeletingId(null);
      }
    },
    [removeDossier]
  );

  const handleConfirmDeleteDossier = useCallback(() => {
    if (confirmDeleteId) handleRemove(confirmDeleteId);
  }, [confirmDeleteId, handleRemove]);

  const handleMarkDefinitif = useCallback(
    async (id: string) => {
      setMarkingId(id);
      try {
        await updateDossierStatus(id, "definitif");
      } finally {
        setMarkingId(null);
      }
    },
    [updateDossierStatus]
  );

  const handleEnCour = useCallback(
    async (id: string) => {
      setMarkingAtelierId(id);
      try {
        await updateDossierAtelierStatut(id, "en_cours");
      } finally {
        setMarkingAtelierId(null);
      }
    },
    [updateDossierAtelierStatut]
  );

  const handleTermine = useCallback(
    async (id: string) => {
      setMarkingAtelierId(id);
      try {
        await updateDossierAtelierStatut(id, "termine");
      } finally {
        setMarkingAtelierId(null);
      }
    },
    [updateDossierAtelierStatut]
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      {isAdminStatut && (
        <div className="mb-6">
          <Link
            href={ROUTES.PARAMETRES}
            className="inline-flex items-center justify-center rounded border border-luxe-or-muted/40 bg-luxe-noir-soft px-4 py-2 text-sm font-medium text-luxe-or transition-colors hover:border-luxe-or/50 hover:bg-white/5"
          >
            Retour
          </Link>
        </div>
      )}
      {!isAtelier && !isAdminStatut && (
        <div className="mb-6">
          <Link
            href={ROUTES.PARAMETRES}
            className="inline-flex items-center justify-center rounded border border-luxe-or-muted/40 bg-luxe-noir-soft px-4 py-2 text-sm font-medium text-luxe-or transition-colors hover:border-luxe-or/50 hover:bg-white/5"
          >
            Retour
          </Link>
        </div>
      )}
      <h1 className="font-serif text-3xl font-semibold text-luxe-blanc">
        {isAdminStatut ? "Dossiers (en cours / terminés)" : isAtelier ? "Dossiers client" : "Historique des dossiers client"}
      </h1>
      <p className="mt-2 text-luxe-blanc-muted">
        {isAdminStatut
          ? "Vue des dossiers par statut atelier (en cours, terminés, non commencés)."
          : isAtelier
            ? "Recherchez et suivez les dossiers. Marquez « En cour » ou « Terminé » selon l'avancement."
            : "Dossiers enregistrés depuis la saisie des mesures (informations personnelles + mesures)."}
      </p>

      {error && (
        <div className="mt-4 rounded-lg border border-red-400/40 bg-red-400/10 px-4 py-2 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="mt-6 space-y-4 rounded-lg border border-luxe-or-muted/30 bg-luxe-noir-soft p-4">
        <label className="block text-sm font-medium text-luxe-blanc">
          Recherche (nom, prénom, contact, mail, adresse, date)
        </label>
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Rechercher…"
          className="w-full rounded border border-luxe-or-muted/40 bg-luxe-noir px-3 py-2 text-sm text-luxe-blanc placeholder:text-luxe-blanc-muted focus:border-luxe-or focus:outline-none"
        />
        <div className="flex flex-wrap items-center gap-4">
          {useAtelierFilter ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-luxe-blanc-muted">Statut :</span>
              <select
                value={filterAtelierStatut}
                onChange={(e) => setFilterAtelierStatut(e.target.value as "tous" | "en_cours" | "termine")}
                className="rounded border border-luxe-or-muted/40 bg-luxe-noir px-2 py-1.5 text-sm text-luxe-blanc"
              >
                <option value="tous">Tous</option>
                <option value="en_cours">En cours</option>
                <option value="termine">Terminés</option>
              </select>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <span className="text-xs text-luxe-blanc-muted">Statut :</span>
                <select
                  value={filterStatut}
                  onChange={(e) => setFilterStatut(e.target.value as "tous" | "brouillon" | "definitif")}
                  className="rounded border border-luxe-or-muted/40 bg-luxe-noir px-2 py-1.5 text-sm text-luxe-blanc"
                >
                  <option value="tous">Tous</option>
                  <option value="brouillon">Brouillon</option>
                  <option value="definitif">Définitif</option>
                </select>
              </div>
              <label className="flex items-center gap-2 text-sm text-luxe-blanc-muted">
                <input
                  type="checkbox"
                  checked={filterAvecAnnotations}
                  onChange={(e) => setFilterAvecAnnotations(e.target.checked)}
                  className="rounded border-luxe-or-muted/40"
                />
                Avec annotations
              </label>
            </>
          )}
          <div className="flex items-center gap-2">
            <span className="text-xs text-luxe-blanc-muted">Tri :</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="rounded border border-luxe-or-muted/40 bg-luxe-noir px-2 py-1.5 text-sm text-luxe-blanc"
            >
              <option value="date-desc">Date (récent → ancien)</option>
              <option value="date-asc">Date (ancien → récent)</option>
              <option value="nom-asc">Nom (A → Z)</option>
              <option value="nom-desc">Nom (Z → A)</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <p className="mt-8 text-luxe-blanc-muted">Chargement…</p>
      ) : filteredAndSorted.length === 0 ? (
        <div className="mt-8 rounded-lg border border-luxe-or-muted/30 bg-luxe-noir-soft p-8 text-center text-luxe-blanc-muted">
          <p className="text-sm">Aucun dossier enregistré pour l’instant.</p>
          <p className="mt-2 text-xs">
            {dossiers.length === 0
              ? "Enregistrez un dossier depuis la page Saisie des mesures."
              : "Modifiez la recherche ou les filtres."}
          </p>
        </div>
      ) : isAdminStatut ? (
        <ul className="mt-8 space-y-4">
          {filteredAndSorted.map((d) => (
            <AdminStatutDossierItem key={d.id} d={d} />
          ))}
        </ul>
      ) : isAtelier ? (
        <ul className="mt-8 space-y-4">
          {filteredAndSorted.map((d) => (
            <AtelierDossierItem
              key={d.id}
              d={d}
              markingAtelierId={markingAtelierId}
              onEnCour={handleEnCour}
              onTermine={handleTermine}
            />
          ))}
        </ul>
      ) : (
        <ul className="mt-8 space-y-4">
          {filteredAndSorted.map((d) => (
            <HistoriqueDossierItem
              key={d.id}
              d={d}
              deletingId={deletingId}
              markingId={markingId}
              onRequestRemove={setConfirmDeleteId}
              onMarkDefinitif={handleMarkDefinitif}
            />
          ))}
        </ul>
      )}

      {!isAtelier && !isAdminStatut && (
        <ConfirmDeleteModal
          open={confirmDeleteId !== null}
          onConfirm={handleConfirmDeleteDossier}
          onCancel={() => setConfirmDeleteId(null)}
          title="Confirmer la suppression"
          message="Voulez-vous vraiment supprimer ce dossier client ?"
          loading={deletingId !== null}
        />
      )}
    </div>
  );
}
