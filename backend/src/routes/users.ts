import { Router, Request, Response } from "express";
import type { UserRole } from "../services/users/types.js";

type UsersStore = ReturnType<typeof import("../services/users/file-store.js").createUsersFileStore>;

const ROLES: UserRole[] = ["admin", "editeur", "lecteur", "atelier"];

export function createUsersRouter(usersStore: UsersStore) {
  const router = Router();

  /** Liste des rôles (pour l’admin). */
  router.get("/", async (_req: Request, res: Response) => {
    const roles = await usersStore.getRoles();
    res.json(
      roles.map((role) => ({
        role,
        label:
          role === "admin"
            ? "Admin"
            : role === "editeur"
              ? "Éditeur"
              : role === "atelier"
                ? "Atelier"
                : "Lecteur",
      }))
    );
  });

  /** Modifier le code d’un rôle (nécessite le mot de passe admin). */
  router.put("/code", async (req: Request, res: Response) => {
    const { role, newCode, adminPassword } = req.body ?? {};
    const r = typeof role === "string" ? role.trim().toLowerCase() : "";
    if (!ROLES.includes(r as UserRole)) {
      res.status(400).json({ error: "Rôle invalide" });
      return;
    }
    if (typeof newCode !== "string" || !newCode.trim()) {
      res.status(400).json({ error: "Nouveau code requis" });
      return;
    }
    if (typeof adminPassword !== "string") {
      res.status(400).json({ error: "Mot de passe admin requis" });
      return;
    }
    const adminOk = await usersStore.verify("admin", adminPassword);
    if (!adminOk) {
      res.status(403).json({ error: "Mot de passe admin incorrect" });
      return;
    }
    await usersStore.setPassword(r as UserRole, newCode.trim());
    res.json({ ok: true });
  });

  return router;
}
