import { redirect, notFound } from "next/navigation";
import dynamic from "next/dynamic";
import { getCatalogueVetements, getVetementBySlug } from "@/features/catalogue/services";
import type { BlocMurDeStyle } from "@/lib/backend/mur-de-style/types";
import { isCatalogueSection } from "@/shared/constants/catalogue";

const ViewerHD = dynamic(
  () => import("@/features/catalogue/components").then((m) => m.ViewerHD),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[50vh] items-center justify-center text-luxe-blanc-muted">
        Chargement…
      </div>
    ),
  }
);

const getApiBase = () =>
  typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_URL
    ? process.env.NEXT_PUBLIC_API_URL
    : "http://localhost:4000";

interface PageProps {
  params: Promise<{ section: string; slug: string }>;
}

export default async function CatalogueItemPage({ params }: PageProps) {
  const { section, slug } = await params;
  if (!isCatalogueSection(section)) {
    notFound();
  }
  const apiBase = getApiBase();
  let bloc: BlocMurDeStyle | null = null;
  try {
    const res = await fetch(
      `${apiBase.replace(/\/$/, "")}/catalogue/${section}/blocks/by-slug/${encodeURIComponent(slug)}`,
      { cache: "no-store" }
    );
    if (res.ok) bloc = (await res.json()) as BlocMurDeStyle;
  } catch {
    // pas de bloc
  }
  if (bloc) {
    return <ViewerHD bloc={bloc} section={section} />;
  }
  const vetement = getVetementBySlug(slug);
  if (!vetement) {
    const catalogue = getCatalogueVetements();
    const firstSlug = catalogue[0]?.slug ?? "costume-croise-navy";
    redirect(`/catalogue/vestes/${firstSlug}`);
  }
  return <ViewerHD vetement={vetement} section={section} />;
}
