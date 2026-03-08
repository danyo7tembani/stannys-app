"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/shared/constants";
import { HistoriqueDossiersContent } from "@/features/dossier/components";
import { useAuthStore } from "@/features/auth/store";

export default function DossiersStatutPage() {
  const router = useRouter();
  const role = useAuthStore((s) => s.role);

  useEffect(() => {
    if (role !== "admin") {
      router.replace(ROUTES.PARAMETRES);
    }
  }, [role, router]);

  if (role !== "admin") {
    return null;
  }
  return <HistoriqueDossiersContent mode="admin-statut" />;
}
