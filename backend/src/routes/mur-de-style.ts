import { Router, Request, Response } from "express";
import type { BlocMurDeStyle, BlocMurDeStyleInsert, BlocMurDeStyleUpdate } from "../services/mur-de-style/types.js";

type MurDeStyleStore = ReturnType<typeof import("../services/mur-de-style/store.js").createStore>;
type SectionConfigStore = ReturnType<typeof import("../services/section-config/store.js").createSectionConfigStore>;

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

export function createMurDeStyleRouter(store: MurDeStyleStore, sectionConfigStore: SectionConfigStore): Router {
  const router = Router();

  /** GET /mur-de-style/config : config de la section (sous-titre global) */
  router.get("/config", async (_req: Request, res: Response) => {
    try {
      const config = await sectionConfigStore.readConfig();
      res.json(config);
    } catch (e) {
      console.error("GET /mur-de-style/config", e);
      res.status(500).json({ error: "Erreur lors de la lecture de la config" });
    }
  });

  /** PUT /mur-de-style/config : modifier le sous-titre global (body: { murDeStyleSubtitle: string | null }) */
  router.put("/config", async (req: Request, res: Response) => {
    try {
      const body = req.body as { murDeStyleSubtitle?: string | null };
      const value =
        body.murDeStyleSubtitle === undefined
          ? null
          : body.murDeStyleSubtitle === ""
            ? null
            : String(body.murDeStyleSubtitle);
      const config = await sectionConfigStore.setMurDeStyleSubtitle(value);
      res.json(config);
    } catch (e) {
      console.error("PUT /mur-de-style/config", e);
      res.status(500).json({ error: "Erreur lors de la mise à jour de la config" });
    }
  });

  /** DELETE /mur-de-style/config : supprimer le sous-titre global */
  router.delete("/config", async (_req: Request, res: Response) => {
    try {
      await sectionConfigStore.setMurDeStyleSubtitle(null);
      res.status(204).send();
    } catch (e) {
      console.error("DELETE /mur-de-style/config", e);
      res.status(500).json({ error: "Erreur lors de la suppression du sous-titre" });
    }
  });

  /** GET /mur-de-style : liste des blocs, tri par ordre puis id */
  router.get("/", async (_req: Request, res: Response) => {
    try {
      const blocs = await store.readBlocs();
      const sorted = [...blocs].sort((a, b) => a.ordre - b.ordre || a.id.localeCompare(b.id));
      res.json(sorted);
    } catch (e) {
      console.error("GET /mur-de-style", e);
      res.status(500).json({ error: "Erreur lors de la lecture des blocs" });
    }
  });

  /** POST /mur-de-style : création */
  router.post("/", async (req: Request, res: Response) => {
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
      console.error("POST /mur-de-style", e);
      res.status(500).json({ error: "Erreur lors de la création du bloc" });
    }
  });

  /** GET /mur-de-style/by-slug/:slug : un bloc par slug (pour ViewerHD) */
  router.get("/by-slug/:slug", async (req: Request, res: Response) => {
    try {
      const { slug } = req.params;
      const bloc = await store.getBlocBySlug(slug);
      if (!bloc) {
        return res.status(404).json({ error: "Bloc introuvable pour ce slug" });
      }
      res.json(bloc);
    } catch (e) {
      console.error("GET /mur-de-style/by-slug/:slug", e);
      res.status(500).json({ error: "Erreur lors de la lecture du bloc" });
    }
  });

  /** PATCH /mur-de-style/reorder : réordonnancement (doit être avant /:id) */
  router.patch("/reorder", async (req: Request, res: Response) => {
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
      console.error("PATCH /mur-de-style/reorder", e);
      res.status(500).json({ error: "Erreur lors du réordonnancement" });
    }
  });

  /** GET /mur-de-style/:id : un bloc */
  router.get("/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const bloc = await store.getBlocById(id);
      if (!bloc) {
        return res.status(404).json({ error: "Bloc introuvable" });
      }
      res.json(bloc);
    } catch (e) {
      console.error("GET /mur-de-style/:id", e);
      res.status(500).json({ error: "Erreur lors de la lecture du bloc" });
    }
  });

  /** PUT /mur-de-style/:id : mise à jour */
  router.put("/:id", async (req: Request, res: Response) => {
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
      console.error("PUT /mur-de-style/:id", e);
      res.status(500).json({ error: "Erreur lors de la modification du bloc" });
    }
  });

  /** DELETE /mur-de-style/:id : suppression */
  router.delete("/:id", async (req: Request, res: Response) => {
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
      console.error("DELETE /mur-de-style/:id", e);
      res.status(500).json({ error: "Erreur lors de la suppression du bloc" });
    }
  });

  return router;
}
