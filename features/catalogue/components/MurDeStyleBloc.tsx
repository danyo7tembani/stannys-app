"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/shared/constants";
import { useAuthStore } from "@/features/auth/store";
import { getImageUrl } from "@/shared/api/client";
import type { BlocMurDeStyle } from "@/lib/backend/mur-de-style/types";
import type { CatalogueSection } from "@/shared/constants";
import {
  BLOCK_WIDTH,
  BLOCK_HEIGHT,
  getSetWidth,
  getSlideVelocityPxMs,
  clampSlideOffset,
} from "../constants/sliderSection";

const FRAME_BROWN = "#29211A";
const OMBRE_INTérieure_NOIR_PALE = "rgba(0, 0, 0, 0.22)";
const OMBRE_INTérieure =
  `inset 0 8px 24px -6px ${OMBRE_INTérieure_NOIR_PALE}, inset 0 -8px 24px -6px ${OMBRE_INTérieure_NOIR_PALE}, inset -8px 0 24px -6px ${OMBRE_INTérieure_NOIR_PALE}`;
const OMBRE_EXT_OR = "0px 0px 80px rgba(255, 212, 59, 0.06)";
const OMBRE_EXT_ORANGE = "0px 0px 80px rgba(255, 102, 0, 0.06)";
const OMBRE_EXTérieure = `${OMBRE_EXT_OR}, ${OMBRE_EXT_ORANGE}`;
const GOLD_1PX = "rgba(212, 175, 55, 0.55)";
const OMBRE_FINE_CADRE = "0 2px 8px rgba(0,0,0,0.25), 0 1px 2px rgba(0,0,0,0.15)";
const TUNNEL_OVERLAY_COLOR = "#FFFFFF00";
const TUNNEL_OVERLAY_WIDTH = 320;
const BANDE_OR_BORDURE = "#A38B5E";
const BANDE_OR_WIDTH = 48;
const BANDE_NOIRE_HEIGHT = 90;
const BANDE_NOIRE_BG = "#000000";
const BORDURE_OR = "rgba(212, 175, 55, 0.35)";
const OVERLAY_NOIR_OPACITY = "rgba(0, 0, 0, 0.35)";
const TEXTE_VOIR_PLUS_OR = "#D4AF37";
const OMBRE_TUNNEL = "12px 0 120px 45px rgba(0, 0, 0, 0.58)";
const TITRE_COSTUMES_OR = "#D4AF37";

/**
 * Section slider entièrement dynamique et réutilisable.
 * Utilise exclusivement les images reçues via `bloc.imagesSlider` (URLs blob ou serveur).
 * Largeur du ruban et vitesse recalculées selon le nombre d'images pour une boucle infinie fluide.
 * Design : bordure or 1px, ombres fines, zoom organique au survol, défilement fluide.
 * Ne rend rien si aucune image (pas de bloc vide).
 */
export interface MurDeStyleBlocProps {
  section: CatalogueSection;
  bloc: BlocMurDeStyle;
  onEdit?: (bloc: BlocMurDeStyle) => void;
  onDelete?: (bloc: BlocMurDeStyle) => void;
  /** Poignée de réordonnancement (attributs + listeners dnd-kit) à afficher sur la ligne du titre */
  dragHandleProps?: {
    attributes: Record<string, unknown>;
    listeners: Record<string, unknown>;
  };
}

export function MurDeStyleBloc({ section, bloc, onEdit, onDelete, dragHandleProps }: MurDeStyleBlocProps) {
  const router = useRouter();
  const setShowBlockViewerSplash = useAuthStore((s) => s.setShowBlockViewerSplash);
  const sliderImages = bloc.imagesSlider?.length ? bloc.imagesSlider : [];
  if (sliderImages.length === 0) return null;

  const setWidth = getSetWidth(sliderImages.length);
  const slideVelocityPxMs = getSlideVelocityPxMs(sliderImages.length);
  const duplicatedImages = [...sliderImages, ...sliderImages, ...sliderImages];

  const setWidthRef = useRef(setWidth);
  const slideVelocityPxMsRef = useRef(slideVelocityPxMs);
  setWidthRef.current = setWidth;
  slideVelocityPxMsRef.current = slideVelocityPxMs;

  const [isPaused, setIsPaused] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [hoveredSlideIndex, setHoveredSlideIndex] = useState<number | null>(null);
  const lastPointerXRef = useRef(0);
  const lastTimeRef = useRef<number>(0);
  const isPausedRef = useRef(isPaused);
  const isDraggingRef = useRef(isDragging);
  const slideOffsetRef = useRef(0);
  const dragDeltaRef = useRef(0);
  const activePointerIdRef = useRef<number | null>(null);
  const lockAxisRef = useRef<"horizontal" | "vertical" | null>(null);
  const lastPointerYRef = useRef(0);
  const accumulatedDeltaXRef = useRef(0);
  const accumulatedDeltaYRef = useRef(0);
  const ribbonRef = useRef<HTMLDivElement>(null);
  const AXIS_THRESHOLD_PX = 10;
  isPausedRef.current = isPaused;
  isDraggingRef.current = isDragging;

  useEffect(() => {
    const el = ribbonRef.current;
    if (!el) return;
    slideOffsetRef.current = clampSlideOffset(slideOffsetRef.current, setWidthRef.current);
    let rafId: number;
    let hasInitialized = false;
    const tick = (now: number) => {
      const setW = setWidthRef.current;
      const velocity = slideVelocityPxMsRef.current;
      const prevTime = lastTimeRef.current;
      const dt = prevTime > 0 ? Math.min(now - prevTime, 100) : 0;
      lastTimeRef.current = now;
      if (!hasInitialized) {
        hasInitialized = true;
      } else if (isDraggingRef.current) {
        slideOffsetRef.current = clampSlideOffset(slideOffsetRef.current + dragDeltaRef.current, setW);
        dragDeltaRef.current = 0;
      } else if (!isPausedRef.current && dt > 0) {
        slideOffsetRef.current -= velocity * dt;
        if (slideOffsetRef.current <= -setW) slideOffsetRef.current += setW;
      }
      el.style.transform = `translate3d(${slideOffsetRef.current}px, 0, 0)`;
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (activePointerIdRef.current != null) return;
    activePointerIdRef.current = e.pointerId;
    lockAxisRef.current = null;
    lastPointerXRef.current = e.clientX;
    lastPointerYRef.current = e.clientY;
    accumulatedDeltaXRef.current = 0;
    accumulatedDeltaYRef.current = 0;
    dragDeltaRef.current = 0;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (e.pointerId !== activePointerIdRef.current) return;
    const lock = lockAxisRef.current;
    const dx = e.clientX - lastPointerXRef.current;
    const dy = e.clientY - lastPointerYRef.current;
    lastPointerXRef.current = e.clientX;
    lastPointerYRef.current = e.clientY;
    if (lock === null) {
      accumulatedDeltaXRef.current += dx;
      accumulatedDeltaYRef.current += dy;
      const ax = Math.abs(accumulatedDeltaXRef.current);
      const ay = Math.abs(accumulatedDeltaYRef.current);
      if (ax >= AXIS_THRESHOLD_PX || ay >= AXIS_THRESHOLD_PX) {
        if (ax > ay) {
          lockAxisRef.current = "horizontal";
          try {
            (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
          } catch (_) {}
          isDraggingRef.current = true;
          setIsDragging(true);
          dragDeltaRef.current += accumulatedDeltaXRef.current;
        } else {
          lockAxisRef.current = "vertical";
        }
      }
      return;
    }
    if (lock === "horizontal") {
      e.preventDefault();
      dragDeltaRef.current += dx;
    }
  };

  const handlePointerUpOrLeave = (e: React.PointerEvent) => {
    if (e.pointerId !== activePointerIdRef.current) return;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId);
    } catch (_) {}
    activePointerIdRef.current = null;
    lockAxisRef.current = null;
    isDraggingRef.current = false;
    setIsDragging(false);
  };

  const imageGauche = (bloc.imageGaucheUrl ?? "").trim();
  const slug = (bloc.slug ?? "").trim() || "costume-croise-navy";

  return (
    <div className="flex w-full max-w-full flex-col items-center px-3 py-4">
      <div className="w-full overflow-x-auto [@media(orientation:portrait)]:overflow-x-hidden">
        <div className="mx-auto min-w-[1050px] w-[1050px] text-left" style={{ boxShadow: "none" }}>
          <div
            className="mb-6 w-full max-w-[1050px]"
            style={{ boxShadow: "none" }}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              {dragHandleProps && (
                <button
                  type="button"
                  className="flex h-9 min-w-9 shrink-0 touch-manipulation cursor-grab active:cursor-grabbing items-center justify-center rounded border border-luxe-or/40 bg-luxe-noir-soft/50 text-luxe-or hover:bg-luxe-or/10 [touch-action:none]"
                  aria-label="Déplacer ce bloc"
                  {...dragHandleProps.attributes}
                  {...dragHandleProps.listeners}
                >
                  <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor" aria-hidden className="shrink-0">
                    <circle cx="5" cy="5" r="1.5" />
                    <circle cx="11" cy="5" r="1.5" />
                    <circle cx="5" cy="11" r="1.5" />
                    <circle cx="11" cy="11" r="1.5" />
                  </svg>
                </button>
              )}
              <div className="min-w-0 flex-1">
                <h2
                  className="font-serif text-2xl font-semibold"
                  style={{ color: TITRE_COSTUMES_OR, textShadow: "none" }}
                >
                  {bloc.titre || "Costumes"}
                </h2>
              </div>
              {(onEdit || onDelete) && (
                <div className="flex shrink-0 gap-2">
                  {onEdit && (
                    <button
                      type="button"
                      onClick={() => onEdit(bloc)}
                      className="touch-manipulation rounded-sm border border-luxe-or/50 bg-luxe-or/10 px-3 py-1.5 text-sm font-medium text-luxe-or transition-colors hover:bg-luxe-or/20 min-h-[36px]"
                    >
                      Modifier
                    </button>
                  )}
                  {onDelete && (
                    <button
                      type="button"
                      onClick={() => onDelete(bloc)}
                      className="touch-manipulation rounded-sm border border-red-500/50 bg-red-500/10 px-3 py-1.5 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/20 min-h-[36px]"
                    >
                      Supprimer
                    </button>
                  )}
                </div>
              )}
            </div>
        <div
          className="mt-2 w-full"
          style={{
            maxWidth: 1050,
            height: "1px",
            backgroundColor: TITRE_COSTUMES_OR,
            boxShadow: "none",
          }}
          aria-hidden
        />
          </div>
      <div
        className="relative flex shrink-0 overflow-hidden"
        style={{
          width: 1050,
          height: 450,
          border: `1px solid ${BORDURE_OR}`,
        }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => {
          setIsPaused(false);
          setHoveredSlideIndex(null);
        }}
      >
        <div
          className="absolute inset-0 flex items-center justify-start overflow-hidden p-3"
          style={{
            backgroundColor: FRAME_BROWN,
            border: `3px solid ${FRAME_BROWN}`,
            boxShadow: OMBRE_INTérieure,
          }}
        >
          <div
            ref={ribbonRef}
            className="flex shrink-0 gap-[3px] select-none"
            style={{
              willChange: "transform",
              backfaceVisibility: "hidden",
              contain: "layout style paint",
              touchAction: "pan-y",
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUpOrLeave}
            onPointerLeave={handlePointerUpOrLeave}
            onPointerCancel={handlePointerUpOrLeave}
            onContextMenu={(e) => e.preventDefault()}
          >
            {duplicatedImages.map((src, i) => (
              <div
                key={`${bloc.id}-slide-${i}`}
                className="relative flex shrink-0 overflow-hidden rounded-lg p-[3px]"
                style={{
                  width: BLOCK_WIDTH,
                  height: BLOCK_HEIGHT,
                  backgroundColor: FRAME_BROWN,
                  border: `1px solid ${FRAME_BROWN}`,
                }}
                onMouseEnter={() => setHoveredSlideIndex(i)}
                onMouseLeave={() => setHoveredSlideIndex(null)}
              >
                <div
                  className="relative h-full w-full overflow-hidden rounded-md"
                  style={{
                    border: `1px solid ${GOLD_1PX}`,
                    filter:
                      hoveredSlideIndex !== null
                        ? hoveredSlideIndex === i
                          ? "brightness(1.08) saturate(1.02)"
                          : "brightness(0.72) saturate(0.88)"
                        : "none",
                    transform:
                      hoveredSlideIndex === i
                        ? "scale(1.06) translateZ(0)"
                        : "scale(1) translateZ(0)",
                    transition:
                      "filter 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                    backfaceVisibility: "hidden",
                  }}
                >
                  <Image
                    src={getImageUrl(src)}
                    alt={`${bloc.titre} ${(i % sliderImages.length) + 1}`}
                    fill
                    className="object-cover"
                    sizes="280px"
                    unoptimized={src.startsWith("blob:")}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div
          className="pointer-events-none absolute left-0 top-0 z-[9]"
          style={{ width: TUNNEL_OVERLAY_WIDTH, height: "100%", boxShadow: OMBRE_TUNNEL }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute left-0 top-0 z-10"
          style={{
            width: TUNNEL_OVERLAY_WIDTH,
            height: `calc(100% - ${BANDE_NOIRE_HEIGHT}px)`,
            backgroundColor: TUNNEL_OVERLAY_COLOR,
          }}
          aria-hidden
        />
        {/* Conteneur global "Voir plus" : clic → splash + navigation vers la fiche bloc */}
        <button
          type="button"
          onClick={() => {
            setShowBlockViewerSplash(true);
            router.push(ROUTES.CATALOGUE_ITEM(section, slug));
          }}
          className="group/imagePrincipal absolute left-0 top-0 z-[15] flex overflow-hidden cursor-pointer border-0 bg-transparent p-0 text-left"
          style={{
            width: TUNNEL_OVERLAY_WIDTH - BANDE_OR_WIDTH,
            height: `calc(100% - ${BANDE_NOIRE_HEIGHT}px)`,
          }}
          aria-label={`Voir plus : ${bloc.texteCourt || bloc.titre || "fiche"}`}
        >
          {imageGauche ? (
            <div className="relative h-full w-full">
              <Image
                src={getImageUrl(imageGauche)}
                alt=""
                fill
                className="object-cover transition-transform duration-300 ease-out group-hover/imagePrincipal:scale-110"
                sizes="272px"
                unoptimized={imageGauche.startsWith("blob:")}
              />
            </div>
          ) : (
            <div
              className="absolute inset-0"
              style={{ backgroundColor: TUNNEL_OVERLAY_COLOR }}
              aria-hidden
            />
          )}
          <div
            className="pointer-events-none absolute inset-0 transition-opacity duration-300 ease-out group-hover/imagePrincipal:opacity-40"
            style={{ backgroundColor: OVERLAY_NOIR_OPACITY }}
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 ease-out group-hover/imagePrincipal:opacity-100"
            style={{
              background:
                "linear-gradient(to top, rgba(0, 0, 0, 0.92) 0%, rgba(0, 0, 0, 0.85) 18%, rgba(0, 0, 0, 0.4) 40%, rgba(0, 0, 0, 0.08) 65%, transparent 85%)",
            }}
            aria-hidden
          />
          <span
            className="pointer-events-none absolute bottom-0 left-0 pb-4 pl-4 font-serif text-sm tracking-wide opacity-0 transition-all duration-300 ease-out group-hover/imagePrincipal:translate-y-0 group-hover/imagePrincipal:opacity-100 translate-y-2"
            style={{ color: TEXTE_VOIR_PLUS_OR }}
          >
            Voir plus
          </span>
        </button>
        <div
          className="pointer-events-none absolute top-0 z-20"
          style={{
            left: TUNNEL_OVERLAY_WIDTH - BANDE_OR_WIDTH,
            width: BANDE_OR_WIDTH,
            height: `calc(100% - ${BANDE_NOIRE_HEIGHT}px)`,
            backgroundColor: BANDE_OR_BORDURE,
          }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute left-0 z-10 flex flex-col justify-center px-4"
          style={{
            bottom: 0,
            width: TUNNEL_OVERLAY_WIDTH,
            height: BANDE_NOIRE_HEIGHT,
            backgroundColor: BANDE_NOIRE_BG,
          }}
        >
          <span
            className="font-serif text-white leading-tight"
            style={{ fontSize: "1.5rem", fontWeight: 400 }}
          >
            {bloc.texteLong || "Costume croisé Navy"}
          </span>
          <span
            className="font-serif text-white"
            style={{ fontSize: "0.875rem", fontWeight: 400, marginTop: "0.25rem" }}
          >
            {bloc.texteCourt || bloc.titre || "Costume"}
          </span>
        </div>
      </div>
      </div>
      </div>
    </div>
  );
}
