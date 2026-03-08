"use client";

/**
 * Icône « personne » pour représenter l’absence de photo (faciale ou corps)
 * dans les informations personnelles du dossier client.
 */
export function PersonPhotoPlaceholder({ className }: { className?: string }) {
  return (
    <div
      className={`flex items-center justify-center rounded border border-dashed border-luxe-or-muted/40 bg-luxe-noir-soft text-luxe-blanc-muted ${className ?? ""}`}
      aria-hidden
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="h-2/3 w-2/3 opacity-60"
        aria-hidden
      >
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
      </svg>
    </div>
  );
}
