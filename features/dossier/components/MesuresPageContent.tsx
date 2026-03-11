"use client";

import { useRef, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { ROUTES } from "@/shared/constants";
import { Button, Input } from "@/shared/ui";
import { getImageUrl } from "@/shared/api/client";
import { useDossierStore, useDossiersHistoryStore } from "../store";
import { isMesuresStepValid } from "../services";
import { GROUPES_MESURES, MIN_MESURES_PAR_GROUPE } from "../constants/mesures";
import Image from "next/image";
import type { ImageChoixModele } from "../types";
import type { AnnotationShape } from "../types";

const DesignStudioModal = dynamic(
  () => import("./DesignStudioModal").then((m) => m.DesignStudioModal),
  { ssr: false }
);

const LONG_PRESS_MS = 500;

export function MesuresPageContent() {
  const router = useRouter();
  const dossier = useDossierStore((s) => s.dossier);
  const setDossier = useDossierStore((s) => s.setDossier);
  const setSelectionMode = useDossierStore((s) => s.setSelectionMode);
  const setSelectionFor = useDossierStore((s) => s.setSelectionFor);
  const setSelectedChaussures = useDossierStore((s) => s.setSelectedChaussures);
  const setSelectedAccessoires = useDossierStore((s) => s.setSelectedAccessoires);
  const clearSelection = useDossierStore((s) => s.clearSelection);
  const reset = useDossierStore((s) => s.reset);
  const addDossierToHistory = useDossiersHistoryStore((s) => s.addDossier);
  const [justSaved, setJustSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const mesures = dossier.mesures ?? {};
  const canValidate = isMesuresStepValid(dossier);
  const hasChoixModele = Boolean(dossier.imageBaseOr);
  const imagesComparaisonBleu = dossier.imagesComparaisonBleu ?? [];
  const imagesChaussures = dossier.imagesChaussures ?? [];
  const imagesAccessoires = dossier.imagesAccessoires ?? [];

  const [openAnnotation, setOpenAnnotation] = useState<{
    type: "or" | "bleu";
    index: number;
    image: ImageChoixModele;
  } | null>(null);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressHandledRef = useRef(false);

  const handleChoixModele = () => {
    setSelectionMode(true);
    router.push(ROUTES.CATALOGUE_SECTION("vestes"));
  };

  const handleMesureChange = (id: string, value: string) => {
    if (value === "") {
      const next = { ...mesures };
      delete next[id];
      setDossier({ mesures: next });
      return;
    }
    const num = parseFloat(value.replace(",", "."));
    if (Number.isNaN(num) || num < 0) return;
    setDossier({
      mesures: { ...mesures, [id]: num },
    });
  };

  const openDesignStudio = useCallback((type: "or" | "bleu", index: number, image: ImageChoixModele) => {
    setOpenAnnotation({ type, index, image });
  }, []);

  const getInitialShapes = useCallback(
    (type: "or" | "bleu", index: number): AnnotationShape[] => {
      const ann = dossier.annotations;
      if (type === "or") return ann?.or ?? [];
      return ann?.bleu?.[index] ?? [];
    },
    [dossier.annotations]
  );

  const handleSaveAnnotations = useCallback(
    (type: "or" | "bleu", index: number, shapes: AnnotationShape[]) => {
      const prev = dossier.annotations ?? {};
      if (type === "or") {
        setDossier({ annotations: { ...prev, or: shapes } });
      } else {
        const bleu = [...(prev.bleu ?? [])];
        bleu[index] = shapes;
        setDossier({ annotations: { ...prev, bleu } });
      }
    },
    [dossier.annotations, setDossier]
  );

  const handleLongPressStart = useCallback(
    (type: "or" | "bleu", index: number, image: ImageChoixModele) => {
      longPressHandledRef.current = false;
      longPressTimerRef.current = setTimeout(() => {
        longPressTimerRef.current = null;
        longPressHandledRef.current = true;
        openDesignStudio(type, index, image);
      }, LONG_PRESS_MS);
    },
    [openDesignStudio]
  );

  const handleLongPressEnd = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);


  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <Link
          href={ROUTES.DOSSIER}
          className="inline-flex items-center justify-center rounded border border-luxe-or-muted/40 bg-luxe-noir-soft px-4 py-2 text-sm font-medium text-luxe-or transition-colors hover:border-luxe-or/50 hover:bg-white/5"
        >
          Retour
        </Link>
      </div>
      <h1 className="font-serif text-3xl font-semibold text-luxe-blanc">
        Saisie des mesures
      </h1>
      <p className="mt-2 text-luxe-blanc-muted">
        Au moins {MIN_MESURES_PAR_GROUPE} mesures par section doivent être renseignées. Valeurs en décimal (ex. 42,5).
      </p>

      <section className="mt-8">
        <h2 className="font-serif text-xl font-medium text-luxe-or">
          Choix de modèle
        </h2>
        <p className="mt-1 text-sm text-luxe-blanc-muted">
          Sélectionnez une image de base (OR) et jusqu&apos;à 3 images de comparaison (BLEU) dans le catalogue Vestes.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <Button
            type="button"
            variant="secondary"
            onClick={handleChoixModele}
          >
            Choix de modèle
          </Button>
          {hasChoixModele && (
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm text-luxe-blanc-muted">
                Image de base (OR) + {imagesComparaisonBleu.length} comparaison(s) (BLEU)
              </span>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  clearSelection();
                  setDossier({ imageBaseOr: undefined, imagesComparaisonBleu: undefined });
                  setSelectionMode(true);
                  router.push(ROUTES.CATALOGUE_SECTION("vestes"));
                }}
                className="text-sm"
              >
                Changer la sélection
              </Button>
            </div>
          )}
        </div>
        {hasChoixModele && dossier.imageBaseOr && (
          <>
            <p className="mt-2 text-xs text-luxe-blanc-muted">
              Double-clic (PC) ou maintenir (tablette) sur une image pour l’agrandir et annoter.
            </p>
            <div className="mt-4 flex flex-wrap gap-6">
              <div className="flex flex-col items-center gap-2">
                <div
                  className="relative h-40 w-32 cursor-pointer overflow-hidden rounded-lg border-2 border-amber-400/80 bg-luxe-noir-soft transition-opacity hover:opacity-90 active:opacity-95"
                  role="button"
                  tabIndex={0}
                  onDoubleClick={() => openDesignStudio("or", 0, dossier.imageBaseOr!)}
                  onTouchStart={() => handleLongPressStart("or", 0, dossier.imageBaseOr!)}
                  onTouchEnd={handleLongPressEnd}
                  onTouchCancel={handleLongPressEnd}
                  aria-label="Annoter l’image de base (OR)"
                >
                  <Image
                    src={getImageUrl(dossier.imageBaseOr.imageUrl) || dossier.imageBaseOr.imageUrl}
                    alt={dossier.imageBaseOr.titre ?? "Base (OR)"}
                    fill
                    className="object-cover"
                    sizes="128px"
                    unoptimized={dossier.imageBaseOr.imageUrl.startsWith("blob:")}
                  />
                </div>
                <span className="text-sm font-medium text-amber-400">OR (base)</span>
              </div>
              {imagesComparaisonBleu.map((img, i) => (
                <div key={`${img.blockId}-${img.imageUrl}-${i}`} className="flex flex-col items-center gap-2">
                  <div
                    className="relative h-40 w-32 cursor-pointer overflow-hidden rounded-lg border-2 border-blue-400/80 bg-luxe-noir-soft transition-opacity hover:opacity-90 active:opacity-95"
                    role="button"
                    tabIndex={0}
                    onDoubleClick={() => openDesignStudio("bleu", i, img)}
                    onTouchStart={() => handleLongPressStart("bleu", i, img)}
                    onTouchEnd={handleLongPressEnd}
                    onTouchCancel={handleLongPressEnd}
                    aria-label={`Annoter la comparaison BLEU ${i + 1}`}
                  >
                    <Image
                      src={getImageUrl(img.imageUrl) || img.imageUrl}
                      alt={img.titre ?? `Comparaison ${i + 1}`}
                      fill
                      className="object-cover"
                      sizes="128px"
                      unoptimized={img.imageUrl.startsWith("blob:")}
                    />
                  </div>
                  <span className="text-sm font-medium text-blue-400">BLEU {i + 1}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {openAnnotation &&
          typeof document !== "undefined" &&
          createPortal(
            <DesignStudioModal
              image={openAnnotation.image}
              imageType={openAnnotation.type}
              imageLabel={openAnnotation.type === "or" ? "OR (base)" : `BLEU ${openAnnotation.index + 1}`}
              initialShapes={getInitialShapes(openAnnotation.type, openAnnotation.index)}
              onClose={() => setOpenAnnotation(null)}
              onSave={(shapes) => {
                handleSaveAnnotations(openAnnotation.type, openAnnotation.index, shapes);
                setOpenAnnotation(null);
              }}
            />,
            document.body
          )}
      </section>

      <form className="mt-10 space-y-12">
        {GROUPES_MESURES.map((groupe) => (
          <section key={groupe.titre}>
            <h2 className="font-serif text-xl font-medium text-luxe-or">
              {groupe.titre}
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {groupe.mesures.map((m) => (
                <Input
                  key={m.id}
                  label={m.label}
                  type="number"
                  inputMode="decimal"
                  step={0.01}
                  min={0}
                  value={mesures[m.id] != null ? String(mesures[m.id]) : ""}
                  onChange={(e) => handleMesureChange(m.id, e.target.value)}
                  placeholder="—"
                  className="w-full"
                />
              ))}
            </div>
          </section>
        ))}
      </form>

      <section className="mt-10">
        <h2 className="font-serif text-xl font-medium text-luxe-or">
          Choix de chaussures
        </h2>
        <p className="mt-1 text-sm text-luxe-blanc-muted">
          Jusqu&apos;à 3 images dans le catalogue Chaussures (optionnel).
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setSelectedChaussures(imagesChaussures);
              setSelectionFor("chaussures");
              router.push(ROUTES.CATALOGUE_SECTION("chaussures"));
            }}
          >
            Choix de chaussures
          </Button>
          {imagesChaussures.length > 0 && (
            <>
              <span className="text-sm text-luxe-blanc-muted">
                {imagesChaussures.length} image(s) sélectionnée(s)
              </span>
              <Button
                type="button"
                variant="secondary"
                className="text-sm"
                onClick={() => {
                  setSelectedChaussures(imagesChaussures);
                  setSelectionFor("chaussures");
                  router.push(ROUTES.CATALOGUE_SECTION("chaussures"));
                }}
              >
                Changer la sélection
              </Button>
            </>
          )}
        </div>
        {imagesChaussures.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-3">
            {imagesChaussures.map((img, i) => (
              <div
                key={`ch-${img.blockId}-${img.imageUrl}-${i}`}
                className="relative h-24 w-20 overflow-hidden rounded border border-luxe-or-muted/40 bg-luxe-noir-soft"
              >
                <Image
                  src={getImageUrl(img.imageUrl) || img.imageUrl}
                  alt={img.titre ?? `Chaussure ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="80px"
                  unoptimized={img.imageUrl.startsWith("blob:")}
                />
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mt-10">
        <h2 className="font-serif text-xl font-medium text-luxe-or">
          Choix d&apos;accessoires
        </h2>
        <p className="mt-1 text-sm text-luxe-blanc-muted">
          Jusqu&apos;à 15 images dans le catalogue Accessoires (optionnel).
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setSelectedAccessoires(imagesAccessoires);
              setSelectionFor("accessoires");
              router.push(ROUTES.CATALOGUE_SECTION("accessoires"));
            }}
          >
            Choix d&apos;accessoires
          </Button>
          {imagesAccessoires.length > 0 && (
            <>
              <span className="text-sm text-luxe-blanc-muted">
                {imagesAccessoires.length} image(s) sélectionnée(s)
              </span>
              <Button
                type="button"
                variant="secondary"
                className="text-sm"
                onClick={() => {
                  setSelectedAccessoires(imagesAccessoires);
                  setSelectionFor("accessoires");
                  router.push(ROUTES.CATALOGUE_SECTION("accessoires"));
                }}
              >
                Changer la sélection
              </Button>
            </>
          )}
        </div>
        {imagesAccessoires.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-3">
            {imagesAccessoires.map((img, i) => (
              <div
                key={`acc-${img.blockId}-${img.imageUrl}-${i}`}
                className="relative h-24 w-20 overflow-hidden rounded border border-luxe-or-muted/40 bg-luxe-noir-soft"
              >
                <Image
                  src={getImageUrl(img.imageUrl) || img.imageUrl}
                  alt={img.titre ?? `Accessoire ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="80px"
                  unoptimized={img.imageUrl.startsWith("blob:")}
                />
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="mt-12 flex flex-wrap justify-end gap-4">
        {justSaved && (
          <p className="w-full text-center text-sm text-luxe-or sm:w-auto">
            Dossier enregistré.{" "}
            <Link href={ROUTES.PARAMETRES_HISTORIQUE} className="underline">
              Voir l’historique
            </Link>
          </p>
        )}
        {saveError && (
          <p className="text-sm text-red-400">{saveError}</p>
        )}
        {canValidate ? (
          <Button
            variant="primary"
            onClick={async () => {
              setSaveError(null);
              try {
                await addDossierToHistory(dossier);
                reset();
                setJustSaved(true);
                setTimeout(() => setJustSaved(false), 5000);
              } catch (e) {
                setSaveError(e instanceof Error ? e.message : "Erreur lors de l'enregistrement");
              }
            }}
          >
            Enregistrer les mesures
          </Button>
        ) : (
          <p className="self-center text-sm text-luxe-blanc-muted">
            {!hasChoixModele
              ? "Sélectionnez un modèle (Choix de modèle) pour pouvoir enregistrer."
              : `Renseignez au moins ${MIN_MESURES_PAR_GROUPE} mesures par section.`}
          </p>
        )}
      </div>
    </div>
  );
}
