import "dotenv/config";
import express from "express";
import { config } from "./config.js";
import { cors } from "./middleware/cors.js";
import { createStore } from "./services/mur-de-style/store.js";
import { createSectionConfigStore } from "./services/section-config/store.js";
import { createSectionConfigStoreFromCatalogue } from "./services/section-config/pg-adapter.js";
import { createCatalogueSectionConfigStore } from "./services/catalogue/section-config-store.js";
import { createCatalogueBlocksStore } from "./services/catalogue/blocks-store.js";
import { createCatalogueBlocksStorePg } from "./services/catalogue/pg-blocks-store.js";
import { createCatalogueSectionConfigStorePg } from "./services/catalogue/pg-section-config-store.js";
import { createMurDeStyleRouter } from "./routes/mur-de-style.js";
import { createCatalogueRouter, type GetCatalogueStore } from "./routes/catalogue.js";
import { createDossiersHistoryRouter } from "./routes/dossiers-history.js";
import { createDossiersHistoryFileStore } from "./services/dossiers-history/file-store.js";
import { createDossiersHistoryPgRepository } from "./services/dossiers-history/pg-repository.js";
import { createUsersFileStore } from "./services/users/file-store.js";
import { createUsersPgStore } from "./services/users/pg-store.js";
import { createAuthRouter } from "./routes/auth.js";
import { createUsersRouter } from "./routes/users.js";
import uploadRouter from "./routes/upload.js";
import { getPool } from "./db/pool.js";
import { runMigrations } from "./db/migrate.js";

const app = express();
app.use(cors);
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

async function start(): Promise<void> {
  const useDb = config.DATABASE_URL.length > 0;
  let getCatalogueStore: GetCatalogueStore;
  let catalogueSectionConfigStore: {
    getSubtitle: (section: string) => Promise<string | null>;
    setSubtitle: (section: string, value: string | null) => Promise<unknown>;
  };
  let murDeStyleStore: ReturnType<typeof createStore>;
  let murDeStyleSectionConfig: ReturnType<typeof createSectionConfigStore>;
  let dossiersHistoryRepo: ReturnType<typeof createDossiersHistoryFileStore>;
  let usersStore: ReturnType<typeof createUsersFileStore>;

  if (useDb) {
    const pool = getPool();
    if (!pool) {
      throw new Error("DATABASE_URL est défini mais le pool PostgreSQL n'a pas pu être créé.");
    }
    const client = await pool.connect();
    try {
      await runMigrations(client);
    } finally {
      client.release();
    }
    dossiersHistoryRepo = createDossiersHistoryPgRepository(pool);
    usersStore = createUsersPgStore(pool);
    catalogueSectionConfigStore = createCatalogueSectionConfigStorePg(pool);
    getCatalogueStore = (section) => createCatalogueBlocksStorePg(pool, section);
    murDeStyleStore = createCatalogueBlocksStorePg(pool, "vestes")!;
    murDeStyleSectionConfig = createSectionConfigStoreFromCatalogue(
      catalogueSectionConfigStore
    ) as unknown as ReturnType<typeof createSectionConfigStore>;
    console.log("Backend: base de données PostgreSQL (stannys)");
  } else {
    murDeStyleStore = createStore(config.DATA_DIR);
    murDeStyleSectionConfig = createSectionConfigStore(config.DATA_DIR);
    catalogueSectionConfigStore = createCatalogueSectionConfigStore(config.DATA_DIR);
    getCatalogueStore = (section) =>
      createCatalogueBlocksStore(config.DATA_DIR, section);
    dossiersHistoryRepo = createDossiersHistoryFileStore(config.DATA_DIR);
    usersStore = createUsersFileStore(config.DATA_DIR);
    console.log("Backend: stockage fichiers JSON");
  }

  app.use(
    "/mur-de-style",
    createMurDeStyleRouter(murDeStyleStore, murDeStyleSectionConfig)
  );
  app.use(
    "/catalogue",
    createCatalogueRouter(getCatalogueStore, catalogueSectionConfigStore)
  );
  app.use("/dossiers-history", createDossiersHistoryRouter(dossiersHistoryRepo));
  app.use("/auth", createAuthRouter(usersStore));
  app.use("/users", createUsersRouter(usersStore));
  app.use("/upload", uploadRouter);

  app.use("/uploads", express.static(config.UPLOAD_DIR));

  app.listen(config.PORT, "0.0.0.0", () => {
    console.log(
      `Backend running at http://localhost:${config.PORT} (réseau: 0.0.0.0:${config.PORT})`
    );
  });
}

start().catch((err) => {
  console.error("Démarrage backend:", err);
  process.exit(1);
});
