"use client";

import { useState, useRef, memo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ROUTES, isCatalogueSection } from "@/shared/constants";
import { getImageUrl } from "@/shared/api/client";
import { useDossierStore } from "@/features/dossier/store";
import { useViewerZoom, useViewerGridScale, useMediaQuery } from "../hooks";
import {
  getPlaceholderUrlForImage,
  resolveImageUrl,
} from "../utils";
import type { Vetement } from "../types";
import type { BlocMurDeStyle } from "@/lib/backend/mur-de-style/types";

const THUMB_W_PX = 260;
const GAP_PX = 20;
const THUMB_H_PX = Math.round(THUMB_W_PX * (4 / 3)); // aspect 3/4
const MAIN_W_PX = 3 * THUMB_W_PX + 2 * GAP_PX;
const MAIN_H_PX = 2 * THUMB_H_PX + GAP_PX;

export interface ViewerHDProps {
  vetement?: Vetement | null;
  bloc?: BlocMurDeStyle | null;
  /** Section catalogue (vestes, chaussures, accessoires) pour le mode sélection Choix de modèle */
  section?: string;
}

const ThumbButton = memo(function ThumbButton({
  img,
  vetementId,
  isActive,
  onClick,
  className = "",
  width = THUMB_W_PX,
  height = THUMB_H_PX,
  flexible = false,
  disableActiveHighlight = false,
}: {
  img: { id: string; url: string };
  vetementId: string;
  isActive: boolean;
  onClick: () => void;
  className?: string;
  width?: number;
  height?: number;
  flexible?: boolean;
  disableActiveHighlight?: boolean;
}) {
  const thumbSrc = resolveImageUrl(
    img.url,
    getPlaceholderUrlForImage(img, vetementId)
  );
  return (
    <button
      type="button"
      onClick={onClick}
      className={`viewer-thumb relative block overflow-hidden rounded border touch-manipulation ${className} ${
        isActive
          ? "border-luxe-or ring-1 ring-luxe-or/50"
          : `border-luxe-or-muted/30${disableActiveHighlight ? "" : " active:border-luxe-or/50"}`
      }`}
      style={
        flexible
          ? { minWidth: 72, minHeight: 96 }
          : { width, height, minWidth: 72, minHeight: 96 }
      }
    >
      <Image
        src={thumbSrc}
        alt=""
        fill
        className="object-cover"
        sizes={flexible ? "33vw" : `${width}px`}
        unoptimized={thumbSrc.startsWith("https://picsum")}
      />
    </button>
  );
});

/** Vignette pour mode bloc : URL seule (image principale + images similaires). */
const ThumbButtonUrl = memo(function ThumbButtonUrl({
  url,
  isActive,
  onClick,
  className = "",
  flexible = false,
  disableActiveHighlight = false,
}: {
  url: string;
  isActive: boolean;
  onClick: () => void;
  className?: string;
  flexible?: boolean;
  disableActiveHighlight?: boolean;
}) {
  const thumbSrc = getImageUrl(url) || url;
  return (
    <button
      type="button"
      onClick={onClick}
      className={`viewer-thumb relative block overflow-hidden rounded border touch-manipulation ${flexible ? "w-full h-full aspect-[3/4] min-h-[96px]" : ""} ${className} ${
        isActive
          ? "border-luxe-or ring-1 ring-luxe-or/50"
          : `border-luxe-or-muted/30${disableActiveHighlight ? "" : " active:border-luxe-or/50"}`
      }`}
      style={
        flexible
          ? { minWidth: 72, minHeight: 96 }
          : { width: THUMB_W_PX, height: THUMB_H_PX, minWidth: 72, minHeight: 96 }
      }
    >
      <Image
        src={thumbSrc}
        alt=""
        fill
        className="object-cover"
        sizes={flexible ? "33vw" : `${THUMB_W_PX}px`}
        unoptimized={thumbSrc.startsWith("blob:")}
      />
    </button>
  );
});

const MAX_BLEU = 3;
const MAX_CHAUSSURES = 3;
const MAX_ACCESSOIRES = 15;

export function ViewerHD({ vetement = null, bloc = null, section }: ViewerHDProps) {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);
  const { zoom, zoomIn, zoomOut } = useViewerZoom(1);
  const gridContainerRef = useRef<HTMLDivElement>(null);
  const { scale, isStacked } = useViewerGridScale(gridContainerRef);
  const isMd = useMediaQuery("(min-width: 768px)");
  const isTouchDevice = useMediaQuery("(pointer: coarse)");
  const catalogueBackHref =
    section && isCatalogueSection(section)
      ? ROUTES.CATALOGUE_SECTION(section)
      : ROUTES.CATALOGUE;

  const {
    selectionMode,
    setSelectionMode,
    selectionFor,
    setSelectionFor,
    selectedOr,
    selectedBleu,
    selectImageAsOr,
    addSelectedBleu,
    removeLastSelection,
    validateSelection,
    selectedChaussures,
    addChaussure,
    removeLastChaussure,
    validateChaussures,
    selectedAccessoires,
    addAccessoire,
    removeLastAccessoire,
    validateAccessoires,
  } = useDossierStore();

  const isBlocMode = Boolean(bloc);
  const isSelectionModeVestes =
    selectionMode && section === "vestes" && isBlocMode && Boolean(bloc);
  const isSelectionModeChaussures =
    selectionFor === "chaussures" && section === "chaussures" && isBlocMode && Boolean(bloc);
  const isSelectionModeAccessoires =
    selectionFor === "accessoires" && section === "accessoires" && isBlocMode && Boolean(bloc);
  const isAnySelectionMode =
    isSelectionModeVestes || isSelectionModeChaussures || isSelectionModeAccessoires;
  const displayUrls = isBlocMode && bloc
    ? [bloc.imageGaucheUrl ?? "", ...(bloc.imagesSlider ?? [])].filter(Boolean)
    : [];
  const images = vetement?.images ?? [];
  const displayIndex =
    isBlocMode
      ? (displayUrls.length > 0 ? activeIndex % displayUrls.length : 0)
      : (images.length > 0 ? activeIndex % images.length : 0);
  const activeImage = isBlocMode ? null : images[displayIndex];
  const src = isBlocMode
    ? (displayUrls[displayIndex] ? getImageUrl(displayUrls[displayIndex]) || displayUrls[displayIndex] : "")
    : resolveImageUrl(
        activeImage?.url,
        getPlaceholderUrlForImage(activeImage, vetement?.id ?? "")
      );
  const getImage = (slotIndex: number) =>
    images[slotIndex % Math.max(1, images.length)];
  const imageIndexForSlot = (slotIndex: number) =>
    slotIndex % Math.max(1, images.length);

  const title = isBlocMode && bloc ? (bloc.titre || "Fiche") : (vetement?.nom ?? "");
  const description = isBlocMode && bloc ? (bloc.texteLong ?? "") : (vetement?.description ?? "");
  const mainImageAlt = isBlocMode ? title : (activeImage?.label ?? vetement?.nom ?? "");

  const buildBlocItem = (index: number) =>
    bloc && displayUrls[index]
      ? {
          blockId: bloc.id,
          slug: bloc.slug ?? "",
          imageUrl: displayUrls[index],
          titre: bloc.titre,
        }
      : null;

  const handleSelectImage = (index: number) => {
    if (!isSelectionModeVestes || !bloc || !displayUrls[index]) return;
    const item = buildBlocItem(index)!;
    if (!selectedOr) {
      selectImageAsOr(item);
    } else if (selectedBleu.length < MAX_BLEU) {
      addSelectedBleu(item);
    }
  };

  const handleSelectImageChaussures = (index: number) => {
    if (!isSelectionModeChaussures || selectedChaussures.length >= MAX_CHAUSSURES) return;
    const item = buildBlocItem(index);
    if (item) addChaussure(item);
  };

  const handleSelectImageAccessoires = (index: number) => {
    if (!isSelectionModeAccessoires || selectedAccessoires.length >= MAX_ACCESSOIRES) return;
    const item = buildBlocItem(index);
    if (item) addAccessoire(item);
  };

  const handleValidateSelection = () => {
    validateSelection();
    router.push(ROUTES.MESURES);
  };

  const handleValidateChaussures = () => {
    validateChaussures();
    router.push(ROUTES.MESURES);
  };

  const handleValidateAccessoires = () => {
    validateAccessoires();
    router.push(ROUTES.MESURES);
  };

  const handleThumbClick = (index: number) => {
    if (isSelectionModeVestes) handleSelectImage(index);
    else if (isSelectionModeChaussures) handleSelectImageChaussures(index);
    else if (isSelectionModeAccessoires) handleSelectImageAccessoires(index);
    else setActiveIndex(index);
  };

  const getGridContent = () => (
    <div
      className="grid w-max ml-8"
      style={{
        gridTemplateColumns: `${THUMB_W_PX}px ${GAP_PX}px ${THUMB_W_PX}px ${GAP_PX}px ${THUMB_W_PX}px ${GAP_PX}px ${THUMB_W_PX}px`,
        gridTemplateRows: `${THUMB_H_PX}px ${GAP_PX}px ${THUMB_H_PX}px ${GAP_PX}px ${THUMB_H_PX}px`,
        gap: 0,
      }}
    >
          {/* Image principale : 3 vignettes de large, 2 vignettes de haut (avec gaps) */}
          <div
            className="relative col-span-5 row-span-3 overflow-hidden rounded border border-luxe-or-muted/30 bg-luxe-noir-soft"
            style={{
              gridColumn: "1 / 6",
              gridRow: "1 / 4",
              width: MAIN_W_PX,
              height: MAIN_H_PX,
            }}
          >
            <div
              className="relative h-full w-full transition-transform duration-200"
              style={{ transform: `scale(${zoom})` }}
            >
              <Image
                src={src}
                alt={mainImageAlt}
                fill
                className="object-cover"
                sizes="(max-width: 1200px) 100vw, 1200px"
                unoptimized={src.startsWith("https://picsum")}
                priority
              />
            </div>
            <div className="absolute right-2 top-2 flex flex-col gap-0.5 rounded border border-luxe-or-muted/40 bg-luxe-noir/90 p-1">
              <button
                type="button"
                onClick={zoomIn}
                className="rounded px-2 py-0.5 text-sm text-luxe-or hover:bg-luxe-or/20 touch-manipulation min-h-[32px]"
                aria-label="Zoom avant"
              >
                +
              </button>
              <button
                type="button"
                onClick={zoomOut}
                className="rounded px-2 py-0.5 text-sm text-luxe-or hover:bg-luxe-or/20 touch-manipulation min-h-[32px]"
                aria-label="Zoom arrière"
              >
                −
              </button>
            </div>
          </div>

          {/* Colonne droite : 2 vignettes (alignées avec le haut de l'image principale) */}
          <div style={{ gridColumn: "7", gridRow: "1" }}>
            {getImage(0) && (
              <ThumbButton
                img={getImage(0)}
                vetementId={vetement?.id ?? ""}
                isActive={activeIndex === imageIndexForSlot(0)}
                onClick={() => setActiveIndex(imageIndexForSlot(0))}
                disableActiveHighlight={isTouchDevice}
              />
            )}
          </div>
          <div style={{ gridColumn: "7", gridRow: "3" }}>
            {getImage(1) && (
              <ThumbButton
                img={getImage(1)}
                vetementId={vetement?.id ?? ""}
                isActive={activeIndex === imageIndexForSlot(1)}
                onClick={() => setActiveIndex(imageIndexForSlot(1))}
                disableActiveHighlight={isTouchDevice}
              />
            )}
          </div>

          {/* Rangée inférieure : 4 vignettes */}
          {getImage(2) && (
            <div style={{ gridColumn: "1", gridRow: "5" }}>
              <ThumbButton
                img={getImage(2)!}
                vetementId={vetement?.id ?? ""}
                isActive={activeIndex === imageIndexForSlot(2)}
                onClick={() => setActiveIndex(imageIndexForSlot(2))}
                disableActiveHighlight={isTouchDevice}
              />
            </div>
          )}
          {getImage(3) && (
            <div style={{ gridColumn: "3", gridRow: "5" }}>
              <ThumbButton
                img={getImage(3)!}
                vetementId={vetement?.id ?? ""}
                isActive={activeIndex === imageIndexForSlot(3)}
                onClick={() => setActiveIndex(imageIndexForSlot(3))}
                disableActiveHighlight={isTouchDevice}
              />
            </div>
          )}
          {getImage(4) && (
            <div style={{ gridColumn: "5", gridRow: "5" }}>
              <ThumbButton
                img={getImage(4)!}
                vetementId={vetement?.id ?? ""}
                isActive={activeIndex === imageIndexForSlot(4)}
                onClick={() => setActiveIndex(imageIndexForSlot(4))}
                disableActiveHighlight={isTouchDevice}
              />
            </div>
          )}
          {getImage(5) && (
            <div style={{ gridColumn: "7", gridRow: "5" }}>
              <ThumbButton
                img={getImage(5)!}
                vetementId={vetement?.id ?? ""}
                isActive={activeIndex === imageIndexForSlot(5)}
                onClick={() => setActiveIndex(imageIndexForSlot(5))}
                disableActiveHighlight={isTouchDevice}
              />
            </div>
          )}
    </div>
  );

  return (
    <div className="mx-auto flex max-w-7xl flex-col px-4 py-6 sm:px-6 md:py-8 w-full overflow-x-hidden min-h-[calc(100vh-4rem)]">
      <div className="shrink-0">
        <Link
          href={catalogueBackHref}
          className="inline-flex items-center justify-center rounded border border-luxe-or-muted/40 bg-luxe-noir-soft px-4 py-2 text-sm font-medium text-luxe-or transition-colors hover:border-luxe-or/50 hover:bg-white/5 touch-manipulation"
        >
          ← Retour au catalogue
        </Link>
      </div>

      {isSelectionModeVestes && (
        <div className="mt-4 flex flex-wrap items-center gap-4 rounded-lg border border-amber-500/50 bg-amber-500/10 px-4 py-3">
          <span className="text-sm font-medium text-amber-400">
            Mode sélection — Image de base (OR) : {selectedOr ? "1/1" : "0/1"} • Comparaisons (BLEU) : {selectedBleu.length}/{MAX_BLEU}
          </span>
          <div className="flex flex-wrap gap-2">
            {selectedOr && (
              <button
                type="button"
                onClick={handleValidateSelection}
                className="rounded border border-amber-500/70 bg-amber-500/20 px-3 py-1.5 text-sm font-medium text-amber-400 transition-colors hover:bg-amber-500/30 touch-manipulation"
              >
                Valider la sélection
              </button>
            )}
            <button
              type="button"
              onClick={removeLastSelection}
              className="rounded border border-luxe-blanc-muted/50 bg-luxe-noir-soft px-3 py-1.5 text-sm text-luxe-blanc-muted transition-colors hover:bg-white/10 touch-manipulation"
            >
              Annuler dernière sélection
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectionMode(false);
                router.push(ROUTES.MESURES);
              }}
              className="rounded border border-red-400/50 px-3 py-1.5 text-sm text-red-400 transition-colors hover:bg-red-400/10 touch-manipulation"
            >
              Quitter le mode sélection
            </button>
          </div>
        </div>
      )}

      {isSelectionModeChaussures && (
        <div className="mt-4 flex flex-wrap items-center gap-4 rounded-lg border border-luxe-or-muted/50 bg-luxe-or/10 px-4 py-3">
          <span className="text-sm font-medium text-luxe-or">
            Mode sélection chaussures — {selectedChaussures.length}/{MAX_CHAUSSURES} image(s)
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleValidateChaussures}
              className="rounded border border-luxe-or/70 bg-luxe-or/20 px-3 py-1.5 text-sm font-medium text-luxe-or transition-colors hover:bg-luxe-or/30 touch-manipulation"
            >
              Valider la sélection
            </button>
            <button
              type="button"
              onClick={removeLastChaussure}
              className="rounded border border-luxe-blanc-muted/50 bg-luxe-noir-soft px-3 py-1.5 text-sm text-luxe-blanc-muted transition-colors hover:bg-white/10 touch-manipulation"
            >
              Annuler dernière sélection
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectionFor(null);
                router.push(ROUTES.MESURES);
              }}
              className="rounded border border-red-400/50 px-3 py-1.5 text-sm text-red-400 transition-colors hover:bg-red-400/10 touch-manipulation"
            >
              Quitter le mode sélection
            </button>
          </div>
        </div>
      )}

      {isSelectionModeAccessoires && (
        <div className="mt-4 flex flex-wrap items-center gap-4 rounded-lg border border-luxe-or-muted/50 bg-luxe-or/10 px-4 py-3">
          <span className="text-sm font-medium text-luxe-or">
            Mode sélection accessoires — {selectedAccessoires.length}/{MAX_ACCESSOIRES} image(s)
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleValidateAccessoires}
              className="rounded border border-luxe-or/70 bg-luxe-or/20 px-3 py-1.5 text-sm font-medium text-luxe-or transition-colors hover:bg-luxe-or/30 touch-manipulation"
            >
              Valider la sélection
            </button>
            <button
              type="button"
              onClick={removeLastAccessoire}
              className="rounded border border-luxe-blanc-muted/50 bg-luxe-noir-soft px-3 py-1.5 text-sm text-luxe-blanc-muted transition-colors hover:bg-white/10 touch-manipulation"
            >
              Annuler dernière sélection
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectionFor(null);
                router.push(ROUTES.MESURES);
              }}
              className="rounded border border-red-400/50 px-3 py-1.5 text-sm text-red-400 transition-colors hover:bg-red-400/10 touch-manipulation"
            >
              Quitter le mode sélection
            </button>
          </div>
        </div>
      )}

      <div className="mt-4 shrink-0 text-left">
        <h1 className="font-serif text-2xl font-semibold text-luxe-blanc">
          {title}
        </h1>
        {description ? (
          <p className="mt-1 text-luxe-blanc-muted">{description}</p>
        ) : null}
      </div>

      <div className="mt-4 flex min-h-0 flex-1 flex-col">
        <p className="mb-2 shrink-0 text-sm font-medium text-luxe-blanc-muted">
          Modèles similaires
        </p>
        <div
          ref={gridContainerRef}
          className="min-h-0 flex-1 overflow-x-auto overflow-y-auto flex justify-start items-start"
        >
          {isBlocMode ? (
            <div className="w-full max-w-full overflow-x-hidden overflow-y-auto space-y-2">
              <div
                className="grid grid-cols-4 md:grid-cols-6 gap-2 w-max max-w-full mr-auto"
                style={{
                  gridTemplateRows: "minmax(200px, 38vh) minmax(200px, 38vh) repeat(auto-fill, minmax(90px, 1fr))",
                }}
              >
                {/* Image principale : 3 colonnes, 2 lignes */}
                <div
                  className="relative col-span-3 row-span-2 overflow-hidden rounded border border-luxe-or-muted/30 bg-luxe-noir-soft min-h-[280px] md:col-span-3"
                  style={{ gridColumn: "1 / 4", gridRow: "1 / 3" }}
                >
                  {src ? (
                    <>
                      <div
                        className="relative h-full w-full transition-transform duration-200"
                        style={{ transform: `scale(${zoom})` }}
                      >
                        <Image
                          src={src}
                          alt={mainImageAlt}
                          fill
                          className="object-cover"
                          sizes="(max-width: 1200px) 100vw, 1200px"
                          unoptimized={src.startsWith("blob:")}
                          priority
                        />
                        {isAnySelectionMode && (
                          <button
                            type="button"
                            onClick={() => handleThumbClick(displayIndex)}
                            className="absolute inset-0 z-[5] cursor-pointer touch-manipulation"
                            aria-label="Sélectionner cette image"
                          />
                        )}
                      </div>
                      <div className="absolute right-2 top-2 z-10 flex flex-col gap-0.5 rounded border border-luxe-or-muted/40 bg-luxe-noir/90 p-1">
                        <button
                          type="button"
                          onClick={zoomIn}
                          className="rounded px-2 py-0.5 text-sm text-luxe-or hover:bg-luxe-or/20 touch-manipulation min-h-[32px]"
                          aria-label="Zoom avant"
                        >
                          +
                        </button>
                        <button
                          type="button"
                          onClick={zoomOut}
                          className="rounded px-2 py-0.5 text-sm text-luxe-or hover:bg-luxe-or/20 touch-manipulation min-h-[32px]"
                          aria-label="Zoom arrière"
                        >
                          −
                        </button>
                      </div>
                    </>
                  ) : null}
                </div>
                {/* À droite : image de gauche (0) + suivantes — 2 vignettes en petit, 6 (3 colonnes) en md+ */}
                {displayUrls[0] != null && (
                  <div className="relative aspect-[3/4] min-h-[96px] col-start-4 row-start-1">
                    <ThumbButtonUrl
                      url={displayUrls[0]}
                      isActive={activeIndex === 0}
                      onClick={() => handleThumbClick(0)}
                      flexible
                      className="w-full h-full"
                      disableActiveHighlight={isTouchDevice}
                    />
                  </div>
                )}
                {displayUrls[1] != null && (
                  <div className="relative aspect-[3/4] min-h-[96px] col-start-4 row-start-2">
                    <ThumbButtonUrl
                      url={displayUrls[1]}
                      isActive={activeIndex === 1}
                      onClick={() => handleThumbClick(1)}
                      flexible
                      className="w-full h-full"
                      disableActiveHighlight={isTouchDevice}
                    />
                  </div>
                )}
                {/* Thumbs 2–5 : en bas (4-col) ou colonnes 5–6 (6-col md+) */}
                {displayUrls[2] != null && (
                  <div className="relative aspect-[3/4] min-h-[96px] col-start-1 row-start-3 md:col-start-5 md:row-start-1">
                    <ThumbButtonUrl url={displayUrls[2]} isActive={activeIndex === 2} onClick={() => handleThumbClick(2)} flexible className="w-full h-full" disableActiveHighlight={isTouchDevice} />
                  </div>
                )}
                {displayUrls[3] != null && (
                  <div className="relative aspect-[3/4] min-h-[96px] col-start-2 row-start-3 md:col-start-5 md:row-start-2">
                    <ThumbButtonUrl url={displayUrls[3]} isActive={activeIndex === 3} onClick={() => handleThumbClick(3)} flexible className="w-full h-full" disableActiveHighlight={isTouchDevice} />
                  </div>
                )}
                {displayUrls[4] != null && (
                  <div className="relative aspect-[3/4] min-h-[96px] col-start-3 row-start-3 md:col-start-6 md:row-start-1">
                    <ThumbButtonUrl url={displayUrls[4]} isActive={activeIndex === 4} onClick={() => handleThumbClick(4)} flexible className="w-full h-full" disableActiveHighlight={isTouchDevice} />
                  </div>
                )}
                {displayUrls[5] != null && (
                  <div className="relative aspect-[3/4] min-h-[96px] col-start-4 row-start-3 md:col-start-6 md:row-start-2">
                    <ThumbButtonUrl url={displayUrls[5]} isActive={activeIndex === 5} onClick={() => handleThumbClick(5)} flexible className="w-full h-full" disableActiveHighlight={isTouchDevice} />
                  </div>
                )}
                {/* Overflow : à partir de l'index 6, 4 par ligne en petit, 6 par ligne en md+ */}
                {Array.from({ length: Math.max(0, displayUrls.length - 6) }, (_, k) => {
                  const i = 6 + k;
                  const row = isMd ? 3 + Math.floor(k / 6) : 4 + Math.floor(k / 4);
                  const col = isMd ? (k % 6) + 1 : (k % 4) + 1;
                  return displayUrls[i] != null ? (
                    <div
                      key={i}
                      className="relative aspect-[3/4] min-h-[96px]"
                      style={{ gridColumn: col, gridRow: row }}
                    >
                      <ThumbButtonUrl
                        url={displayUrls[i]}
                        isActive={activeIndex === i}
                        onClick={() => handleThumbClick(i)}
                        flexible
                        className="w-full h-full"
                        disableActiveHighlight={isTouchDevice}
                      />
                    </div>
                  ) : null;
                })}
              </div>
            </div>
          ) : isStacked ? (
            <div className="w-full max-w-full overflow-x-hidden space-y-4">
              <div className="relative overflow-hidden rounded border border-luxe-or-muted/30 bg-luxe-noir-soft aspect-[3/4] max-h-[45vh] w-full">
                <div
                  className="relative h-full w-full transition-transform duration-200"
                  style={{ transform: `scale(${zoom})` }}
                >
                  <Image
                    src={src}
                    alt={mainImageAlt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1200px) 100vw, 1200px"
                    unoptimized={src.startsWith("https://picsum")}
                    priority
                  />
                </div>
                <div className="absolute right-2 top-2 flex flex-col gap-0.5 rounded border border-luxe-or-muted/40 bg-luxe-noir/90 p-1">
                  <button
                    type="button"
                    onClick={zoomIn}
                    className="rounded px-2 py-0.5 text-sm text-luxe-or hover:bg-luxe-or/20 touch-manipulation"
                    aria-label="Zoom avant"
                  >
                    +
                  </button>
                  <button
                    type="button"
                    onClick={zoomOut}
                    className="rounded px-2 py-0.5 text-sm text-luxe-or hover:bg-luxe-or/20 touch-manipulation"
                    aria-label="Zoom arrière"
                  >
                    −
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[0, 1, 2, 3, 4, 5].map((slot) =>
                  getImage(slot) ? (
                    <ThumbButton
                      key={slot}
                      img={getImage(slot)!}
                      vetementId={vetement?.id ?? ""}
                      isActive={activeIndex === imageIndexForSlot(slot)}
                      onClick={() => setActiveIndex(imageIndexForSlot(slot))}
                      flexible
                      className="w-full aspect-[3/4] min-h-[96px] h-auto"
                      disableActiveHighlight={isTouchDevice}
                    />
                  ) : null
                )}
              </div>
            </div>
          ) : (
            <div
              className="origin-top transition-transform duration-200"
              style={{
                transform: `scale(${scale})`,
                transformOrigin: "top center",
              }}
            >
              {vetement ? getGridContent() : null}
            </div>
          )}
        </div>
      </div>

      <p className="mt-4 shrink-0 text-center text-sm text-luxe-blanc-muted">
        Inspectez le grain du tissu avec le zoom. Validez ce modèle avant de
        passer au dossier client.
      </p>
    </div>
  );
}
