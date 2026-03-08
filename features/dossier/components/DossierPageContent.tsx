"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/shared/constants";
import { Button } from "@/shared/ui";
import { useAuthStore } from "@/features/auth/store";
import { FormulaireDossier, CapturePhoto } from "./index";
import { useDossierStore } from "../store";
import { isDossierStepValid } from "../services";

export function DossierPageContent() {
  const router = useRouter();
  const setShowMesureSplash = useAuthStore((s) => s.setShowMesureSplash);
  const dossier = useDossierStore((s) => s.dossier);
  const setPhotoFaciale = useDossierStore((s) => s.setPhotoFaciale);
  const setPhotoCorps = useDossierStore((s) => s.setPhotoCorps);
  const canContinue = isDossierStepValid(dossier);

  const handleRetour = () => {
    setShowMesureSplash(true);
    router.push(ROUTES.HOME);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <button
          type="button"
          onClick={handleRetour}
          className="inline-flex items-center justify-center rounded border border-luxe-or-muted/40 bg-luxe-noir-soft px-4 py-2 text-sm font-medium text-luxe-or transition-colors hover:border-luxe-or/50 hover:bg-white/5"
        >
          Retour
        </button>
      </div>
      <h1 className="font-serif text-3xl font-semibold text-luxe-blanc">
        Création du Dossier Client
      </h1>
      <p className="mt-2 text-luxe-blanc-muted">
        Saisissez les informations et les photos de référence pour le tailleur
        (carnation, posture).
      </p>

      <section className="mt-10">
        <div className="mb-4 grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <span className="block text-sm font-medium text-luxe-blanc-muted">
              Date de dépôt
            </span>
            <p className="rounded border border-luxe-or-muted/40 bg-luxe-noir/50 px-3 py-2 text-sm text-luxe-blanc-muted">
              Remplie automatiquement à l&apos;enregistrement
            </p>
          </div>
          <div className="space-y-1">
            <label
              htmlFor="date-livraison"
              className="block text-sm font-medium text-luxe-blanc-muted"
            >
              Date de livraison
            </label>
            <input
              id="date-livraison"
              name="dateLivraison"
              type="date"
              value={dossier.dateLivraison ?? ""}
              onChange={(e) =>
                useDossierStore.getState().setDossier({
                  dateLivraison: e.target.value,
                })
              }
              className="input-luxe w-full rounded border border-luxe-or-muted/40 bg-luxe-noir px-3 py-2 text-luxe-blanc focus:border-luxe-or focus:outline-none"
            />
          </div>
        </div>
        <h2 className="font-serif text-xl font-medium text-luxe-or">
          Informations personnelles
        </h2>
        <div className="mt-4">
          <FormulaireDossier />
        </div>
      </section>

      <section className="mt-12">
        <h2 className="font-serif text-xl font-medium text-luxe-or">
          Capture identitaire
        </h2>
        <p className="mt-1 text-sm text-luxe-blanc-muted">
          Ces photos servent de calques de référence au tailleur (posture,
          épaules, dos).
        </p>
        <div className="mt-6 grid gap-8 sm:grid-cols-2">
          <CapturePhoto
            label="Photo faciale (carnation / visage)"
            description="Pour l'équilibre des proportions et le visage."
            value={dossier.photoFaciale}
            onCapture={setPhotoFaciale}
            mode="faciale"
          />
          <CapturePhoto
            label="Photo corps entier (posture / morphologie)"
            description="Pour la posture : épaules tombantes, dos cambré, etc."
            value={dossier.photoCorps}
            onCapture={setPhotoCorps}
            mode="corps"
          />
        </div>
      </section>

      <div className="mt-12 flex justify-end gap-4">
        <Button variant="secondary">Enregistrer brouillon</Button>
        {canContinue ? (
          <Link href={ROUTES.MESURES}>
            <Button variant="primary">Continuer vers les mesures →</Button>
          </Link>
        ) : (
          <Button variant="primary" disabled>
            Continuer vers les mesures →
          </Button>
        )}
      </div>
    </div>
  );
}
