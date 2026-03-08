"use client";

import Image from "next/image";

/**
 * Overlay au clic "Voir plus" sur un bloc catalogue / mur de style.
 * Même visuel que PostLoginSplash (logo + zoom 2s). Le parent gère l’affichage et le timer 2s.
 */
export function BlockViewerSplash() {
  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-[var(--luxe-noir)]"
      aria-hidden="true"
    >
      <Image
        src="/logo.png"
        alt=""
        width={200}
        height={100}
        className="h-24 w-auto object-contain"
        style={{
          animation: "loading-zoom 1s ease-in-out 1 forwards",
        }}
        priority
        unoptimized={false}
      />
    </div>
  );
}
