import { Router, Request, Response } from "express";
import { ROLES } from "../services/users/types.js";

type UsersStore = ReturnType<typeof import("../services/users/file-store.js").createUsersFileStore>;

export function createAuthRouter(usersStore: UsersStore) {
  const router = Router();

  router.post("/login", async (req: Request, res: Response) => {
    const { username, password } = req.body ?? {};
    const role = typeof username === "string" ? username.trim().toLowerCase() : "";
    if (!role || typeof password !== "string") {
      res.status(400).json({ error: "username et password requis" });
      return;
    }
    if (!ROLES.includes(role as "admin" | "editeur" | "lecteur" | "atelier")) {
      res.status(401).json({ error: "Identifiants incorrects" });
      return;
    }
    const ok = await usersStore.verify(role, password);
    if (!ok) {
      res.status(401).json({ error: "Identifiants incorrects" });
      return;
    }
    res.json({ ok: true, role });
  });

  return router;
}
