import { ROUTES } from "@/shared/constants";
import Link from "next/link";
import { Button } from "@/shared/ui";

/**
 * Page Design Studio — stub. Split View + Stanny's Code à implémenter dans features/studio.
 */
export default function StudioPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <h1 className="font-serif text-3xl font-semibold text-luxe-blanc">
        Design Studio
      </h1>
      <p className="mt-2 text-luxe-blanc-muted">
        Split View et annotations Stanny&apos;s Code — bientôt disponible.
      </p>
      <div className="mt-8">
        <Link href={ROUTES.CATALOGUE}>
          <Button variant="secondary">← Retour au catalogue</Button>
        </Link>
      </div>
    </div>
  );
}
