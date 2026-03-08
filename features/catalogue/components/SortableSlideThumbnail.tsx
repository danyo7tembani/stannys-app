"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export type SlideThumbnailItem =
  | { kind: "url"; url: string; id: string }
  | { kind: "file"; file: File; previewUrl: string; id: string };

function getItemId(item: SlideThumbnailItem): string {
  return item.id;
}

export interface SortableSlideThumbnailProps {
  item: SlideThumbnailItem;
  index: number;
  imageSrc: string;
  onRemove: () => void;
  disabled?: boolean;
}

export function SortableSlideThumbnail({
  item,
  index: _index,
  imageSrc,
  onRemove,
  disabled,
}: SortableSlideThumbnailProps) {
  const id = getItemId(item);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? undefined : "transform 0.12s ease-out",
    opacity: isDragging ? 0.9 : 1,
    ...(isDragging && { willChange: "transform" }),
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative h-14 w-14 shrink-0 overflow-hidden rounded border border-luxe-or/50 bg-luxe-noir"
    >
      <img src={imageSrc} alt="" className="h-full w-full object-cover" />
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        disabled={disabled}
        className="absolute -right-1 -top-1 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600 disabled:opacity-50"
        aria-label="Retirer cette image"
      >
        ×
      </button>
      <button
        type="button"
        className="absolute inset-0 z-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing touch-none"
        aria-label="Déplacer"
        disabled={disabled}
        {...attributes}
        {...listeners}
      >
        <svg width="20" height="20" viewBox="0 0 16 16" fill="white" aria-hidden>
          <circle cx="5" cy="5" r="1.5" />
          <circle cx="11" cy="5" r="1.5" />
          <circle cx="5" cy="11" r="1.5" />
          <circle cx="11" cy="11" r="1.5" />
        </svg>
      </button>
    </div>
  );
}

export { getItemId };
