import { Router, Request, Response } from "express";
import type { DossiersHistoryRepository } from "../services/dossiers-history/repository.js";
import type { DossierEnregistre } from "../services/dossiers-history/types.js";

export function createDossiersHistoryRouter(
  repo: DossiersHistoryRepository
): Router {
  const router = Router();

  /** GET / — liste tous les dossiers */
  router.get("/", async (_req: Request, res: Response) => {
    try {
      const dossiers = await repo.list();
      res.json({ dossiers });
    } catch (e) {
      console.error("GET /dossiers-history", e);
      res.status(500).json({ error: "Erreur lors de la lecture de l'historique" });
    }
  });

  /** GET /:id — un dossier par id */
  router.get("/:id", async (req: Request, res: Response) => {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ error: "Id manquant" });
    }
    try {
      const dossier = await repo.getById(id);
      if (!dossier) {
        return res.status(404).json({ error: "Dossier introuvable" });
      }
      res.json(dossier);
    } catch (e) {
      console.error("GET /dossiers-history/:id", e);
      res.status(500).json({ error: "Erreur lors de la lecture du dossier" });
    }
  });

  /** POST / — ajoute un dossier (id et createdAt générés côté serveur) */
  router.post("/", async (req: Request, res: Response) => {
    const body = req.body as Partial<DossierEnregistre>;
    if (!body || typeof body.nom !== "string" || typeof body.prenom !== "string") {
      return res.status(400).json({ error: "Données invalides (nom, prénom requis)" });
    }
    const contact1 = (body.contact1 ?? body.contact ?? "").toString().trim();
    if (!contact1) {
      return res.status(400).json({ error: "Données invalides (contact1 requis)" });
    }
    try {
      const payload = {
        nom: body.nom,
        prenom: body.prenom,
        contact: body.contact ?? contact1,
        contact1,
        contact2: body.contact2?.toString().trim() || undefined,
        contact1Prefix: body.contact1Prefix ?? "+242",
        contact2Prefix: body.contact2Prefix ?? "+242",
        mail: body.mail?.toString().trim() || undefined,
        dateDepot: body.dateDepot ?? undefined,
        dateLivraison: body.dateLivraison?.toString().trim() || undefined,
        adresse: body.adresse,
        photoFaciale: body.photoFaciale,
        photoCorps: body.photoCorps,
        vetementBaseId: body.vetementBaseId,
        vetementComparaisonIds: body.vetementComparaisonIds,
        imageBaseOr: body.imageBaseOr,
        imagesComparaisonBleu: body.imagesComparaisonBleu,
        mesures: body.mesures,
        imagesChaussures: body.imagesChaussures,
        imagesAccessoires: body.imagesAccessoires,
        annotations: body.annotations,
        status: body.status === "definitif" ? "definitif" : "brouillon",
      };
      const saved = await repo.add(payload);
      res.status(201).json(saved);
    } catch (e) {
      console.error("POST /dossiers-history", e);
      res.status(500).json({ error: "Erreur lors de l'enregistrement du dossier" });
    }
  });

  /** PATCH /:id — met à jour le statut (brouillon | définitif) ou atelierStatut (en_cours | termine) */
  router.patch("/:id", async (req: Request, res: Response) => {
    const id = req.params.id;
    const body = req.body as { status?: string; atelierStatut?: string };
    if (!id) {
      return res.status(400).json({ error: "Id manquant" });
    }
    try {
      if (body?.atelierStatut && ["en_cours", "termine"].includes(body.atelierStatut)) {
        const ok = await repo.updateAtelierStatut(id, body.atelierStatut as "en_cours" | "termine");
        if (!ok) return res.status(404).json({ error: "Dossier introuvable" });
        const dossier = await repo.getById(id);
        return res.json(dossier!);
      }
      if (body?.status && ["brouillon", "definitif"].includes(body.status)) {
        const ok = await repo.updateStatus(id, body.status as "brouillon" | "definitif");
        if (!ok) return res.status(404).json({ error: "Dossier introuvable" });
        const dossier = await repo.getById(id);
        return res.json(dossier!);
      }
      return res.status(400).json({ error: "Body doit contenir status (brouillon|definitif) ou atelierStatut (en_cours|termine)" });
    } catch (e) {
      console.error("PATCH /dossiers-history/:id", e);
      res.status(500).json({ error: "Erreur lors de la mise à jour du statut" });
    }
  });

  /** DELETE /:id — supprime un dossier */
  router.delete("/:id", async (req: Request, res: Response) => {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ error: "Id manquant" });
    }
    try {
      const removed = await repo.remove(id);
      if (!removed) {
        return res.status(404).json({ error: "Dossier introuvable" });
      }
      res.status(204).send();
    } catch (e) {
      console.error("DELETE /dossiers-history/:id", e);
      res.status(500).json({ error: "Erreur lors de la suppression du dossier" });
    }
  });

  return router;
}
