"use client";

import { useState, useRef, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { arrayMove, SortableContext, rectSortingStrategy } from "@dnd-kit/sortable";
import { Button, Input, ConfirmDeleteModal } from "@/shared/ui";
import { apiUrl, getImageUrl } from "@/shared/api/client";
import { slugify } from "@/shared/utils/slugify";
import type { BlocMurDeStyle } from "@/lib/backend/mur-de-style/types";
import type { CatalogueSection } from "@/shared/constants";
import {
  SortableSlideThumbnail,
  getItemId,
  type SlideThumbnailItem,
} from "./SortableSlideThumbnail";
import { MODAL_BACKDROP_CLASSES, MODAL_PANEL_CLASSES } from "../constants/modalShell";

const MIN_SLIDER_IMAGES = 5;
const MAX_SLIDER_IMAGES = 50;

function revokeUrls(urls: string[]) {
  urls.forEach((u) => {
    try {
      if (u.startsWith("blob:")) URL.revokeObjectURL(u);
    } catch (_) {}
  });
}

export interface EditBlockModalProps {
  section: CatalogueSection;
  bloc: BlocMurDeStyle;
  onClose: () => void;
  onSaved: (bloc: BlocMurDeStyle) => void;
  onDeleted: () => void;
}

export function EditBlockModal({ section, bloc, onClose, onSaved, onDeleted }: EditBlockModalProps) {
  const slideInputRef = useRef<HTMLInputElement>(null);
  const panelInputRef = useRef<HTMLInputElement>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [titre, setTitre] = useState(bloc.titre ?? "");
  const [texteLong, setTexteLong] = useState(bloc.texteLong ?? "");
  const [texteCourt, setTexteCourt] = useState(bloc.texteCourt ?? "");
  const [slideItems, setSlideItems] = useState<SlideThumbnailItem[]>(() =>
    (bloc.imagesSlider ?? []).map((url, i) => ({
      kind: "url" as const,
      url,
      id: `url-${i}-${url}`,
    }))
  );
  const [panelUrl, setPanelUrl] = useState(bloc.imageGaucheUrl ?? "");
  const [panelNewFile, setPanelNewFile] = useState<File | null>(null);
  const [panelNewPreviewUrl, setPanelNewPreviewUrl] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 10 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 12 },
    }),
    useSensor(KeyboardSensor)
  );

  const slideItemsRef = useRef<SlideThumbnailItem[]>([]);
  const panelPreviewRef = useRef<string | null>(null);
  slideItemsRef.current = slideItems;
  panelPreviewRef.current = panelNewPreviewUrl;
  useEffect(() => {
    return () => {
      slideItemsRef.current.forEach((item) => {
        if (item.kind === "file" && item.previewUrl.startsWith("blob:"))
          URL.revokeObjectURL(item.previewUrl);
      });
      const p = panelPreviewRef.current;
      if (p?.startsWith("blob:")) URL.revokeObjectURL(p);
    };
  }, []);

  const uploadFiles = async (
    files: FileList | File[],
    multiple: boolean
  ): Promise<string | string[] | null> => {
    const list = Array.isArray(files) ? files : (files && Array.from(files)) || [];
    if (!list.length) return null;
    const formData = new FormData();
    if (multiple) {
      list.slice(0, MAX_SLIDER_IMAGES).forEach((f) => formData.append("files", f));
    } else {
      formData.append("file", list[0]);
    }
    const res = await fetch(apiUrl("upload"), { method: "POST", body: formData });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error ?? "Erreur upload");
    }
    const data = await res.json();
    return multiple ? (data.urls ?? []) : (data.url ?? null);
  };

  const removeSlideItem = (index: number) => {
    setSlideItems((prev) => {
      const item = prev[index];
      if (item?.kind === "file" && item.previewUrl.startsWith("blob:"))
        URL.revokeObjectURL(item.previewUrl);
      return prev.filter((_, i) => i !== index);
    });
    setError(null);
  };

  const onSlideImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    setError(null);
    const list = Array.from(files).slice(0, MAX_SLIDER_IMAGES - slideItems.length);
    const newItems: SlideThumbnailItem[] = list.map((file) => {
      const previewUrl = URL.createObjectURL(file);
      return {
        kind: "file" as const,
        file,
        previewUrl,
        id: `file-${previewUrl}`,
      };
    });
    setSlideItems((prev) => [...prev, ...newItems]);
    e.target.value = "";
  };

  const handleSlideDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = slideItems.findIndex((item) => getItemId(item) === active.id);
    const newIndex = slideItems.findIndex((item) => getItemId(item) === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    setSlideItems((prev) => arrayMove(prev, oldIndex, newIndex));
  };
  const clearPanelUrl = () => {
    setPanelUrl("");
    setError(null);
  };
  const clearPanelNew = () => {
    if (panelNewPreviewUrl?.startsWith("blob:")) URL.revokeObjectURL(panelNewPreviewUrl);
    setPanelNewPreviewUrl(null);
    setPanelNewFile(null);
    setError(null);
  };
  const onPanelImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    setError(null);
    const newUrl = URL.createObjectURL(files[0]);
    setPanelNewPreviewUrl((prev) => {
      if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
      return newUrl;
    });
    setPanelNewFile(files[0]);
    e.target.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!titre.trim()) {
      setError("Le titre est requis.");
      return;
    }
    if (slideItems.length === 0) {
      setError("Conservez ou ajoutez au moins une image pour le slide.");
      return;
    }
    if (slideItems.length < MIN_SLIDER_IMAGES) {
      setError(
        `Le slide doit contenir au moins ${MIN_SLIDER_IMAGES} images (actuellement ${slideItems.length}).`
      );
      return;
    }
    setSending(true);
    try {
      const imagesSlider: string[] = [];
      for (const item of slideItems.slice(0, MAX_SLIDER_IMAGES)) {
        if (item.kind === "url") {
          imagesSlider.push(item.url);
        } else {
          const url = await uploadFiles([item.file], false);
          if (url && typeof url === "string") imagesSlider.push(url);
        }
      }

      let imageGaucheUrl = panelUrl.trim();
      if (panelNewFile) {
        const url = await uploadFiles([panelNewFile], false);
        if (url && typeof url === "string") imageGaucheUrl = url;
      }

      const res = await fetch(apiUrl(`catalogue/${section}/blocks/${bloc.id}`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titre: titre.trim(),
          sousTitre: "",
          imagesSlider,
          imageGaucheUrl,
          texteLong: (texteLong ?? "").trim(),
          texteCourt: (texteCourt ?? "").trim() || titre.trim(),
          slug: slugify(texteLong || titre),
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Erreur lors de la modification du bloc");
      }
      const updated = await res.json();
      setError(null);
      setSuccessMessage("Section enregistrée.");
      setTimeout(() => {
        onSaved(updated);
        onClose();
      }, 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setSending(false);
    }
  };

  const handleConfirmDelete = async () => {
    setSending(true);
    setError(null);
    try {
      const res = await fetch(apiUrl(`catalogue/${section}/blocks/${bloc.id}`), { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Erreur lors de la suppression du bloc");
      }
      setError(null);
      setSuccessMessage("Section supprimée.");
      setShowDeleteConfirm(false);
      setTimeout(() => {
        onDeleted();
        onClose();
      }, 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
      setShowDeleteConfirm(false);
    } finally {
      setSending(false);
    }
  };

  const handleClose = () => {
    if (sending) return;
    setSuccessMessage(null);
    setError(null);
    slideItems.forEach((item) => {
      if (item.kind === "file" && item.previewUrl.startsWith("blob:"))
        URL.revokeObjectURL(item.previewUrl);
    });
    if (panelNewPreviewUrl?.startsWith("blob:")) URL.revokeObjectURL(panelNewPreviewUrl);
    setShowDeleteConfirm(false);
    onClose();
  };

  return (
    <div
      className={MODAL_BACKDROP_CLASSES}
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-modal-title"
    >
      <div className="absolute inset-0" onClick={handleClose} aria-hidden />
      <div className={MODAL_PANEL_CLASSES}>
        <h2 id="edit-modal-title" className="mb-4 font-serif text-xl font-semibold text-luxe-or">
          Modifier la section
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Titre (ex. Costumes)"
            value={titre}
            onChange={(e) => setTitre(e.target.value)}
            placeholder="Costumes"
            required
          />

          <input
            ref={slideInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={onSlideImagesChange}
          />
          <input
            ref={panelInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onPanelImageChange}
          />

          <div className="space-y-2">
            <span className="block text-sm font-medium text-luxe-blanc-muted">
              Images du slide (min {MIN_SLIDER_IMAGES}, max {MAX_SLIDER_IMAGES})
            </span>
            <button
              type="button"
              onClick={() => slideInputRef.current?.click()}
              disabled={sending || slideItems.length >= MAX_SLIDER_IMAGES}
              className="flex w-full items-center justify-center gap-2 rounded-sm border border-dashed border-luxe-or/50 bg-luxe-noir-soft/50 py-4 text-luxe-or transition-colors hover:border-luxe-or hover:bg-luxe-or/10 disabled:opacity-50"
            >
              Ajouter des images
            </button>
            {slideItems.length > 0 && (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleSlideDragEnd}
              >
                <SortableContext
                  items={slideItems.map((item) => getItemId(item))}
                  strategy={rectSortingStrategy}
                >
                  <div className="flex min-h-[72px] flex-wrap gap-2 rounded border border-luxe-or/40 bg-luxe-noir-soft/50 p-2">
                    {slideItems.map((item, i) => (
                      <SortableSlideThumbnail
                        key={item.id}
                        item={item}
                        index={i}
                        imageSrc={item.kind === "url" ? getImageUrl(item.url) : item.previewUrl}
                        onRemove={() => removeSlideItem(i)}
                        disabled={sending}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>

          <div className="space-y-2">
            <span className="block text-sm font-medium text-luxe-blanc-muted">
              Image zone de droite (panneau « Voir plus »)
            </span>
            <button
              type="button"
              onClick={() => panelInputRef.current?.click()}
              disabled={sending}
              className="flex w-full items-center justify-center gap-2 rounded-sm border border-dashed border-luxe-or/50 bg-luxe-noir-soft/50 py-4 text-luxe-or transition-colors hover:border-luxe-or hover:bg-luxe-or/10 disabled:opacity-50"
            >
              {panelUrl || panelNewPreviewUrl ? "Remplacer l'image" : "Ouvrir (galerie / machine)"}
            </button>
            {(panelUrl || panelNewPreviewUrl) && (
              <div className="flex justify-center">
                <div className="relative h-20 w-20 overflow-hidden rounded border-2 border-luxe-or/50 bg-luxe-noir">
                  <img
                    src={panelNewPreviewUrl ?? getImageUrl(panelUrl)}
                    alt="Panneau"
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={panelNewPreviewUrl ? clearPanelNew : clearPanelUrl}
                    disabled={sending}
                    className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600 disabled:opacity-50"
                    aria-label="Retirer l'image"
                  >
                    ×
                  </button>
                </div>
              </div>
            )}
          </div>

          <Input
            label="Texte long (bande noire)"
            value={texteLong}
            onChange={(e) => setTexteLong(e.target.value)}
            placeholder="Costume croisé Navy"
          />
          <Input
            label="Texte court (en bas)"
            value={texteCourt}
            onChange={(e) => setTexteCourt(e.target.value)}
            placeholder="Costume"
          />

          {successMessage && (
            <p className="text-sm text-emerald-400" role="status">
              {successMessage}
            </p>
          )}
          {error && (
            <p className="text-sm text-red-400" role="alert">
              {error}
            </p>
          )}

          <div className="flex flex-wrap gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={handleClose} disabled={sending}>
              Annuler
            </Button>
            <Button type="submit" variant="primary" disabled={sending}>
              {sending ? "Enregistrement…" : "Enregistrer"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={sending}
              className="text-red-400 hover:bg-red-500/20"
            >
              Supprimer le bloc
            </Button>
          </div>
        </form>
      </div>

      <ConfirmDeleteModal
        open={showDeleteConfirm}
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
        title="Confirmer la suppression"
        message="Voulez-vous vraiment supprimer ce bloc ?"
        loading={sending}
      />
    </div>
  );
}
