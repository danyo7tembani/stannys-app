"use client";

import { useRouter } from "next/navigation";
import { ROUTES } from "@/shared/constants";
import { useAuthStore } from "@/features/auth/store";

const ROUNDED_RECT_PATH =
  "M 16,0 L 144,0 Q 160,0 160,16 L 160,32 Q 160,48 144,48 L 16,48 Q 0,48 0,32 L 0,16 Q 0,0 16,0 Z";

export function MesureButton() {
  const router = useRouter();
  const setShowMesureSplash = useAuthStore((s) => s.setShowMesureSplash);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowMesureSplash(true);
    router.push(ROUTES.DOSSIER);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="mesure-button relative inline-block h-12 w-40 min-h-[44px] cursor-pointer border-none bg-transparent outline-none focus:outline-none focus:ring-0 focus:ring-offset-0 no-underline touch-manipulation"
      aria-label="Création du Dossier Client"
    >
      <svg
        className="absolute inset-0 h-full w-full overflow-visible"
        viewBox="0 0 160 48"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          className="mesure-button__border"
          pathLength="100"
          d={ROUNDED_RECT_PATH}
          fill="transparent"
        />
      </svg>
      <span className="mesure-button__txt absolute inset-0 flex items-center justify-center font-medium">
        Mesure
      </span>
    </button>
  );
}
