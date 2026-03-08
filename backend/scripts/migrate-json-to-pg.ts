/**
 * Script one-shot : lit les fichiers JSON (data/) et insère les données dans PostgreSQL.
 * À lancer une fois après avoir créé la base stannys et défini DATABASE_URL.
 *
 * Usage : depuis backend/ : npx tsx scripts/migrate-json-to-pg.ts
 */
import "dotenv/config";
import pg from "pg";
import { readFile } from "fs/promises";
import path from "path";
import { config } from "../src/config.js";
import { runMigrations } from "../src/db/migrate.js";

const DATA_DIR = config.DATA_DIR;

async function main(): Promise<void> {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("Définir DATABASE_URL dans .env");
    process.exit(1);
  }

  const pool = new pg.Pool({ connectionString: url });
  const client = await pool.connect();

  try {
    await runMigrations(client);
    console.log("Migrations OK");

    // Users
    try {
      const raw = await readFile(path.join(DATA_DIR, "users.json"), "utf-8");
      const data = JSON.parse(raw) as Record<string, { password?: string }>;
      for (const role of ["admin", "editeur", "lecteur", "atelier"]) {
        const p = data[role]?.password ?? "admin";
        await client.query(
          "UPDATE users SET password_hash = $1 WHERE role = $2",
          [p, role]
        );
      }
      console.log("Users migrés (mots de passe en clair → à changer dans l’app pour hasher)");
    } catch {
      console.log("users.json absent ou invalide, ignoré");
    }

    // Dossiers
    try {
      const raw = await readFile(
        path.join(DATA_DIR, "dossiers-history.json"),
        "utf-8"
      );
      const dossiers = JSON.parse(raw) as Array<Record<string, unknown>>;
      if (!Array.isArray(dossiers)) throw new Error("Tableau attendu");
      for (const d of dossiers) {
        const id = d.id as string;
        const createdAt = d.createdAt as string;
        await client.query(
          `INSERT INTO dossiers (
            id, created_at, nom, prenom, contact, contact1, contact2, contact1_prefix, contact2_prefix,
            mail, date_depot, date_livraison, adresse, photo_faciale, photo_corps,
            vetement_base_id, vetement_comparaison_ids, image_base_or, images_comparaison_bleu,
            mesures, images_chaussures, images_accessoires, annotations, status, atelier_statut
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25)
          ON CONFLICT (id) DO NOTHING`,
          [
            id,
            createdAt,
            d.nom ?? "",
            d.prenom ?? "",
            d.contact ?? null,
            d.contact1 ?? d.contact ?? null,
            d.contact2 ?? null,
            d.contact1Prefix ?? "+242",
            d.contact2Prefix ?? "+242",
            d.mail ?? null,
            d.dateDepot ?? createdAt ?? null,
            d.dateLivraison ?? null,
            d.adresse ?? null,
            d.photoFaciale ?? null,
            d.photoCorps ?? null,
            d.vetementBaseId ?? null,
            d.vetementComparaisonIds ?? null,
            d.imageBaseOr != null ? JSON.stringify(d.imageBaseOr) : null,
            d.imagesComparaisonBleu != null ? JSON.stringify(d.imagesComparaisonBleu) : null,
            d.mesures != null ? JSON.stringify(d.mesures) : null,
            d.imagesChaussures != null ? JSON.stringify(d.imagesChaussures) : null,
            d.imagesAccessoires != null ? JSON.stringify(d.imagesAccessoires) : null,
            d.annotations != null ? JSON.stringify(d.annotations) : null,
            d.status ?? "brouillon",
            d.atelierStatut ?? null,
          ]
        );
      }
      console.log(`${dossiers.length} dossiers migrés`);
    } catch (e) {
      console.log("dossiers-history.json absent ou invalide:", (e as Error).message);
    }

    // Catalogue blocs : vestes (= mur-de-style), chaussures, accessoires
    const sections = [
      { file: "mur-de-style-blocs.json", section: "vestes" },
      { file: "catalogue-chaussures-blocs.json", section: "chaussures" },
      { file: "catalogue-accessoires-blocs.json", section: "accessoires" },
    ];
    for (const { file, section } of sections) {
      try {
        const raw = await readFile(path.join(DATA_DIR, file), "utf-8");
        const blocs = JSON.parse(raw) as Array<Record<string, unknown>>;
        if (!Array.isArray(blocs)) continue;
        for (const b of blocs) {
          await client.query(
            `INSERT INTO catalogue_blocs (id, section, titre, sous_titre, images_slider, image_gauche_url, texte_long, texte_court, slug, ordre, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
             ON CONFLICT (id) DO NOTHING`,
            [
              b.id,
              section,
              b.titre ?? "",
              b.sousTitre ?? "",
              JSON.stringify(b.imagesSlider ?? []),
              b.imageGaucheUrl ?? "",
              b.texteLong ?? "",
              b.texteCourt ?? "",
              b.slug ?? "",
              b.ordre ?? 0,
              b.createdAt ?? new Date().toISOString(),
              b.updatedAt ?? new Date().toISOString(),
            ]
          );
        }
        console.log(`${section}: ${blocs.length} blocs migrés`);
      } catch {
        console.log(`${file} absent ou invalide, ignoré`);
      }
    }

    // Config sous-titres catalogue
    try {
      const raw = await readFile(
        path.join(DATA_DIR, "catalogue-section-config.json"),
        "utf-8"
      );
      const data = JSON.parse(raw) as Record<string, string | null>;
      for (const section of ["vestes", "chaussures", "accessoires"]) {
        const subtitle = data[section];
        if (typeof subtitle === "string") {
          await client.query(
            "UPDATE catalogue_section_config SET subtitle = $1 WHERE section = $2",
            [subtitle, section]
          );
        }
      }
      try {
        const leg = await readFile(path.join(DATA_DIR, "section-config.json"), "utf-8");
        const legData = JSON.parse(leg) as { murDeStyleSubtitle?: string | null };
        if (typeof legData.murDeStyleSubtitle === "string") {
          await client.query(
            "UPDATE catalogue_section_config SET subtitle = $1 WHERE section = 'vestes'",
            [legData.murDeStyleSubtitle]
          );
        }
      } catch {
        // ignore
      }
      console.log("Config sections catalogue migrée");
    } catch {
      console.log("catalogue-section-config.json absent, ignoré");
    }

    console.log("Migration JSON → PostgreSQL terminée.");
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
