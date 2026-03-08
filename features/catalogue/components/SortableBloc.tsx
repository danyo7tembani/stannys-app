"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { BlocMurDeStyle } from "@/lib/backend/mur-de-style/types";
import type { CatalogueSection } from "@/shared/constants";
import { MurDeStyleBloc } from "./MurDeStyleBloc";

export interface SortableBlocProps {
  section: CatalogueSection;
  bloc: BlocMurDeStyle;
  onEdit: (bloc: BlocMurDeStyle) => void;
  onDelete: (bloc: BlocMurDeStyle) => void;
}

export function SortableBloc({ section, bloc, onEdit, onDelete }: SortableBlocProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: bloc.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? undefined : "transform 0.15s ease-out",
    opacity: isDragging ? 0.85 : 1,
    ...(isDragging && { willChange: "transform" }),
  };

  return (
    <div ref={setNodeRef} style={style} className="w-full max-w-full">
      <MurDeStyleBloc
        section={section}
        bloc={bloc}
        onEdit={onEdit}
        onDelete={onDelete}
        dragHandleProps={{ attributes, listeners }}
      />
    </div>
  );
}
