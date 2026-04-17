"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ROUTES, CATALOGUE_SECTIONS, CATALOGUE_SECTION_LABELS } from "@/shared/constants";
import type { CatalogueSection } from "@/shared/constants";
import { MesureButton } from "@/shared/ui";
import { AddBlockButton } from "@/features/catalogue/components";
import { SettingsLink } from "@/features/settings/components";
import { useAuthStore } from "@/features/auth/store";
import { canEditCatalogue } from "@/features/auth";
import { useMediaQuery } from "@/features/catalogue/hooks/useMediaQuery";

const SECTION_ICONS: Record<CatalogueSection, string> = {
  vestes: "/iconeVeste.png",
  chaussures: "/iconeChaussure.png",
  accessoires: "/iconeMontre.png",
};

/** Icône PNG utilisée en masque : prend la couleur du texte (currentColor) */
function NavSectionIcon({ section }: { section: CatalogueSection }) {
  const src = SECTION_ICONS[section];
  const isVeste = section === "vestes";
  return (
    <span
      className={`inline-block shrink-0 bg-current ${isVeste ? "h-4 w-4" : "h-5 w-5"}`}
      style={{
        maskImage: `url(${src})`,
        WebkitMaskImage: `url(${src})`,
        maskSize: "contain",
        maskRepeat: "no-repeat",
        maskPosition: "center",
        WebkitMaskSize: "contain",
        WebkitMaskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
      }}
      aria-hidden
    />
  );
}

function BurgerIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden
    >
      <path d="M3 6h18" />
      <path d="M3 12h18" />
      <path d="M3 18h18" />
    </svg>
  );
}

export function NavMain() {
  const pathname = usePathname() ?? "";
  const router = useRouter();
  const role = useAuthStore((s) => s.role);
  const setShowVestesSplash = useAuthStore((s) => s.setShowVestesSplash);
  const setShowChaussuresSplash = useAuthStore((s) => s.setShowChaussuresSplash);
  const setShowAccessoiresSplash = useAuthStore((s) => s.setShowAccessoiresSplash);
  const setShowMesureSplash = useAuthStore((s) => s.setShowMesureSplash);
  const setShowParametresSplash = useAuthStore((s) => s.setShowParametresSplash);
  const showAddBlock = canEditCatalogue(role);
  const isLecteur = role === "lecteur";
  const [menuOpen, setMenuOpen] = useState(false);
  // Certains appareils "tablette" rapportent une largeur CSS < 768 en portrait.
  // On classe tablette de façon plus robuste avec pointer coarse + plage 600..1024.
  const isPhone = useMediaQuery("(max-width: 599px)");
  const isTablet = useMediaQuery("(min-width: 600px) and (max-width: 1024px) and (pointer: coarse)");
  const isPortrait = useMediaQuery("(orientation: portrait)");
  const isTabletPortrait = isTablet && isPortrait;
  const showBurgerMenu = isPhone || isTabletPortrait;
  const burgerContainerRef = useRef<HTMLDivElement | null>(null);

  const sectionSplashSetters: Record<CatalogueSection, (value: boolean) => void> = {
    vestes: setShowVestesSplash,
    chaussures: setShowChaussuresSplash,
    accessoires: setShowAccessoiresSplash,
  };

  const handleSectionClick = (section: CatalogueSection) => {
    setMenuOpen(false);
    sectionSplashSetters[section](true);
    router.push(ROUTES.CATALOGUE_SECTION(section));
  };

  const handleMesureClick = () => {
    setMenuOpen(false);
    setShowMesureSplash(true);
    router.push(ROUTES.DOSSIER);
  };

  const handleParametresClick = () => {
    setMenuOpen(false);
    setShowParametresSplash(true);
    router.push(ROUTES.PARAMETRES);
  };

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname, showBurgerMenu]);

  useEffect(() => {
    if (role === "atelier") {
      router.prefetch(ROUTES.DOSSIERS_ATELIER);
      return;
    }
    router.prefetch(ROUTES.DOSSIER);
    router.prefetch(ROUTES.PARAMETRES);
    CATALOGUE_SECTIONS.forEach((section) => router.prefetch(ROUTES.CATALOGUE_SECTION(section)));
  }, [router, role]);

  useEffect(() => {
    if (!menuOpen) return;

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (burgerContainerRef.current?.contains(target)) return;
      setMenuOpen(false);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  return (
    <nav className="sticky top-0 z-50 border-b border-luxe-or-muted/30 bg-luxe-noir/95 backdrop-blur-sm print:hidden">
      <div className="relative mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 min-h-[3rem]">
        <Link href={ROUTES.HOME} className="brand-luxe touch-manipulation py-2 min-h-[44px] inline-flex items-center">
          <img
            src="/logo.png"
            alt="Stanny's"
            className="h-16 w-auto object-contain"
          />
        </Link>
        <div
          className={`absolute top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-14 sm:gap-[4rem] ${
            isTabletPortrait ? "left-[51%]" : "left-[42%]"
          }`}
        >
          {role === "atelier" ? (
            <Link
              href={ROUTES.DOSSIERS_ATELIER}
              className={`touch-manipulation text-sm font-medium transition-colors ${
                pathname === ROUTES.DOSSIERS_ATELIER ? "text-luxe-or" : "text-luxe-blanc hover:text-luxe-blanc-muted"
              }`}
            >
              Dossiers
            </Link>
          ) : isLecteur ? (
            CATALOGUE_SECTIONS.map((section) => {
              const href = ROUTES.CATALOGUE_SECTION(section);
              const isActive = pathname === href || pathname.startsWith(`${href}/`);
              return (
                <button
                  key={section}
                  type="button"
                  onClick={() => handleSectionClick(section)}
                  className={`touch-manipulation inline-flex items-center gap-2 text-sm font-medium transition-colors ${
                    isActive ? "text-luxe-or" : "text-luxe-blanc hover:text-luxe-blanc-muted"
                  }`}
                >
                  <NavSectionIcon section={section} />
                  {CATALOGUE_SECTION_LABELS[section]}
                </button>
              );
            })
          ) : (
            showAddBlock && <AddBlockButton />
          )}
        </div>
        {showBurgerMenu ? (
          <div ref={burgerContainerRef} className="relative flex items-center">
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-luxe-or-muted/40 text-luxe-blanc-muted transition-colors hover:border-luxe-or/50 hover:text-luxe-or focus:outline-none focus:ring-2 focus:ring-luxe-or/50"
              aria-label="Ouvrir le menu"
              aria-expanded={menuOpen}
            >
              <BurgerIcon />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-12 z-50 min-w-[220px] rounded-xl border border-luxe-or-muted/40 bg-luxe-noir/95 p-2 shadow-xl backdrop-blur-sm">
                {isPhone && (
                  <>
                    {CATALOGUE_SECTIONS.map((section) => (
                      <button
                        key={section}
                        type="button"
                        onClick={() => handleSectionClick(section)}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-luxe-blanc hover:bg-luxe-or/10"
                      >
                        <NavSectionIcon section={section} />
                        {CATALOGUE_SECTION_LABELS[section]}
                      </button>
                    ))}
                    <div className="my-1 h-px w-full bg-luxe-or-muted/30" />
                  </>
                )}
                <button
                  type="button"
                  onClick={handleMesureClick}
                  className="flex w-full items-center rounded-lg px-3 py-2 text-left text-sm text-luxe-blanc hover:bg-luxe-or/10"
                >
                  Mesure
                </button>
                <button
                  type="button"
                  onClick={handleParametresClick}
                  className="flex w-full items-center rounded-lg px-3 py-2 text-left text-sm text-luxe-blanc hover:bg-luxe-or/10"
                >
                  Paramètres
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center">
            <MesureButton />
            <div className="ml-24">
              <SettingsLink />
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
