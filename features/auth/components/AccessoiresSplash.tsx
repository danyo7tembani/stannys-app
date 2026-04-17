"use client";

import Image from "next/image";

/**
 * Overlay au passage vers la section Accessoires (nav ou combo).
 * Même visuel : logo + zoom 1s. Le parent gère l’affichage et le timer.
 */
export function AccessoiresSplash() {
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
          animation: "loading-zoom 1s ease-in-out 1 forwards",
        }}
        priority
        unoptimized={false}
      />
    </div>
  );
}
