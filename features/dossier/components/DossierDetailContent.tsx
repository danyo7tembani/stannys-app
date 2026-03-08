"use client";

import { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import { ROUTES } from "@/shared/constants";
import { getImageUrl } from "@/shared/api/client";
import { useDossiersHistoryStore } from "../store";
import type { DossierEnregistre } from "../store";
import { fetchDossierById } from "../api/dossiers-history";
import { GROUPES_MESURES } from "../constants/mesures";
import type { AnnotationShape } from "../types";
import { PersonPhotoPlaceholder } from "./PersonPhotoPlaceholder";

type LightboxState =
  | { type: "simple"; src: string; alt: string }
  | { type: "modele"; src: string; alt: string; label: string; shapes: AnnotationShape[] }
  | null;

const CLOUD_OFFSET_X = -0.08;
const CLOUD_OFFSET_Y = -0.15;
const CLOUD_COLORS: Record<string, { bg: string; border: string; balls: string }> = {
  red: { bg: "rgba(239,68,68,0.95)", border: "#f87171", balls: "#ef4444" },
  yellow: { bg: "rgba(251,191,36,0.95)", border: "#fbbf24", balls: "#fbbf24" },
  green: { bg: "rgba(16,185,129,0.95)", border: "#34d399", balls: "#10b981" },
};

function getAnchorAndCloudPos(shape: AnnotationShape) {
  const pts = shape.points;
  if (pts.length === 0) return null;
  const cx = pts.reduce((a, p) => a + p.x, 0) / pts.length;
  const cy = pts.reduce((a, p) => a + p.y, 0) / pts.length;
  const cloudX = Math.max(0.05, Math.min(0.85, cx + CLOUD_OFFSET_X));
  const cloudY = Math.max(0.02, Math.min(0.75, cy + CLOUD_OFFSET_Y));
  return { anchor: { x: cx, y: cy }, cloud: { x: cloudX, y: cloudY } };
}

function getCloudPosition(shape: AnnotationShape): { x: number; y: number } | null {
  if (shape.cloudPosition) return shape.cloudPosition;
  const pos = getAnchorAndCloudPos(shape);
  return pos ? pos.cloud : null;
}

function CloudShapeSvg({
  fillColor,
  borderColor,
  className,
  style,
}: {
  fillColor: string;
  borderColor: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg viewBox="0 0 140 118" className={className} style={style} preserveAspectRatio="none">
      <path
        d="M 70 14 C 44 14 26 30 26 50 C 10 50 6 64 16 74 C 8 82 16 94 36 94 C 36 100 50 106 70 106 C 90 106 104 100 104 94 C 124 94 132 82 124 74 C 134 64 130 50 114 50 C 114 30 96 14 70 14 Z"
        fill={fillColor}
        stroke={borderColor}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle cx="56" cy="104" r="6" fill={fillColor} stroke={borderColor} strokeWidth="1.2" />
      <circle cx="44" cy="110" r="4" fill={fillColor} stroke={borderColor} strokeWidth="1" />
      <circle cx="34" cy="115" r="2.5" fill={fillColor} stroke={borderColor} strokeWidth="0.8" />
    </svg>
  );
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

const COULEUR_LABEL: Record<string, string> = {
  red: "Rouge (Supprimer)",
  yellow: "Jaune (Modifier)",
  green: "Vert (Copier)",
};

function DossierView({ dossier }: { dossier: DossierEnregistre }) {
  const mesures = dossier.mesures ?? {};
  const annotations = dossier.annotations;
  const orShapes = annotations?.or ?? [];
  const bleuShapes = annotations?.bleu ?? [];
  const [lightbox, setLightbox] = useState<LightboxState>(null);

  const openLightbox = useCallback((src: string, alt: string) => {
    setLightbox({
      type: "simple",
      src: getImageUrl(src) || src,
      alt,
    });
  }, []);

  const openLightboxModele = useCallback(
    (src: string, alt: string, label: string, shapes: AnnotationShape[]) => {
      setLightbox({
        type: "modele",
        src: getImageUrl(src) || src,
        alt,
        label,
        shapes: shapes ?? [],
      });
    },
    []
  );

  const closeLightbox = useCallback(() => setLightbox(null), []);

  useEffect(() => {
    if (!lightbox) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [lightbox, closeLightbox]);

  const lightboxPortal =
    typeof document !== "undefined" &&
    lightbox &&
    createPortal(
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4"
        role="dialog"
        aria-modal="true"
        aria-label={lightbox.type === "modele" ? `Image avec annotations — ${lightbox.label}` : "Image en grand"}
        onClick={closeLightbox}
      >
        <button
          type="button"
          onClick={closeLightbox}
          className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
          aria-label="Fermer"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        {lightbox.type === "modele" && (
          <p className="absolute left-4 top-4 z-10 text-sm font-medium text-luxe-or">
            {lightbox.label}
          </p>
        )}
        <div
          className="relative max-h-full max-w-full flex-1 flex items-center justify-center"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative inline-block max-h-[90vh] max-w-full">
            <img
              src={lightbox.src}
              alt={lightbox.alt}
              className="block max-h-[90vh] max-w-full object-contain"
              draggable={false}
              onClick={(e) => e.stopPropagation()}
            />
            {lightbox.type === "modele" &&
              lightbox.shapes.length > 0 && (
                <div className="absolute inset-0 pointer-events-none">
                  <svg
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                    className="absolute inset-0 h-full w-full"
                  >
                    {lightbox.shapes.map((shape, idx) => {
                      const color =
                        shape.color === "red"
                          ? "#ef4444"
                          : shape.color === "yellow"
                            ? "#fbbf24"
                            : "#10b981";
                      if (shape.points.length < 2) return null;
                      const pts = shape.points
                        .map((p) => `${p.x * 100},${p.y * 100}`)
                        .join(" ");
                      return (
                        <polyline
                          key={idx}
                          points={pts}
                          fill="none"
                          stroke={color}
                          strokeWidth="0.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      );
                    })}
                    {lightbox.shapes
                      .filter((s) => s.comment)
                      .map((shape, idx) => {
                        const anchorPos = getAnchorAndCloudPos(shape);
                        const cloudPos = getCloudPosition(shape);
                        if (!anchorPos || !cloudPos) return null;
                        const colors = CLOUD_COLORS[shape.color];
                        if (!colors) return null;
                        return (
                          <g key={`balls-${idx}`}>
                            {[0.2, 0.4, 0.6, 0.8].map((t, i) => {
                              const bx =
                                anchorPos.anchor.x * 100 +
                                t * (cloudPos.x - anchorPos.anchor.x) * 100;
                              const by =
                                anchorPos.anchor.y * 100 +
                                t * (cloudPos.y - anchorPos.anchor.y) * 100;
                              return (
                                <circle
                                  key={i}
                                  cx={bx}
                                  cy={by}
                                  r="2.2"
                                  fill={colors.balls}
                                  opacity="0.95"
                                />
                              );
                            })}
                          </g>
                        );
                      })}
                  </svg>
                  {lightbox.shapes
                    .filter((s) => s.comment)
                    .map((shape, idx) => {
                      const cloudPos = getCloudPosition(shape);
                      if (!cloudPos) return null;
                      const colors = CLOUD_COLORS[shape.color];
                      if (!colors) return null;
                      return (
                        <div
                          key={idx}
                          className="absolute w-[180px] min-h-[80px] pointer-events-none z-10"
                          style={{
                            left: `${cloudPos.x * 100}%`,
                            top: `${cloudPos.y * 100}%`,
                            transform: "translate(-50%, -50%)",
                          }}
                        >
                          <CloudShapeSvg
                            fillColor={colors.bg}
                            borderColor={colors.border}
                            className="absolute inset-0 h-full w-full"
                          />
                          <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-4 py-3">
                            <span className="text-xs font-semibold text-gray-900 line-clamp-4 drop-shadow-sm">
                              {shape.comment}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
          </div>
        </div>
      </div>,
      document.body
    );

  return (
    <div className="dossier-print-area mx-auto max-w-3xl space-y-10 px-4 py-8 sm:px-6">
      <div className="dossier-print-hide mb-6">
        <Link
          href={ROUTES.PARAMETRES_HISTORIQUE}
          className="inline-flex items-center justify-center rounded border border-luxe-or-muted/40 bg-luxe-noir-soft px-4 py-2 text-sm font-medium text-luxe-or transition-colors hover:border-luxe-or/50 hover:bg-white/5"
        >
          Retour
        </Link>
      </div>
      <div className="dossier-print-section">
        <h1 className="font-serif text-2xl font-semibold text-luxe-blanc">
          Dossier client — {dossier.prenom} {dossier.nom}
        </h1>
        <p className="mt-1 text-sm text-luxe-blanc-muted">
          Enregistré le {formatDate(dossier.createdAt)}
        </p>
      </div>

      <section className="dossier-print-section rounded-lg border border-luxe-or-muted/30 bg-luxe-noir-soft p-4">
        <h2 className="font-serif text-lg font-medium text-luxe-or">
          Informations personnelles
        </h2>
        <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-luxe-blanc-muted">Nom</dt>
            <dd className="text-luxe-blanc">{dossier.nom}</dd>
          </div>
          <div>
            <dt className="text-luxe-blanc-muted">Prénom</dt>
            <dd className="text-luxe-blanc">{dossier.prenom}</dd>
          </div>
          {(dossier.dateDepot ?? dossier.createdAt) && (
            <div>
              <dt className="text-luxe-blanc-muted">Date de dépôt</dt>
              <dd className="text-luxe-blanc">
                {formatDate(dossier.dateDepot ?? dossier.createdAt)}
              </dd>
            </div>
          )}
          {dossier.dateLivraison && (
            <div>
              <dt className="text-luxe-blanc-muted">Date de livraison</dt>
              <dd className="text-luxe-blanc">
                {formatDate(dossier.dateLivraison)}
              </dd>
            </div>
          )}
          <div>
            <dt className="text-luxe-blanc-muted">Contact 1</dt>
            <dd className="text-luxe-blanc">
              {dossier.contact1 != null && dossier.contact1 !== ""
                ? `${dossier.contact1Prefix ?? ""} ${dossier.contact1}`.trim()
                : dossier.contact ?? "—"}
            </dd>
          </div>
          {(dossier.contact2 ?? "").trim() && (
            <div>
              <dt className="text-luxe-blanc-muted">Contact 2</dt>
              <dd className="text-luxe-blanc">
                {`${dossier.contact2Prefix ?? ""} ${dossier.contact2}`.trim()}
              </dd>
            </div>
          )}
          {(dossier.mail ?? "").trim() && (
            <div>
              <dt className="text-luxe-blanc-muted">Mail</dt>
              <dd className="text-luxe-blanc">{dossier.mail}</dd>
            </div>
          )}
          {dossier.adresse && (
            <div className="sm:col-span-2">
              <dt className="text-luxe-blanc-muted">Adresse</dt>
              <dd className="text-luxe-blanc">{dossier.adresse}</dd>
            </div>
          )}
        </dl>
      </section>

      <section className="dossier-print-section rounded-lg border border-luxe-or-muted/30 bg-luxe-noir-soft p-4">
        <h2 className="font-serif text-lg font-medium text-luxe-or">
          Photos de référence (informations personnelles)
        </h2>
        <div className="mt-3 flex flex-wrap gap-6">
          <div>
            <p className="mb-1 text-xs text-luxe-blanc-muted">Faciale</p>
            {dossier.photoFaciale ? (
              <button
                type="button"
                onClick={() => openLightbox(dossier.photoFaciale!, "Photo faciale")}
                className="relative block h-32 w-24 overflow-hidden rounded border border-luxe-or-muted/30 cursor-pointer transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-luxe-or/50"
              >
                <Image
                  src={dossier.photoFaciale}
                  alt="Photo faciale"
                  fill
                  className="object-cover"
                  sizes="96px"
                  unoptimized={dossier.photoFaciale.startsWith("blob:")}
                />
              </button>
            ) : (
              <PersonPhotoPlaceholder className="h-32 w-24" />
            )}
          </div>
          <div>
            <p className="mb-1 text-xs text-luxe-blanc-muted">Corps</p>
            {dossier.photoCorps ? (
              <button
                type="button"
                onClick={() => openLightbox(dossier.photoCorps!, "Photo corps")}
                className="relative block h-32 w-24 overflow-hidden rounded border border-luxe-or-muted/30 cursor-pointer transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-luxe-or/50"
              >
                <Image
                  src={dossier.photoCorps}
                  alt="Photo corps"
                  fill
                  className="object-cover"
                  sizes="96px"
                  unoptimized={dossier.photoCorps.startsWith("blob:")}
                />
              </button>
            ) : (
              <PersonPhotoPlaceholder className="h-32 w-24" />
            )}
          </div>
        </div>
      </section>

      <section className="dossier-print-section rounded-lg border border-luxe-or-muted/30 bg-luxe-noir-soft p-4">
        <h2 className="font-serif text-lg font-medium text-luxe-or">
          Saisie des mesures
        </h2>
        <div className="mt-3 space-y-6">
          {GROUPES_MESURES.map((groupe) => (
            <div key={groupe.titre}>
              <h3 className="text-sm font-medium text-luxe-blanc-muted">
                {groupe.titre}
              </h3>
              <dl className="mt-2 grid gap-x-4 gap-y-1 text-sm sm:grid-cols-2">
                {groupe.mesures.map((m) => (
                  <div key={m.id} className="flex justify-between gap-2">
                    <dt className="text-luxe-blanc-muted">{m.label}</dt>
                    <dd className="text-luxe-blanc">
                      {mesures[m.id] != null ? String(mesures[m.id]) : "—"}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </div>
      </section>

      {(dossier.imageBaseOr || (dossier.imagesComparaisonBleu?.length ?? 0) > 0) && (
        <section className="dossier-print-section rounded-lg border border-luxe-or-muted/30 bg-luxe-noir-soft p-4">
          <h2 className="font-serif text-lg font-medium text-luxe-or">
            Choix de modèle
          </h2>
          <div className="mt-3 flex flex-wrap gap-6">
            {dossier.imageBaseOr && (
              <div className="flex flex-col items-center gap-1">
                <button
                  type="button"
                  onClick={() =>
                    openLightboxModele(
                      dossier.imageBaseOr!.imageUrl,
                      dossier.imageBaseOr!.titre ?? "Base (OR)",
                      "OR (base)",
                      orShapes
                    )
                  }
                  className="relative block h-28 w-24 overflow-hidden rounded border-2 border-amber-400/80 cursor-pointer transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                >
                  <Image
                    src={getImageUrl(dossier.imageBaseOr.imageUrl) || dossier.imageBaseOr.imageUrl}
                    alt={dossier.imageBaseOr.titre ?? "Base (OR)"}
                    fill
                    className="object-cover"
                    sizes="96px"
                    unoptimized={dossier.imageBaseOr.imageUrl.startsWith("blob:")}
                  />
                </button>
                <span className="text-xs font-medium text-amber-400">OR (base)</span>
              </div>
            )}
            {(dossier.imagesComparaisonBleu ?? []).map((img, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <button
                  type="button"
                  onClick={() =>
                    openLightboxModele(
                      img.imageUrl,
                      img.titre ?? `BLEU ${i + 1}`,
                      `BLEU ${i + 1}`,
                      bleuShapes[i] ?? []
                    )
                  }
                  className="relative block h-28 w-24 overflow-hidden rounded border-2 border-blue-400/80 cursor-pointer transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                >
                  <Image
                    src={getImageUrl(img.imageUrl) || img.imageUrl}
                    alt={img.titre ?? `BLEU ${i + 1}`}
                    fill
                    className="object-cover"
                    sizes="96px"
                    unoptimized={img.imageUrl.startsWith("blob:")}
                  />
                </button>
                <span className="text-xs font-medium text-blue-400">BLEU {i + 1}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {((dossier.imagesChaussures?.length ?? 0) > 0) && (
        <section className="dossier-print-section rounded-lg border border-luxe-or-muted/30 bg-luxe-noir-soft p-4">
          <h2 className="font-serif text-lg font-medium text-luxe-or">
            Choix de chaussures
          </h2>
          <div className="mt-3 flex flex-wrap gap-4">
            {(dossier.imagesChaussures ?? []).map((img, i) => (
              <button
                key={i}
                type="button"
                onClick={() => openLightbox(img.imageUrl, img.titre ?? `Chaussure ${i + 1}`)}
                className="relative block h-28 w-24 overflow-hidden rounded border border-luxe-or-muted/40 cursor-pointer transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-luxe-or/50"
              >
                <Image
                  src={getImageUrl(img.imageUrl) || img.imageUrl}
                  alt={img.titre ?? `Chaussure ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="96px"
                  unoptimized={img.imageUrl.startsWith("blob:")}
                />
              </button>
            ))}
          </div>
        </section>
      )}

      {((dossier.imagesAccessoires?.length ?? 0) > 0) && (
        <section className="dossier-print-section rounded-lg border border-luxe-or-muted/30 bg-luxe-noir-soft p-4">
          <h2 className="font-serif text-lg font-medium text-luxe-or">
            Choix d&apos;accessoires
          </h2>
          <div className="mt-3 flex flex-wrap gap-4">
            {(dossier.imagesAccessoires ?? []).map((img, i) => (
              <button
                key={i}
                type="button"
                onClick={() => openLightbox(img.imageUrl, img.titre ?? `Accessoire ${i + 1}`)}
                className="relative block h-28 w-24 overflow-hidden rounded border border-luxe-or-muted/40 cursor-pointer transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-luxe-or/50"
              >
                <Image
                  src={getImageUrl(img.imageUrl) || img.imageUrl}
                  alt={img.titre ?? `Accessoire ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="96px"
                  unoptimized={img.imageUrl.startsWith("blob:")}
                />
              </button>
            ))}
          </div>
        </section>
      )}

      {(orShapes.length > 0 || bleuShapes.some((arr) => (arr?.length ?? 0) > 0)) && (
        <section className="dossier-print-section rounded-lg border border-luxe-or-muted/30 bg-luxe-noir-soft p-4">
          <h2 className="font-serif text-lg font-medium text-luxe-or">
            Annotations (Design Studio)
          </h2>
          <div className="mt-3 space-y-4 text-sm">
            {orShapes.length > 0 && (
              <div>
                <h3 className="font-medium text-luxe-blanc-muted">Image OR (base)</h3>
                <ul className="mt-2 space-y-1">
                  {orShapes.map((s, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="shrink-0 font-medium text-luxe-blanc-muted">
                        {COULEUR_LABEL[s.color] ?? s.color}:
                      </span>
                      <span className="text-luxe-blanc">{s.comment || "—"}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {bleuShapes.map((arr, imgIndex) => {
              const list = arr ?? [];
              if (list.length === 0) return null;
              return (
                <div key={imgIndex}>
                  <h3 className="font-medium text-luxe-blanc-muted">
                    Image BLEU {imgIndex + 1}
                  </h3>
                  <ul className="mt-2 space-y-1">
                    {list.map((s, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="shrink-0 font-medium text-luxe-blanc-muted">
                          {COULEUR_LABEL[s.color] ?? s.color}:
                        </span>
                        <span className="text-luxe-blanc">{s.comment || "—"}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <div className="dossier-print-hide flex flex-wrap items-center gap-4 border-t border-luxe-or-muted/20 pt-6">
        <button
          type="button"
          onClick={() => window.print()}
          className="rounded border border-luxe-or-muted/40 px-3 py-1.5 text-sm text-luxe-or transition-colors hover:bg-luxe-or/10"
        >
          Imprimer / Export PDF
        </button>
      </div>

      {lightboxPortal}
    </div>
  );
}

export function DossierDetailContent({ id }: { id: string }) {
  const fromStore = useDossiersHistoryStore((s) =>
    s.dossiers.find((d) => d.id === id)
  );
  const [fetched, setFetched] = useState<DossierEnregistre | null | undefined>(undefined);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (fromStore) {
      setFetched(undefined);
      setLoadError(null);
      return;
    }
    let cancelled = false;
    setLoadError(null);
    fetchDossierById(id)
      .then((d) => {
        if (!cancelled) setFetched(d ?? null);
      })
      .catch((e) => {
        if (!cancelled) setLoadError(e instanceof Error ? e.message : "Erreur de chargement");
      });
    return () => {
      cancelled = true;
    };
  }, [id, fromStore]);

  const dossier = fromStore ?? (fetched === undefined ? null : fetched);

  if (dossier) return <DossierView dossier={dossier} />;

  if (loadError) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <p className="text-red-400">{loadError}</p>
        <div className="mt-6">
          <Link href={ROUTES.PARAMETRES_HISTORIQUE} className="text-sm text-luxe-or hover:underline">
            ← Retour à l&apos;historique
          </Link>
        </div>
      </div>
    );
  }

  if (fetched === null) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <p className="text-luxe-blanc-muted">Dossier introuvable.</p>
        <div className="mt-6">
          <Link href={ROUTES.PARAMETRES_HISTORIQUE} className="text-sm text-luxe-or hover:underline">
            ← Retour à l&apos;historique
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <p className="text-luxe-blanc-muted">Chargement…</p>
      <div className="mt-6">
        <Link href={ROUTES.PARAMETRES_HISTORIQUE} className="text-sm text-luxe-or hover:underline">
          ← Retour à l&apos;historique
        </Link>
      </div>
    </div>
  );
}

function __removed() {
  return null;
  /*
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <p className="text-luxe-blanc-muted">
          Dossier introuvable.
        </p>
        <Link
          href={ROUTES.PARAMETRES_HISTORIQUE}
          className="mt-4 inline-block text-sm text-luxe-or hover:underline"
        >
          ← Retour à l’historique
        </Link>
      </div>
    );
  }
*/
}
