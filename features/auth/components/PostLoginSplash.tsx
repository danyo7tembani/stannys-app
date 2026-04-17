"use client";

import Image from "next/image";

/**
 * Overlay post-connexion : même visuel que l’écran de chargement login (logo + zoom 2s).
 * Composant dédié, indépendant d’AuthSplash. Le parent (AuthGuard) gère l’affichage et le timer 2s.
 */
export function PostLoginSplash() {
  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-[var(--luxe-noir)]"
      aria-hidden="true"
    >
      <Image
        src="/logo.png"
        alt=""
        width={448}
        height={224}
        className="h-56 w-auto object-contain"
        style={{
          animation: "loading-zoom 2s ease-in-out 1 forwards",
        }}
        priority
        unoptimized={false}
      />
    </div>
  );
}
