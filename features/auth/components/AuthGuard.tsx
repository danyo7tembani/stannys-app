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
    if (!showPostLoginSplash) return;
    const t = setTimeout(() => setShowPostLoginSplash(false), 2000);
    return () => clearTimeout(t);
  }, [showPostLoginSplash, setShowPostLoginSplash]);

  useEffect(() => {
    if (!showBlockViewerSplash) return;
    const t = setTimeout(() => setShowBlockViewerSplash(false), 1000);
    return () => clearTimeout(t);
  }, [showBlockViewerSplash, setShowBlockViewerSplash]);

  useEffect(() => {
    if (!showMesureSplash) return;
    const t = setTimeout(() => setShowMesureSplash(false), 1000);
    return () => clearTimeout(t);
  }, [showMesureSplash, setShowMesureSplash]);

  useEffect(() => {
    if (!showParametresSplash) return;
    const t = setTimeout(() => setShowParametresSplash(false), 1000);
    return () => clearTimeout(t);
  }, [showParametresSplash, setShowParametresSplash]);

  useEffect(() => {
    if (!showVestesSplash) return;
    const t = setTimeout(() => setShowVestesSplash(false), 1000);
    return () => clearTimeout(t);
  }, [showVestesSplash, setShowVestesSplash]);

  useEffect(() => {
    if (!showChaussuresSplash) return;
    const t = setTimeout(() => setShowChaussuresSplash(false), 1000);
    return () => clearTimeout(t);
  }, [showChaussuresSplash, setShowChaussuresSplash]);

  useEffect(() => {
    if (!showAccessoiresSplash) return;
    const t = setTimeout(() => setShowAccessoiresSplash(false), 1000);
    return () => clearTimeout(t);
  }, [showAccessoiresSplash, setShowAccessoiresSplash]);

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
