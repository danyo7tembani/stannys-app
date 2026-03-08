"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ROUTES, CATALOGUE_SECTION_LABELS } from "@/shared/constants";
import type { CatalogueSection } from "@/shared/constants";
import { useAuthStore } from "@/features/auth/store";

export interface CatalogueSectionSwitcherProps {
  currentSection: CatalogueSection;
}

export function CatalogueSectionSwitcher({ currentSection }: CatalogueSectionSwitcherProps) {
  const router = useRouter();
  const setShowVestesSplash = useAuthStore((s) => s.setShowVestesSplash);
  const setShowChaussuresSplash = useAuthStore((s) => s.setShowChaussuresSplash);
  const setShowAccessoiresSplash = useAuthStore((s) => s.setShowAccessoiresSplash);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const sectionSplashSetters: Record<CatalogueSection, (value: boolean) => void> = {
    vestes: setShowVestesSplash,
    chaussures: setShowChaussuresSplash,
    accessoires: setShowAccessoiresSplash,
  };

  const handleSectionClick = (section: CatalogueSection) => {
    sectionSplashSetters[section](true);
    router.push(ROUTES.CATALOGUE_SECTION(section));
    setOpen(false);
  };

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const sections: CatalogueSection[] = ["vestes", "chaussures", "accessoires"];
  const currentLabel = CATALOGUE_SECTION_LABELS[currentSection];

  return (
    <div className="relative shrink-0" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded border border-luxe-or/50 bg-luxe-noir-soft/80 px-4 py-2.5 text-sm font-medium text-luxe-or transition-colors hover:bg-luxe-or/10 min-h-[44px] touch-manipulation"
        aria-expanded={open}
        aria-haspopup="true"
        aria-label={`Section catalogue : ${currentLabel}`}
      >
        <span>{currentLabel}</span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden
        >
          <path d="M4 6l4 4 4-4" />
        </svg>
      </button>
      {open && (
        <div
          className="absolute left-0 top-full z-20 mt-1 min-w-[11rem] rounded border border-luxe-or/30 bg-luxe-noir py-1 shadow-xl"
          role="menu"
        >
          {sections.map((section) => {
            const label = CATALOGUE_SECTION_LABELS[section];
            const isActive = section === currentSection;
            return (
              <button
                key={section}
                type="button"
                role="menuitem"
                onClick={() => handleSectionClick(section)}
                className={`block w-full px-4 py-2.5 text-left text-sm transition-colors ${
                  isActive
                    ? "bg-luxe-or/20 text-luxe-or font-medium"
                    : "text-luxe-blanc hover:bg-luxe-or/10"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
