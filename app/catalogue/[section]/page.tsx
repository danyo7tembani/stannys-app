import { redirect, notFound } from "next/navigation";
import { MurDeStyle } from "@/features/catalogue/components";
import { getCatalogueVetements } from "@/features/catalogue/services";
import { isCatalogueSection } from "@/shared/constants/catalogue";

interface PageProps {
  params: Promise<{ section: string }>;
}

export default async function CatalogueSectionPage({ params }: PageProps) {
  const { section } = await params;
  if (!isCatalogueSection(section)) {
    // Ancien lien /catalogue/[slug] → rediriger vers fiche vestes (compatibilité)
    redirect(`/catalogue/vestes/${encodeURIComponent(section)}`);
  }
  const vetements = getCatalogueVetements();
  return <MurDeStyle section={section} vetements={vetements} />;
}
