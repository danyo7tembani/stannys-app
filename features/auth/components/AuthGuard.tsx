"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ROUTES } from "@/shared/constants";
import { useAuthStore } from "../store";
import { useInactivityLogout } from "../hooks";
import { NavMain } from "@/shared/layout";
import { PostLoginSplash } from "./PostLoginSplash";
import { BlockViewerSplash } from "./BlockViewerSplash";
import { MesureSplash } from "./MesureSplash";
import { ParametresSplash } from "./ParametresSplash";
import { VestesSplash } from "./VestesSplash";
import { ChaussuresSplash } from "./ChaussuresSplash";
import { AccessoiresSplash } from "./AccessoiresSplash";
import type { CatalogueSection } from "@/shared/constants";

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const role = useAuthStore((s) => s.role);
  const logout = useAuthStore((s) => s.logout);
  const showPostLoginSplash = useAuthStore((s) => s.showPostLoginSplash);
  const setShowPostLoginSplash = useAuthStore((s) => s.setShowPostLoginSplash);
  const showBlockViewerSplash = useAuthStore((s) => s.showBlockViewerSplash);
  const setShowBlockViewerSplash = useAuthStore((s) => s.setShowBlockViewerSplash);
  const showMesureSplash = useAuthStore((s) => s.showMesureSplash);
  const setShowMesureSplash = useAuthStore((s) => s.setShowMesureSplash);
  const showParametresSplash = useAuthStore((s) => s.showParametresSplash);
  const setShowParametresSplash = useAuthStore((s) => s.setShowParametresSplash);
  const showVestesSplash = useAuthStore((s) => s.showVestesSplash);
  const setShowVestesSplash = useAuthStore((s) => s.setShowVestesSplash);
  const showChaussuresSplash = useAuthStore((s) => s.showChaussuresSplash);
  const setShowChaussuresSplash = useAuthStore((s) => s.setShowChaussuresSplash);
  const showAccessoiresSplash = useAuthStore((s) => s.showAccessoiresSplash);
  const setShowAccessoiresSplash = useAuthStore((s) => s.setShowAccessoiresSplash);

  const getSectionFromPathname = (path: string): CatalogueSection | null => {
    if (path === ROUTES.CATALOGUE_SECTION("vestes") || path.startsWith(`${ROUTES.CATALOGUE_SECTION("vestes")}/`))
      return "vestes";
    if (
      path === ROUTES.CATALOGUE_SECTION("chaussures") ||
      path.startsWith(`${ROUTES.CATALOGUE_SECTION("chaussures")}/`)
    )
      return "chaussures";
    if (
      path === ROUTES.CATALOGUE_SECTION("accessoires") ||
      path.startsWith(`${ROUTES.CATALOGUE_SECTION("accessoires")}/`)
    )
      return "accessoires";
    return null;
  };

  const logoutAndRedirect = () => {
    logout();
    router.push(ROUTES.LOGIN);
  };

  useInactivityLogout(logoutAndRedirect, mounted && isAuthenticated);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (pathname === ROUTES.LOGIN) return;
    if (!isAuthenticated || !role) {
      if (isAuthenticated && !role) logout();
      router.replace(ROUTES.LOGIN);
      return;
    }
    if (role === "atelier") {
      if (
        pathname === ROUTES.HOME ||
        pathname.startsWith("/catalogue") ||
        pathname === ROUTES.PARAMETRES_HISTORIQUE
      ) {
        router.replace(ROUTES.DOSSIERS_ATELIER);
      }
    }
  }, [mounted, pathname, isAuthenticated, role, logout, router]);

  useEffect(() => {
    if (showPostLoginSplash && pathname !== ROUTES.LOGIN && isAuthenticated) {
      setShowPostLoginSplash(false);
    }
    if (showMesureSplash && (pathname === ROUTES.DOSSIER || pathname === ROUTES.MESURES)) {
      setShowMesureSplash(false);
    }
    if (showParametresSplash && pathname.startsWith(ROUTES.PARAMETRES)) {
      setShowParametresSplash(false);
    }
    if (showBlockViewerSplash && /^\/catalogue\/[^/]+\/[^/]+/.test(pathname)) {
      setShowBlockViewerSplash(false);
    }
  }, [
    pathname,
    isAuthenticated,
    showPostLoginSplash,
    showMesureSplash,
    showParametresSplash,
    showBlockViewerSplash,
    setShowPostLoginSplash,
    setShowMesureSplash,
    setShowParametresSplash,
    setShowBlockViewerSplash,
  ]);

  useEffect(() => {
    const pathnameSection = getSectionFromPathname(pathname);
    if (pathnameSection !== "vestes" && showVestesSplash) setShowVestesSplash(false);
    if (pathnameSection !== "chaussures" && showChaussuresSplash) setShowChaussuresSplash(false);
    if (pathnameSection !== "accessoires" && showAccessoiresSplash) setShowAccessoiresSplash(false);
  }, [
    pathname,
    showVestesSplash,
    showChaussuresSplash,
    showAccessoiresSplash,
    setShowVestesSplash,
    setShowChaussuresSplash,
    setShowAccessoiresSplash,
  ]);

  useEffect(() => {
    const onCatalogueSectionReady = (event: Event) => {
      const detail = (event as CustomEvent<{ section?: string }>).detail;
      const section = detail?.section;
      if (!section) return;
      if (pathname !== ROUTES.CATALOGUE_SECTION(section)) return;
      if (section === "vestes" && showVestesSplash) setShowVestesSplash(false);
      if (section === "chaussures" && showChaussuresSplash) setShowChaussuresSplash(false);
      if (section === "accessoires" && showAccessoiresSplash) setShowAccessoiresSplash(false);
    };
    window.addEventListener("catalogue-section-ready", onCatalogueSectionReady);
    return () => window.removeEventListener("catalogue-section-ready", onCatalogueSectionReady);
  }, [
    pathname,
    showVestesSplash,
    showChaussuresSplash,
    showAccessoiresSplash,
    setShowVestesSplash,
    setShowChaussuresSplash,
    setShowAccessoiresSplash,
  ]);

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-luxe-noir" aria-hidden="true" />
    );
  }

  if (pathname === ROUTES.LOGIN) {
    return <>{children}</>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <NavMain />
      <main className="flex min-h-[calc(100vh-4rem)] flex-col overflow-x-hidden">
        {children}
      </main>
      {showPostLoginSplash && <PostLoginSplash />}
      {showBlockViewerSplash && <BlockViewerSplash />}
      {showMesureSplash && <MesureSplash />}
      {showParametresSplash && <ParametresSplash />}
      {showVestesSplash && <VestesSplash />}
      {showChaussuresSplash && <ChaussuresSplash />}
      {showAccessoiresSplash && <AccessoiresSplash />}
    </>
  );
}
