import dynamic from "next/dynamic";

const DossierDetailContent = dynamic(
  () => import("@/features/dossier/components").then((m) => m.DossierDetailContent),
  {
    ssr: false,
    loading: () => (
      <div className="mx-auto max-w-3xl px-4 py-8 text-luxe-blanc-muted">
        Chargement du dossier…
      </div>
    ),
  }
);

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DossierDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <DossierDetailContent id={id} />;
}
