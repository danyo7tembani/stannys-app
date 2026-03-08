"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { getImageUrl } from "@/shared/api/client";
import type { ImageChoixModele } from "../types";
import type { AnnotationShape, AnnotationColor } from "../types";

const COLORS: { id: AnnotationColor; label: string; forType: "or" | "bleu" | "both" }[] = [
  { id: "red", label: "Supprimer (OR)", forType: "or" },
  { id: "yellow", label: "Modifier (OR)", forType: "or" },
  { id: "green", label: "Copier (BLEU)", forType: "bleu" },
];

/** Forme de nuage symétrique avec bosses + queue en 3 cercles (bulle de pensée). */
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
    <svg
      viewBox="0 0 140 118"
      className={className}
      style={style}
      preserveAspectRatio="none"
    >
      {/* Corps du nuage : forme symétrique avec bosses régulières */}
      <path
        d="M 70 14
           C 44 14 26 30 26 50
           C 10 50 6 64 16 74
           C 8 82 16 94 36 94
           C 36 100 50 106 70 106
           C 90 106 104 100 104 94
           C 124 94 132 82 124 74
           C 134 64 130 50 114 50
           C 114 30 96 14 70 14 Z"
        fill={fillColor}
        stroke={borderColor}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* Queue pensée : 3 cercles dégressifs (sous le centre-bas) */}
      <circle cx="56" cy="104" r="6" fill={fillColor} stroke={borderColor} strokeWidth="1.2" />
      <circle cx="44" cy="110" r="4" fill={fillColor} stroke={borderColor} strokeWidth="1" />
      <circle cx="34" cy="115" r="2.5" fill={fillColor} stroke={borderColor} strokeWidth="0.8" />
    </svg>
  );
}

export interface DesignStudioModalProps {
  image: ImageChoixModele;
  imageType: "or" | "bleu";
  imageLabel: string;
  initialShapes?: AnnotationShape[];
  onClose: () => void;
  onSave: (shapes: AnnotationShape[]) => void;
}

export function DesignStudioModal({
  image,
  imageType,
  imageLabel,
  initialShapes = [],
  onClose,
  onSave,
}: DesignStudioModalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentColor, setCurrentColor] = useState<AnnotationColor>(imageType === "bleu" ? "green" : "red");
  const [shapes, setShapes] = useState<AnnotationShape[]>(initialShapes);
  const [currentPath, setCurrentPath] = useState<{ x: number; y: number }[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [pendingCommentForIndex, setPendingCommentForIndex] = useState<number | null>(null);
  const [commentDraft, setCommentDraft] = useState("");
  const [imageRect, setImageRect] = useState<DOMRect | null>(null);
  const [expandedCloudIndex, setExpandedCloudIndex] = useState<number | null>(null);
  const [draggingCloudIndex, setDraggingCloudIndex] = useState<number | null>(null);
  const [editingCloudIndex, setEditingCloudIndex] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState("");
  const dragStartedRef = useRef(false);

  const TRUNCATE_LEN = 50;
  const CLOUD_OFFSET_X = -0.08;
  const CLOUD_OFFSET_Y = -0.15;

  const CLOUD_COLORS: Record<AnnotationColor, { bg: string; border: string; balls: string }> = {
    red: { bg: "rgba(239,68,68,0.95)", border: "#f87171", balls: "#ef4444" },
    yellow: { bg: "rgba(251,191,36,0.95)", border: "#fbbf24", balls: "#fbbf24" },
    green: { bg: "rgba(16,185,129,0.95)", border: "#34d399", balls: "#10b981" },
  };

  const imgSrc = getImageUrl(image.imageUrl) || image.imageUrl;

  const updateImageRect = useCallback(() => {
    if (containerRef.current) {
      setImageRect(containerRef.current.getBoundingClientRect());
    }
  }, []);

  useEffect(() => {
    updateImageRect();
    const ro = new ResizeObserver(updateImageRect);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [updateImageRect]);

  const toRelative = useCallback(
    (clientX: number, clientY: number) => {
      if (!imageRect) return null;
      const x = (clientX - imageRect.left) / imageRect.width;
      const y = (clientY - imageRect.top) / imageRect.height;
      if (x < 0 || x > 1 || y < 0 || y > 1) return null;
      return { x, y };
    },
    [imageRect]
  );

  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || !imageRect) return;
    const dpr = window.devicePixelRatio ?? 1;
    canvas.width = imageRect.width * dpr;
    canvas.height = imageRect.height * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, imageRect.width, imageRect.height);
    const allShapes = [...shapes, ...(currentPath.length > 1 ? [{ color: currentColor, points: currentPath }] : [])];
    allShapes.forEach((shape) => {
      const colorMap = { red: "#ef4444", yellow: "#fbbf24", green: "#10b981" };
      ctx.strokeStyle = colorMap[shape.color];
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      shape.points.forEach((p, i) => {
        const x = p.x * imageRect!.width;
        const y = p.y * imageRect!.height;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
    });
  }, [shapes, currentPath, currentColor, imageRect]);

  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      const pt = toRelative(e.clientX, e.clientY);
      if (pt) {
        setIsDrawing(true);
        setCurrentPath([pt]);
      }
    },
    [toRelative]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDrawing) return;
      const pt = toRelative(e.clientX, e.clientY);
      if (pt) setCurrentPath((prev) => [...prev, pt]);
    },
    [isDrawing, toRelative]
  );

  const handlePointerUp = useCallback(() => {
    setIsDrawing(false);
  }, []);

  const handleTerminerForme = useCallback(() => {
    if (currentPath.length < 2) return;
    const newShape: AnnotationShape = { color: currentColor, points: [...currentPath] };
    const nextShapes = [...shapes, newShape];
    setShapes(nextShapes);
    setCurrentPath([]);
    setPendingCommentForIndex(nextShapes.length - 1);
    setCommentDraft("");
  }, [currentPath, currentColor, shapes]);

  const handleCommentSubmit = useCallback(() => {
    if (pendingCommentForIndex === null) return;
    const next = shapes.map((s, i) =>
      i === pendingCommentForIndex ? { ...s, comment: commentDraft.trim() || undefined } : s
    );
    setShapes(next);
    setPendingCommentForIndex(null);
    setCommentDraft("");
  }, [pendingCommentForIndex, commentDraft, shapes]);

  const handleClose = useCallback(() => {
    onSave(shapes);
    onClose();
  }, [shapes, onSave, onClose]);

  const shapesWithComment = shapes.filter((s) => s.comment != null && s.comment.length > 0);

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

  const updateCloudPosition = useCallback(
    (shapeIndex: number, x: number, y: number) => {
      const clampedX = Math.max(0.05, Math.min(0.95, x));
      const clampedY = Math.max(0.05, Math.min(0.95, y));
      setShapes((prev) =>
        prev.map((s, i) => (i === shapeIndex ? { ...s, cloudPosition: { x: clampedX, y: clampedY } } : s))
      );
    },
    []
  );

  const handleCloudDoubleClick = useCallback((shapeIndex: number) => {
    const shape = shapes[shapeIndex];
    if (shape?.comment != null) {
      setEditingCloudIndex(shapeIndex);
      setEditDraft(shape.comment);
    }
  }, [shapes]);

  const handleEditSave = useCallback(() => {
    if (editingCloudIndex === null) return;
    const trimmed = editDraft.trim();
    setShapes((prev) =>
      prev.map((s, i) => (i === editingCloudIndex ? { ...s, comment: trimmed || s.comment } : s))
    );
    setEditingCloudIndex(null);
    setEditDraft("");
  }, [editingCloudIndex, editDraft]);

  useEffect(() => {
    if (draggingCloudIndex === null || !imageRect) return;
    const onMove = (e: PointerEvent) => {
      dragStartedRef.current = true;
      const x = (e.clientX - imageRect.left) / imageRect.width;
      const y = (e.clientY - imageRect.top) / imageRect.height;
      updateCloudPosition(draggingCloudIndex, x, y);
    };
    const onUp = () => setDraggingCloudIndex(null);
    document.addEventListener("pointermove", onMove);
    document.addEventListener("pointerup", onUp);
    document.addEventListener("pointercancel", onUp);
    return () => {
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerup", onUp);
      document.removeEventListener("pointercancel", onUp);
    };
  }, [draggingCloudIndex, imageRect, updateCloudPosition]);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/85 p-4">
      <div className="flex max-h-[95vh] w-full max-w-5xl flex-col rounded-lg border border-luxe-or/30 bg-luxe-noir shadow-xl">
        <div className="flex shrink-0 items-center justify-between border-b border-luxe-or-muted/30 px-4 py-3">
          <h2 className="font-serif text-lg font-semibold text-luxe-blanc">
            Design Studio — {imageLabel}
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="rounded border border-luxe-blanc-muted/40 px-3 py-1.5 text-sm text-luxe-blanc transition-colors hover:bg-white/10"
          >
            Fermer
          </button>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-3 border-b border-luxe-or-muted/30 px-4 py-2">
          {COLORS.filter((c) => c.forType === imageType || c.forType === "both").map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCurrentColor(c.id)}
              className={`rounded border px-3 py-1.5 text-sm font-medium transition-colors touch-manipulation ${
                currentColor === c.id
                  ? "border-white bg-white/20 text-white"
                  : "border-luxe-blanc-muted/40 text-luxe-blanc-muted hover:bg-white/5"
              }`}
              style={currentColor === c.id ? { borderColor: c.id === "red" ? "#ef4444" : c.id === "yellow" ? "#fbbf24" : "#10b981" } : undefined}
            >
              {c.label}
            </button>
          ))}
          <button
            type="button"
            onClick={handleTerminerForme}
            disabled={currentPath.length < 2}
            className="ml-auto rounded border border-amber-500/70 bg-amber-500/20 px-3 py-1.5 text-sm font-medium text-amber-400 disabled:opacity-50"
          >
            Terminer la forme
          </button>
        </div>

        <p className="shrink-0 px-4 py-1 text-xs text-luxe-blanc-muted">
          Rouge = Supprimer (sur OR) | Jaune = Modifier (sur OR) | Vert = Copier (sur BLEU) — Commentaire obligatoire : Rouge, Jaune, Vert
        </p>

        <div className="relative min-h-0 flex-1 overflow-auto p-4">
          <div
            ref={containerRef}
            className="relative mx-auto aspect-[3/4] max-h-[60vh] w-full max-w-2xl cursor-crosshair touch-none select-none"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
          >
            <Image
              src={imgSrc}
              alt={image.titre ?? imageLabel}
              fill
              className="object-contain"
              sizes="(max-width: 1024px) 90vw, 672px"
              unoptimized={imgSrc.startsWith("blob:")}
              onLoad={updateImageRect}
            />
            {imageRect && (
              <canvas
                ref={canvasRef}
                className="pointer-events-none absolute inset-0 h-full w-full"
                style={{ left: 0, top: 0, width: imageRect.width, height: imageRect.height }}
              />
            )}

            {/* Nuages flottants : couleur du stylet, déplaçables ; clic = tout le texte */}
            <div className="pointer-events-none absolute inset-0" aria-hidden>
              {shapesWithComment.map((shape, idx) => {
                const anchorPos = getAnchorAndCloudPos(shape);
                const cloudPos = getCloudPosition(shape);
                if (!anchorPos || !cloudPos || !shape.comment) return null;
                const shapeIndex = shapes.indexOf(shape);
                const isExpanded = expandedCloudIndex === shapeIndex;
                const isDragging = draggingCloudIndex === shapeIndex;
                const text = shape.comment;
                const truncated = text.length <= TRUNCATE_LEN ? text : `${text.slice(0, TRUNCATE_LEN)}…`;
                const colors = CLOUD_COLORS[shape.color];

                return (
                  <div key={idx} className="absolute inset-0">
                    {/* Ligne de petites boules (anchor → cloud) — couleur du stylet */}
                    <svg
                      className="absolute inset-0 h-full w-full pointer-events-none"
                      preserveAspectRatio="none"
                    >
                      {[0.2, 0.4, 0.6, 0.8].map((t, i) => {
                        const bx = anchorPos.anchor.x * 100 + t * (cloudPos.x - anchorPos.anchor.x) * 100;
                        const by = anchorPos.anchor.y * 100 + t * (cloudPos.y - anchorPos.anchor.y) * 100;
                        return (
                          <circle
                            key={i}
                            cx={`${bx}%`}
                            cy={`${by}%`}
                            r="2.2"
                            fill={colors.balls}
                            opacity="0.95"
                          />
                        );
                      })}
                    </svg>

                    {/* Nuage (forme avec bosses + queue) : couleur du stylet, déplaçable ; clic = tout le texte, double-clic = ajouter du texte */}
                    <div
                      className={`pointer-events-auto absolute z-10 w-[220px] min-h-[100px] cursor-grab active:cursor-grabbing shadow-lg transition-shadow select-text ${isDragging ? "ring-2 ring-white/50" : ""}`}
                      style={{
                        left: `${cloudPos.x * 100}%`,
                        top: `${cloudPos.y * 100}%`,
                        transform: "translate(-50%, -50%)",
                      }}
                      role="button"
                      tabIndex={0}
                      onPointerDown={(e) => {
                        e.stopPropagation();
                        dragStartedRef.current = false;
                        setDraggingCloudIndex(shapeIndex);
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!dragStartedRef.current && editingCloudIndex !== shapeIndex) {
                          setExpandedCloudIndex((prev) => (prev === shapeIndex ? null : shapeIndex));
                        }
                      }}
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        handleCloudDoubleClick(shapeIndex);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setExpandedCloudIndex((prev) => (prev === shapeIndex ? null : shapeIndex));
                        }
                      }}
                      aria-expanded={isExpanded}
                      aria-label={`Nuage ${shape.color}, déplaçable. Double-clic pour modifier le texte.`}
                    >
                      <CloudShapeSvg
                        fillColor={colors.bg}
                        borderColor={colors.border}
                        className="absolute inset-0 h-full w-full pointer-events-none"
                      />
                      <div
                        className={`absolute inset-0 flex flex-col justify-center items-center text-center px-5 py-4 ${editingCloudIndex === shapeIndex ? "pointer-events-auto" : "pointer-events-none"}`}
                        onPointerDown={editingCloudIndex === shapeIndex ? (e) => e.stopPropagation() : undefined}
                      >
                        {editingCloudIndex === shapeIndex ? (
                          <>
                            <span className="text-xs font-medium opacity-90 mb-2">
                              Ajouter ou modifier le commentaire
                            </span>
                            <textarea
                              value={editDraft}
                              onChange={(e) => setEditDraft(e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              className="w-full min-h-[56px] rounded border border-black/20 bg-white/95 px-2 py-1.5 text-sm text-luxe-noir resize-none text-left"
                              placeholder="Commentaire..."
                            />
                            <div className="mt-2 flex gap-2 justify-center">
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); handleEditSave(); }}
                                className="rounded bg-white px-3 py-1.5 text-xs font-medium text-luxe-noir border border-black/20"
                              >
                                Enregistrer
                              </button>
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); setEditingCloudIndex(null); setEditDraft(""); }}
                                className="rounded bg-black/10 px-2 py-1 text-xs"
                              >
                                Annuler
                              </button>
                            </div>
                          </>
                        ) : (
                          <>
                            <span className={`block text-sm w-full font-medium text-gray-900 drop-shadow-sm ${isExpanded ? "" : "line-clamp-2"}`} title={text}>
                              {isExpanded ? text : truncated}
                            </span>
                            {text.length > TRUNCATE_LEN && !isExpanded && (
                              <span className="mt-1 block text-xs font-medium opacity-90">
                                Cliquer : tout afficher · Double-clic : modifier · Glisser : déplacer
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {pendingCommentForIndex !== null && (() => {
          const pendingShape = shapes[pendingCommentForIndex];
          const placeholders: Record<AnnotationColor, string> = {
            red: "Préciser l'élément à supprimer",
            yellow: "Décrivez la modification à apporter",
            green: "Décrivez l'élément à copier à l'identique",
          };
          const placeholder = pendingShape ? placeholders[pendingShape.color] : "";
          return (
            <div className="shrink-0 border-t border-luxe-or-muted/30 px-4 py-3">
              <p className="mb-2 text-sm text-amber-400">
                Commentaire obligatoire pour cette forme
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={commentDraft}
                  onChange={(e) => setCommentDraft(e.target.value)}
                  placeholder={placeholder}
                  className="flex-1 rounded border border-luxe-blanc-muted/40 bg-luxe-noir-soft px-3 py-2 text-sm text-luxe-blanc placeholder:text-luxe-blanc-muted"
                />
                <button
                  type="button"
                  onClick={handleCommentSubmit}
                  disabled={!commentDraft.trim()}
                  className="rounded border border-amber-500/70 bg-amber-500/20 px-4 py-2 text-sm font-medium text-amber-400 disabled:opacity-50"
                >
                  Valider
                </button>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
