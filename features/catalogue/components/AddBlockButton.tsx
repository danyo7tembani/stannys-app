"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter, usePathname } from "next/navigation";
import { Button, Input } from "@/shared/ui";
import { apiUrl } from "@/shared/api/client";
import { slugify } from "@/shared/utils/slugify";
import { isCatalogueSection } from "@/shared/constants";
import type { CatalogueSection } from "@/shared/constants";
import type { BlocMurDeStyleInsert } from "@/lib/backend/mur-de-style/types";

/** Dimensions de la modale « Ajouter » — identiques à la modale « Modifier » (EditBlockModal). */
const ADD_MODAL_BACKDROP =
  "fixed inset-0 z-[100] flex min-h-screen items-center justify-center bg-black/70 p-4 sm:p-6";
const ADD_MODAL_PANEL =
  "relative my-auto max-h-[90vh] w-[min(94vw,52rem)] min-w-[320px] overflow-y-auto overflow-x-hidden rounded-lg border border-luxe-or/30 bg-luxe-noir p-6 shadow-xl";

const MIN_SLIDER_IMAGES = 5;
const MAX_SLIDER_IMAGES = 50;

function revokeUrls(urls: string[]) {
  urls.forEach((u) => {
    try {
      if (u.startsWith("blob:")) URL.revokeObjectURL(u);
    } catch (_) {}
  });
}

/** Déduit la section catalogue depuis l’URL (ex. /catalogue/vestes → vestes). Par défaut : vestes. */
function useCatalogueSection(): CatalogueSection {
  const pathname = usePathname() ?? "";
  const match = pathname.match(/^\/catalogue\/([^/]+)/);
  const section = match?.[1];
  return section && isCatalogueSection(section) ? section : "vestes";
}

export function AddBlockButton() {
  const router = useRouter();
  const section = useCatalogueSection();
  const slideInputRef = useRef<HTMLInputElement>(null);
  const panelInputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [form, setForm] = useState<BlocMurDeStyleInsert>({
    titre: "",
    sousTitre: "",
    imagesSlider: [],
    imageGaucheUrl: "",
    texteLong: "",
    texteCourt: "",
    slug: "",
  });
  const [slideFiles, setSlideFiles] = useState<File[]>([]);
  const [slidePreviewUrls, setSlidePreviewUrls] = useState<string[]>([]);
  const [panelFile, setPanelFile] = useState<File | null>(null);
  const [panelPreviewUrl, setPanelPreviewUrl] = useState<string | null>(null);

  const update = (key: keyof BlocMurDeStyleInsert, value: string | string[] | number) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError(null);
  };

  useEffect(() => {
    return () => {
      revokeUrls(slidePreviewUrls);
      if (panelPreviewUrl?.startsWith("blob:")) URL.revokeObjectURL(panelPreviewUrl);
    };
  }, [slidePreviewUrls, panelPreviewUrl]);

  const uploadFiles = async (files: FileList | File[], multiple: boolean): Promise<string | string[] | null> => {
    const list = Array.isArray(files) ? files : (files && Array.from(files)) || [];
    if (!list.length) return null;
    const formData = new FormData();
    if (multiple) {
      list.slice(0, MAX_SLIDER_IMAGES).forEach((f) => formData.append("files", f));
    } else {
      formData.append("file", list[0]);
    }
    const res = await fetch(apiUrl("upload"), { method: "POST", body: formData });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error ?? "Erreur upload");
    }
    const data = await res.json();
    return multiple ? (data.urls ?? []) : (data.url ?? null);
  };

  const onSlideImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    setError(null);
    const list = Array.from(files).slice(0, MAX_SLIDER_IMAGES - slidePreviewUrls.length);
    const newUrls = list.map((f) => URL.createObjectURL(f));
    setSlidePreviewUrls((prev) => {
      revokeUrls(prev);
      return newUrls;
    });
    setSlideFiles(list);
    e.target.value = "";
  };

  const onPanelImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    setError(null);
    const newUrl = URL.createObjectURL(files[0]);
    setPanelPreviewUrl((prev) => {
      if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
      return newUrl;
    });
    setPanelFile(files[0]);
    e.target.value = "";
  };

  const resetFormAndRevoke = () => {
    revokeUrls(slidePreviewUrls);
    if (panelPreviewUrl?.startsWith("blob:")) URL.revokeObjectURL(panelPreviewUrl);
    setSlideFiles([]);
    setSlidePreviewUrls([]);
    setPanelFile(null);
    setPanelPreviewUrl(null);
    setForm({
      titre: "",
      sousTitre: "",
      imagesSlider: [],
      imageGaucheUrl: "",
      texteLong: "",
      texteCourt: "",
      slug: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.titre?.trim()) {
      setError("Le titre est requis.");
      return;
    }
    const filesFromInput = slideInputRef.current?.files
      ? Array.from(slideInputRef.current.files).slice(0, MAX_SLIDER_IMAGES)
      : [];
    const filesToUploadSlide = slideFiles.length ? slideFiles : filesFromInput;
    if (!filesToUploadSlide.length) {
      setError(
        "Sélectionnez au moins une image pour le slide (bouton « Ouvrir (sélection multiple) » en haut du formulaire), puis validez avec Ouvrir dans la fenêtre."
      );
      return;
    }
    if (filesToUploadSlide.length < MIN_SLIDER_IMAGES) {
      setError(
        `Le slide doit contenir au moins ${MIN_SLIDER_IMAGES} images (actuellement ${filesToUploadSlide.length}).`
      );
      return;
    }
    setSending(true);
    try {
      const uploadSlide = await uploadFiles(filesToUploadSlide, true);
      const imagesSlider =
        uploadSlide && Array.isArray(uploadSlide) ? uploadSlide : [];
      if (!imagesSlider.length) {
        setError("L’upload des images du slide a échoué.");
        setSending(false);
        return;
      }
      let imageGaucheUrl = (form.imageGaucheUrl ?? "").trim();
      const panelFileFromInput = panelInputRef.current?.files?.[0];
      const fileToUploadPanel = panelFile ?? panelFileFromInput ?? null;
      if (fileToUploadPanel) {
        const url = await uploadFiles([fileToUploadPanel], false);
        if (url && typeof url === "string") imageGaucheUrl = url;
      }

      const res = await fetch(apiUrl(`catalogue/${section}/blocks`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titre: form.titre.trim(),
          sousTitre: "",
          imagesSlider,
          imageGaucheUrl,
          texteLong: (form.texteLong ?? "").trim(),
          texteCourt: (form.texteCourt ?? "").trim() || form.titre.trim(),
          slug: slugify(form.texteLong || form.titre),
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Erreur lors de l'ajout du bloc");
      }
      const createdBloc = await res.json();
      const previewSlider = [...slidePreviewUrls];
      const previewPanel = panelPreviewUrl;
      setError(null);
      setSuccessMessage("Section créée.");
      setTimeout(() => {
        setOpen(false);
        setSuccessMessage(null);
        setSlideFiles([]);
        setSlidePreviewUrls([]);
        setPanelFile(null);
        setPanelPreviewUrl(null);
        setForm({
          titre: "",
          sousTitre: "",
          imagesSlider: [],
          imageGaucheUrl: "",
          texteLong: "",
          texteCourt: "",
          slug: "",
        });
        window.dispatchEvent(
          new CustomEvent("catalogue-blocs-updated", {
            detail: {
              section,
              bloc: createdBloc,
              previewUrls: {
                imagesSlider: previewSlider,
                imageGaucheUrl: previewPanel,
              },
            },
          })
        );
        router.refresh();
      }, 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setSending(false);
    }
  };

  const handleClose = () => {
    if (sending) return;
    setSuccessMessage(null);
    setError(null);
    resetFormAndRevoke();
    setOpen(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="touch-manipulation rounded-sm border border-luxe-or/50 bg-luxe-or/10 px-5 py-2.5 text-sm font-medium text-luxe-or transition-colors hover:bg-luxe-or/20 focus:outline-none focus:ring-2 focus:ring-luxe-or focus:ring-offset-2 focus:ring-offset-luxe-noir min-h-[44px]"
      >
        Ajouter
      </button>

      {open &&
        createPortal(
          <div
            className={ADD_MODAL_BACKDROP}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <div className="absolute inset-0" onClick={handleClose} aria-hidden />
            <div className={ADD_MODAL_PANEL}>
            <h2 id="modal-title" className="mb-4 font-serif text-xl font-semibold text-luxe-or">
              Ajouter une section
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Titre (ex. Costumes)"
                value={form.titre}
                onChange={(e) => update("titre", e.target.value)}
                placeholder="Costumes"
                required
              />

              <input
                ref={slideInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={onSlideImagesChange}
              />
              <input
                ref={panelInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onPanelImageChange}
              />

              <div className="space-y-2">
                <span className="block text-sm font-medium text-luxe-blanc-muted">
                  Images du slide (min {MIN_SLIDER_IMAGES}, max {MAX_SLIDER_IMAGES})
                </span>
                <button
                  type="button"
                  onClick={() => slideInputRef.current?.click()}
                  disabled={sending}
                  className="flex w-full items-center justify-center gap-2 rounded-sm border border-dashed border-luxe-or/50 bg-luxe-noir-soft/50 py-4 text-luxe-or transition-colors hover:border-luxe-or hover:bg-luxe-or/10 disabled:opacity-50"
                >
                  {slidePreviewUrls.length
                    ? `${slidePreviewUrls.length} image(s) sélectionnée(s) — cliquer pour modifier`
                    : "Ouvrir (sélection multiple)"}
                </button>
                {slidePreviewUrls.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="block text-xs font-medium text-luxe-or/90">
                      Aperçu — {slidePreviewUrls.length} image(s) chargée(s)
                    </span>
                    <div className="flex min-h-[72px] gap-2 overflow-x-auto rounded border border-luxe-or/40 bg-luxe-noir-soft/50 p-2">
                      {slidePreviewUrls.map((url, i) => (
                        <div
                          key={`${url}-${i}`}
                          className="h-14 w-14 shrink-0 overflow-hidden rounded border border-luxe-or/50 bg-luxe-noir"
                        >
                          <img
                            src={url}
                            alt={`Aperçu ${i + 1}`}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <span className="block text-sm font-medium text-luxe-blanc-muted">
                  Image zone de droite (panneau « Voir plus »)
                </span>
                <button
                  type="button"
                  onClick={() => panelInputRef.current?.click()}
                  disabled={sending}
                  className="flex w-full items-center justify-center gap-2 rounded-sm border border-dashed border-luxe-or/50 bg-luxe-noir-soft/50 py-4 text-luxe-or transition-colors hover:border-luxe-or hover:bg-luxe-or/10 disabled:opacity-50"
                >
                  {panelPreviewUrl ? "Image choisie — cliquer pour remplacer" : "Ouvrir (galerie / machine)"}
                </button>
                {panelPreviewUrl && (
                  <div className="space-y-1.5">
                    <span className="block text-xs font-medium text-luxe-or/90">
                      Aperçu — image chargée
                    </span>
                    <div className="flex justify-center">
                      <div className="h-20 w-20 overflow-hidden rounded border-2 border-luxe-or/50 bg-luxe-noir">
                        <img
                          src={panelPreviewUrl}
                          alt="Aperçu panneau"
                          className="h-full w-full object-cover"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <Input
                label="Texte long (bande noire)"
                value={form.texteLong ?? ""}
                onChange={(e) => update("texteLong", e.target.value)}
                placeholder="Costume croisé Navy"
              />
              <Input
                label="Texte court (en bas)"
                value={form.texteCourt ?? ""}
                onChange={(e) => update("texteCourt", e.target.value)}
                placeholder="Costume"
              />
              {successMessage && (
                <p className="text-sm text-emerald-400" role="status">
                  {successMessage}
                </p>
              )}
              {error && (
                <p className="text-sm text-red-400" role="alert">
                  {error}
                </p>
              )}
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="ghost" onClick={handleClose} disabled={sending}>
                  Annuler
                </Button>
                <Button type="submit" variant="primary" disabled={sending}>
                  {sending ? "Enregistrement…" : "Enregistrer"}
                </Button>
              </div>
            </form>
          </div>
        </div>,
        document.body
        )}
    </>
  );
}
