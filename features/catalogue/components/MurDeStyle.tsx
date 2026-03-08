"use client";

import { useEffect, useState, useRef } from "react";
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
import { arrayMove, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { Vetement } from "../types";
import type { BlocMurDeStyle } from "@/lib/backend/mur-de-style/types";
import type { CatalogueSection } from "@/shared/constants";
import { apiUrl } from "@/shared/api/client";
import { ConfirmDeleteModal } from "@/shared/ui";
import { useAuthStore } from "@/features/auth/store";
import { canEditCatalogue } from "@/features/auth";
import { CatalogueSectionSwitcher } from "./CatalogueSectionSwitcher";
import { EditBlockModal } from "./EditBlockModal";
import { MurDeStyleSubtitleHeader } from "./MurDeStyleSubtitleHeader";
import { MurDeStyleBloc } from "./MurDeStyleBloc";
import { SortableBloc } from "./SortableBloc";

const PREVIEW_REVOKE_DELAY_MS = 4000;

function revokePreviewUrls(urls: string[] | null) {
  if (!urls?.length) return;
  urls.forEach((u) => {
    try {
      if (u.startsWith("blob:")) URL.revokeObjectURL(u);
    } catch (_) {}
  });
}

export interface MurDeStyleProps {
  /** Section catalogue (vestes, chaussures, accessoires) */
  section: CatalogueSection;
  vetements: Vetement[];
}

type PreviewUrls = { imagesSlider: string[]; imageGaucheUrl: string | null };

/** Ne garde que les blocs dont les images viennent d’un ajout dynamique (blob ou /uploads/), pas /temp/. */
function isBlocFromDynamicSource(bloc: BlocMurDeStyle): boolean {
  const urls = bloc.imagesSlider ?? [];
  if (urls.length === 0) return false;
  const hasTemp = urls.some((u) => typeof u === "string" && u.startsWith("/temp"));
  return !hasTemp;
}

export function MurDeStyle({ section, vetements }: MurDeStyleProps) {
  const [blocs, setBlocs] = useState<BlocMurDeStyle[] | null>(null);
  const [previewBlobs, setPreviewBlobs] = useState<Record<string, PreviewUrls>>({});
  const [optimisticBloc, setOptimisticBloc] = useState<BlocMurDeStyle | null>(null);
  const [editingBloc, setEditingBloc] = useState<BlocMurDeStyle | null>(null);
  const [orderedList, setOrderedList] = useState<BlocMurDeStyle[]>([]);
  const [listError, setListError] = useState<string | null>(null);
  const [globalSubtitle, setGlobalSubtitle] = useState<string | null>(null);
  const revokeTimeoutsRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 10 } }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 12,
      },
    }),
    useSensor(KeyboardSensor)
  );

  const fetchBlocs = () => {
    fetch(apiUrl(`catalogue/${section}/blocks`))
      .then((r) => r.json())
      .then((data) => {
        const arr = Array.isArray(data) ? data : [];
        setBlocs(arr);
        setOptimisticBloc((prev) => (prev && arr.some((b) => b.id === prev.id) ? null : prev));
      })
      .catch(() => setBlocs([]));
  };

  const fetchConfig = () => {
    fetch(apiUrl(`catalogue/${section}/config`))
      .then((r) => r.json())
      .then((data) => {
        const subtitle = typeof data?.subtitle === "string" ? data.subtitle : null;
        setGlobalSubtitle(subtitle);
      })
      .catch(() => setGlobalSubtitle(null));
  };

  useEffect(() => {
    fetchBlocs();
    fetchConfig();
    const onUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<
        { section: string; bloc: BlocMurDeStyle; previewUrls: PreviewUrls } | undefined
      >;
      const detail = customEvent.detail;
      if (detail?.section !== section) return;
      if (detail?.bloc && detail?.previewUrls) {
        const { bloc, previewUrls } = detail;
        setOptimisticBloc(bloc);
        if (previewUrls.imagesSlider?.length || previewUrls.imageGaucheUrl) {
          setPreviewBlobs((prev) => ({ ...prev, [bloc.id]: previewUrls }));
          const t = setTimeout(() => {
            revokePreviewUrls(previewUrls.imagesSlider);
            if (previewUrls.imageGaucheUrl?.startsWith("blob:")) {
              try {
                URL.revokeObjectURL(previewUrls.imageGaucheUrl);
              } catch (_) {}
            }
            setPreviewBlobs((prev) => {
              const next = { ...prev };
              delete next[bloc.id];
              return next;
            });
            if (revokeTimeoutsRef.current[bloc.id]) {
              clearTimeout(revokeTimeoutsRef.current[bloc.id]);
              delete revokeTimeoutsRef.current[bloc.id];
            }
          }, PREVIEW_REVOKE_DELAY_MS);
          revokeTimeoutsRef.current[bloc.id] = t;
        }
      }
      fetchBlocs();
      fetchConfig();
    };
    window.addEventListener("catalogue-blocs-updated", onUpdate);
    return () => {
      window.removeEventListener("catalogue-blocs-updated", onUpdate);
      Object.values(revokeTimeoutsRef.current).forEach(clearTimeout);
      setPreviewBlobs((prev) => {
        Object.values(prev).forEach((p) => {
          revokePreviewUrls(p.imagesSlider);
          if (p.imageGaucheUrl?.startsWith("blob:")) {
            try {
              URL.revokeObjectURL(p.imageGaucheUrl);
            } catch (_) {}
          }
        });
        return {};
      });
    };
  }, [section]);

  const allBlocs = blocs ?? [];
  const listWithOptimistic =
    optimisticBloc && !allBlocs.some((b) => b.id === optimisticBloc.id)
      ? [...allBlocs, optimisticBloc]
      : allBlocs;
  const list = listWithOptimistic.filter(
    (b) => (b.imagesSlider?.length ?? 0) > 0 && isBlocFromDynamicSource(b)
  );

  const listIdsKey = list.length > 0 ? list.map((b) => b.id).join(",") : "";
  useEffect(() => {
    setOrderedList(list);
  }, [listIdsKey]);

  const listToUse =
    orderedList.length === list.length ? orderedList : list;

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = listToUse.findIndex((b) => b.id === active.id);
    const newIndex = listToUse.findIndex((b) => b.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const next = arrayMove(listToUse, oldIndex, newIndex);
    setOrderedList(next);
    const payload = next.map((b: BlocMurDeStyle, ordre: number) => ({ id: b.id, ordre }));
    setListError(null);
    fetch(apiUrl(`catalogue/${section}/blocks/reorder`), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((r) => {
        if (r.ok) {
          setListError(null);
          fetchBlocs();
        } else {
          setListError("Impossible de réordonner les sections.");
          fetchBlocs();
        }
      })
      .catch(() => {
        setListError("Impossible de réordonner les sections.");
        fetchBlocs();
      });
  };

  const handleEditBloc = (bloc: BlocMurDeStyle) => {
    setListError(null);
    setEditingBloc(bloc);
  };

  const [blocToDelete, setBlocToDelete] = useState<BlocMurDeStyle | null>(null);
  const [deletingBlocId, setDeletingBlocId] = useState<string | null>(null);

  const handleRequestDeleteBloc = (bloc: BlocMurDeStyle) => {
    setBlocToDelete(bloc);
  };

  const handleConfirmDeleteBloc = () => {
    if (!blocToDelete) return;
    setListError(null);
    setDeletingBlocId(blocToDelete.id);
    fetch(apiUrl(`catalogue/${section}/blocks/${blocToDelete.id}`), { method: "DELETE" })
      .then((r) => {
        if (r.ok) {
          setListError(null);
          setEditingBloc((prev) => (prev?.id === blocToDelete.id ? null : prev));
          setBlocToDelete(null);
          fetchBlocs();
        } else {
          setListError("Impossible de supprimer le bloc.");
        }
      })
      .catch(() => setListError("Impossible de supprimer le bloc."))
      .finally(() => setDeletingBlocId(null));
  };

  const role = useAuthStore((s) => s.role);
  const canEdit = canEditCatalogue(role);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] w-full flex-col items-center justify-center py-4">
      {canEdit && (
        <div className="mb-4 flex w-full max-w-2xl flex-wrap items-center justify-center gap-3 px-3">
          <CatalogueSectionSwitcher currentSection={section} />
        </div>
      )}
      <MurDeStyleSubtitleHeader
        section={section}
        subtitle={globalSubtitle}
        onUpdated={fetchConfig}
      />
      {listError && (
        <p className="mb-3 text-center text-sm text-red-400" role="alert">
          {listError}
        </p>
      )}
      {list.length === 0 ? (
        <p className="text-center text-luxe-blanc-muted">
          {canEdit
            ? "Aucune section pour l'instant. Cliquez sur « Ajouter » pour créer une section avec vos images."
            : "Aucune section pour l'instant."}
        </p>
      ) : canEdit ? (
        <>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={listToUse.map((b) => b.id)} strategy={verticalListSortingStrategy}>
              <div className="flex w-full flex-col items-center gap-0">
                {listToUse.map((bloc) => {
                  const preview = previewBlobs[bloc.id];
                  const displayBloc: BlocMurDeStyle = preview
                    ? {
                        ...bloc,
                        imagesSlider:
                          preview.imagesSlider?.length > 0 ? preview.imagesSlider : bloc.imagesSlider,
                        imageGaucheUrl:
                          preview.imageGaucheUrl && preview.imageGaucheUrl.startsWith("blob:")
                            ? preview.imageGaucheUrl
                            : bloc.imageGaucheUrl,
                      }
                    : bloc;
                  return (
                    <SortableBloc
                      key={bloc.id}
                      section={section}
                      bloc={displayBloc}
                      onEdit={handleEditBloc}
                      onDelete={handleRequestDeleteBloc}
                    />
                  );
                })}
              </div>
            </SortableContext>
          </DndContext>
          <ConfirmDeleteModal
            open={blocToDelete !== null}
            onConfirm={handleConfirmDeleteBloc}
            onCancel={() => setBlocToDelete(null)}
            title="Confirmer la suppression"
            message="Voulez-vous vraiment supprimer ce bloc ?"
            loading={deletingBlocId !== null}
          />
          {editingBloc && (
            <EditBlockModal
              section={section}
              bloc={editingBloc}
              onClose={() => setEditingBloc(null)}
              onSaved={() => {
                setListError(null);
                fetchBlocs();
                setEditingBloc(null);
              }}
              onDeleted={() => {
                setListError(null);
                fetchBlocs();
                setEditingBloc(null);
              }}
            />
          )}
        </>
      ) : (
        <div className="flex w-full flex-col items-center gap-0">
          {listToUse.map((bloc) => {
            const preview = previewBlobs[bloc.id];
            const displayBloc: BlocMurDeStyle = preview
              ? {
                  ...bloc,
                  imagesSlider:
                    preview.imagesSlider?.length > 0 ? preview.imagesSlider : bloc.imagesSlider,
                  imageGaucheUrl:
                    preview.imageGaucheUrl && preview.imageGaucheUrl.startsWith("blob:")
                      ? preview.imageGaucheUrl
                      : bloc.imageGaucheUrl,
                }
              : bloc;
            return (
              <MurDeStyleBloc
                key={bloc.id}
                section={section}
                bloc={displayBloc}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
