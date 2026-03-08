import { Router, Request, Response } from "express";
import type { BlocMurDeStyle, BlocMurDeStyleInsert, BlocMurDeStyleUpdate } from "../services/mur-de-style/types.js";
import type { CatalogueBlocksStore } from "../services/catalogue/blocks-store.js";
import type { CatalogueBlocksStore } from "../services/catalogue/blocks-store.js";
import { isCatalogueSection } from "../services/catalogue/types.js";

function generateId(): string {
  return `bloc-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

const MIN_SLIDER_IMAGES = 5;
const MAX_SLIDER_IMAGES = 50;

const ALLOWED_UPDATE_KEYS: (keyof BlocMurDeStyleUpdate)[] = [
  "titre",
  "sousTitre",
  "imagesSlider",
  "imageGaucheUrl",
  "texteLong",
  "texteCourt",
  "slug",
  "ordre",
];

export type GetCatalogueStore = (section: string) => CatalogueBlocksStore | null;

export function createCatalogueRouter(
  getStore: GetCatalogueStore,
  sectionConfigStore: {
    getSubtitle: (section: string) => Promise<string | null>;
    setSubtitle: (section: string, value: string | null) => Promise<unknown>;
  }
): Router {
  const router = Router({ mergeParams: true });

  const getSection = (req: Request): string | null => {
    const section = req.params.section as string | undefined;
    return section && isCatalogueSection(section) ? section : null;
  };

  /** GET /catalogue/:section/config */
  router.get("/:section/config", async (req: Request, res: Response) => {
    const section = getSection(req);
    if (!section) {
      return res.status(400).json({ error: "Section invalide" });
    }
    try {
      const subtitle = await sectionConfigStore.getSubtitle(section);
      res.json({ subtitle });
    } catch (e) {
      console.error("GET catalogue/:section/config", e);
      res.status(500).json({ error: "Erreur lors de la lecture de la config" });
    }
  });

  /** PUT /catalogue/:section/config */
  router.put("/:section/config", async (req: Request, res: Response) => {
    const section = getSection(req);
    if (!section) {
      return res.status(400).json({ error: "Section invalide" });
    }
    try {
      const body = req.body as { subtitle?: string | null };
      const value =
        body.subtitle === undefined ? null : body.subtitle === "" ? null : String(body.subtitle);
      await sectionConfigStore.setSubtitle(section, value);
      const subtitle = await sectionConfigStore.getSubtitle(section);
      res.json({ subtitle });
    } catch (e) {
      console.error("PUT catalogue/:section/config", e);
      res.status(500).json({ error: "Erreur lors de la mise à jour de la config" });
    }
  });

  /** DELETE /catalogue/:section/config */
  router.delete("/:section/config", async (req: Request, res: Response) => {
    const section = getSection(req);
    if (!section) {
      return res.status(400).json({ error: "Section invalide" });
    }
    try {
      await sectionConfigStore.setSubtitle(section, null);
      res.status(204).send();
    } catch (e) {
      console.error("DELETE catalogue/:section/config", e);
      res.status(500).json({ error: "Erreur lors de la suppression du sous-titre" });
    }
  });

  /** GET /catalogue/:section/blocks */
  router.get("/:section/blocks", async (req: Request, res: Response) => {
    const section = getSection(req);
    const store = section ? getStore(section) : null;
    if (!store) {
      return res.status(400).json({ error: "Section invalide" });
    }
    try {
      const blocs = await store.readBlocs();
      const sorted = [...blocs].sort((a, b) => a.ordre - b.ordre || a.id.localeCompare(b.id));
      res.json(sorted);
    } catch (e) {
      console.error("GET catalogue/:section/blocks", e);
      res.status(500).json({ error: "Erreur lors de la lecture des blocs" });
    }
  });

  /** POST /catalogue/:section/blocks */
  router.post("/:section/blocks", async (req: Request, res: Response) => {
    const section = getSection(req);
    const store = section ? getStore(section) : null;
    if (!store) {
      return res.status(400).json({ error: "Section invalide" });
    }
    try {
      const body = req.body as BlocMurDeStyleInsert;
      const imagesSlider = Array.isArray(body.imagesSlider) ? body.imagesSlider : [];
      if (imagesSlider.length < MIN_SLIDER_IMAGES || imagesSlider.length > MAX_SLIDER_IMAGES) {
        return res.status(400).json({
          error: `Le slide doit contenir entre ${MIN_SLIDER_IMAGES} et ${MAX_SLIDER_IMAGES} images.`,
        });
      }
      const blocs = await store.readBlocs();
      const maxOrdre = blocs.length === 0 ? 0 : Math.max(...blocs.map((b) => b.ordre));
      const nouveau: BlocMurDeStyle = {
        id: generateId(),
        titre: body.titre ?? "",
        sousTitre: body.sousTitre ?? "",
        imagesSlider,
        imageGaucheUrl: body.imageGaucheUrl ?? "",
        texteLong: body.texteLong ?? "",
        texteCourt: body.texteCourt ?? "",
        slug: body.slug ?? "",
        ordre: body.ordre ?? maxOrdre + 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      blocs.push(nouveau);
      await store.writeBlocs(blocs);
      res.status(201).json(nouveau);
    } catch (e) {
      console.error("POST catalogue/:section/blocks", e);
      res.status(500).json({ error: "Erreur lors de la création du bloc" });
    }
  });

  /** GET /catalogue/:section/blocks/by-slug/:slug */
  router.get("/:section/blocks/by-slug/:slug", async (req: Request, res: Response) => {
    const section = getSection(req);
    const store = section ? getStore(section) : null;
    if (!store) {
      return res.status(400).json({ error: "Section invalide" });
    }
    try {
      const { slug } = req.params;
      const bloc = await store.getBlocBySlug(slug);
      if (!bloc) {
        return res.status(404).json({ error: "Bloc introuvable pour ce slug" });
      }
      res.json(bloc);
    } catch (e) {
      console.error("GET catalogue/:section/blocks/by-slug/:slug", e);
      res.status(500).json({ error: "Erreur lors de la lecture du bloc" });
    }
  });

  /** PATCH /catalogue/:section/blocks/reorder */
  router.patch("/:section/blocks/reorder", async (req: Request, res: Response) => {
    const section = getSection(req);
    const store = section ? getStore(section) : null;
    if (!store) {
      return res.status(400).json({ error: "Section invalide" });
    }
    try {
      const body = req.body as Array<{ id: string; ordre: number }>;
      if (!Array.isArray(body) || body.length === 0) {
        return res.status(400).json({ error: "Body attendu : [{ id, ordre }, ...]" });
      }
      const blocs = await store.readBlocs();
      const idSet = new Set(blocs.map((b) => b.id));
      const updates = body.filter((item) => typeof item.id === "string" && typeof item.ordre === "number");
      const missing = updates.filter((item) => !idSet.has(item.id));
      if (missing.length > 0) {
        return res.status(400).json({
          error: "Blocs introuvables",
          ids: missing.map((m) => m.id),
        });
      }
      const byId = new Map(blocs.map((b) => [b.id, b]));
      for (const { id, ordre } of updates) {
        const bloc = byId.get(id);
        if (bloc) bloc.ordre = ordre;
      }
      const sorted = [...blocs].sort((a, b) => a.ordre - b.ordre || a.id.localeCompare(b.id));
      await store.writeBlocs(sorted);
      res.json(sorted);
    } catch (e) {
      console.error("PATCH catalogue/:section/blocks/reorder", e);
      res.status(500).json({ error: "Erreur lors du réordonnancement" });
    }
  });

  /** GET /catalogue/:section/blocks/:id */
  router.get("/:section/blocks/:id", async (req: Request, res: Response) => {
    const section = getSection(req);
    const store = section ? getStore(section) : null;
    if (!store) {
      return res.status(400).json({ error: "Section invalide" });
    }
    try {
      const { id } = req.params;
      const bloc = await store.getBlocById(id);
      if (!bloc) {
        return res.status(404).json({ error: "Bloc introuvable" });
      }
      res.json(bloc);
    } catch (e) {
      console.error("GET catalogue/:section/blocks/:id", e);
      res.status(500).json({ error: "Erreur lors de la lecture du bloc" });
    }
  });

  /** PUT /catalogue/:section/blocks/:id */
  router.put("/:section/blocks/:id", async (req: Request, res: Response) => {
    const section = getSection(req);
    const store = section ? getStore(section) : null;
    if (!store) {
      return res.status(400).json({ error: "Section invalide" });
    }
    try {
      const { id } = req.params;
      const body = req.body as BlocMurDeStyleUpdate;
      if (body.imagesSlider !== undefined && Array.isArray(body.imagesSlider)) {
        if (
          body.imagesSlider.length < MIN_SLIDER_IMAGES ||
          body.imagesSlider.length > MAX_SLIDER_IMAGES
        ) {
          return res.status(400).json({
            error: `Le slide doit contenir entre ${MIN_SLIDER_IMAGES} et ${MAX_SLIDER_IMAGES} images.`,
          });
        }
      }
      const update: BlocMurDeStyleUpdate = {};
      for (const key of ALLOWED_UPDATE_KEYS) {
        if (key in body && body[key] !== undefined) {
          (update as Record<string, unknown>)[key] = body[key];
        }
      }
      const updated = await store.updateBloc(id, update);
      if (!updated) {
        return res.status(404).json({ error: "Bloc introuvable" });
      }
      res.json(updated);
    } catch (e) {
      console.error("PUT catalogue/:section/blocks/:id", e);
      res.status(500).json({ error: "Erreur lors de la modification du bloc" });
    }
  });

  /** DELETE /catalogue/:section/blocks/:id */
  router.delete("/:section/blocks/:id", async (req: Request, res: Response) => {
    const section = getSection(req);
    const store = section ? getStore(section) : null;
    if (!store) {
      return res.status(400).json({ error: "Section invalide" });
    }
    try {
      const { id } = req.params;
      const blocs = await store.readBlocs();
      const index = blocs.findIndex((b) => b.id === id);
      if (index === -1) {
        return res.status(404).json({ error: "Bloc introuvable" });
      }
      blocs.splice(index, 1);
      await store.writeBlocs(blocs);
      res.status(204).send();
    } catch (e) {
      console.error("DELETE catalogue/:section/blocks/:id", e);
      res.status(500).json({ error: "Erreur lors de la suppression du bloc" });
    }
  });

  return router;
}
