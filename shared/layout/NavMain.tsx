"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ROUTES, CATALOGUE_SECTIONS, CATALOGUE_SECTION_LABELS } from "@/shared/constants";
import type { CatalogueSection } from "@/shared/constants";
import { MesureButton } from "@/shared/ui";
import { AddBlockButton } from "@/features/catalogue/components";
import { SettingsLink } from "@/features/settings/components";
import { useAuthStore } from "@/features/auth/store";
import { canEditCatalogue } from "@/features/auth";

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

export function NavMain() {
  const pathname = usePathname() ?? "";
  const router = useRouter();
  const role = useAuthStore((s) => s.role);
  const setShowVestesSplash = useAuthStore((s) => s.setShowVestesSplash);
  const setShowChaussuresSplash = useAuthStore((s) => s.setShowChaussuresSplash);
  const setShowAccessoiresSplash = useAuthStore((s) => s.setShowAccessoiresSplash);
  const showAddBlock = canEditCatalogue(role);
  const isLecteur = role === "lecteur";

  const sectionSplashSetters: Record<CatalogueSection, (value: boolean) => void> = {
    vestes: setShowVestesSplash,
    chaussures: setShowChaussuresSplash,
    accessoires: setShowAccessoiresSplash,
  };

  const handleSectionClick = (section: CatalogueSection) => {
    sectionSplashSetters[section](true);
    router.push(ROUTES.CATALOGUE_SECTION(section));
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-luxe-or-muted/30 bg-luxe-noir/95 backdrop-blur-sm print:hidden">
      <div className="relative mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 min-h-[3rem]">
        <Link href={ROUTES.HOME} className="brand-luxe touch-manipulation py-2 min-h-[44px] inline-flex items-center">
          <img
            src="/logo.png"
            alt="Stanny's"
            className="h-10 w-auto object-contain"
          />
        </Link>
        <div className="absolute left-[42%] top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-14 sm:gap-[4rem]">
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
        <div className="flex items-center">
          <MesureButton />
          <div className="ml-24">
            <SettingsLink />
          </div>
        </div>
      </div>
    </nav>
  );
}
