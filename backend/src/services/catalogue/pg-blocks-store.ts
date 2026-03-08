import type { Pool } from "pg";
import type { BlocMurDeStyle } from "../mur-de-style/types.js";
import type { CatalogueBlocksStore } from "./blocks-store.js";
import type { CatalogueSection } from "./types.js";
import { isCatalogueSection } from "./types.js";

function rowToBloc(row: Record<string, unknown>): BlocMurDeStyle {
  const imagesSlider = row.images_slider;
  return {
    id: String(row.id),
    titre: String(row.titre ?? ""),
    sousTitre: String(row.sous_titre ?? ""),
    imagesSlider: Array.isArray(imagesSlider) ? (imagesSlider as string[]) : [],
    imageGaucheUrl: String(row.image_gauche_url ?? ""),
    texteLong: String(row.texte_long ?? ""),
    texteCourt: String(row.texte_court ?? ""),
    slug: String(row.slug ?? ""),
    ordre: Number(row.ordre ?? 0),
    createdAt:
      row.created_at instanceof Date
        ? row.created_at.toISOString()
        : String(row.created_at ?? ""),
    updatedAt:
      row.updated_at instanceof Date
        ? row.updated_at.toISOString()
        : String(row.updated_at ?? ""),
  };
}

export function createCatalogueBlocksStorePg(
  pool: Pool,
  section: string
): CatalogueBlocksStore | null {
  if (!isCatalogueSection(section)) return null;
  const sec = section as CatalogueSection;

  return {
    async readBlocs() {
      const { rows } = await pool.query(
        "SELECT * FROM catalogue_blocs WHERE section = $1 ORDER BY ordre ASC, id ASC",
        [sec]
      );
      return rows.map((r) => rowToBloc(r));
    },

    async writeBlocs(blocs: BlocMurDeStyle[]) {
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        await client.query("DELETE FROM catalogue_blocs WHERE section = $1", [
          sec,
        ]);
        const now = new Date().toISOString();
        for (const b of blocs) {
          await client.query(
            `INSERT INTO catalogue_blocs (id, section, titre, sous_titre, images_slider, image_gauche_url, texte_long, texte_court, slug, ordre, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
            [
              b.id,
              sec,
              b.titre ?? "",
              b.sousTitre ?? "",
              JSON.stringify(b.imagesSlider ?? []),
              b.imageGaucheUrl ?? "",
              b.texteLong ?? "",
              b.texteCourt ?? "",
              b.slug ?? "",
              b.ordre ?? 0,
              b.createdAt ?? now,
              b.updatedAt ?? now,
            ]
          );
        }
        await client.query("COMMIT");
      } catch (e) {
        await client.query("ROLLBACK");
        throw e;
      } finally {
        client.release();
      }
    },

    async getBlocById(id: string) {
      const { rows } = await pool.query(
        "SELECT * FROM catalogue_blocs WHERE id = $1 AND section = $2",
        [id, sec]
      );
      return rows.length > 0 ? rowToBloc(rows[0]) : null;
    },

    async getBlocBySlug(slug: string) {
      const { rows } = await pool.query(
        "SELECT * FROM catalogue_blocs WHERE section = $1 AND slug = $2",
        [sec, slug.trim()]
      );
      return rows.length > 0 ? rowToBloc(rows[0]) : null;
    },

    async updateBloc(
      id: string,
      update: Partial<Omit<BlocMurDeStyle, "id" | "createdAt">>
    ) {
      const updates: string[] = [];
      const values: unknown[] = [];
      let i = 1;
      const set = (col: string, val: unknown) => {
        updates.push(`${col} = $${i}`);
        values.push(val);
        i++;
      };
      if (update.titre !== undefined) set("titre", update.titre);
      if (update.sousTitre !== undefined) set("sous_titre", update.sousTitre);
      if (update.imagesSlider !== undefined)
        set("images_slider", JSON.stringify(update.imagesSlider));
      if (update.imageGaucheUrl !== undefined)
        set("image_gauche_url", update.imageGaucheUrl);
      if (update.texteLong !== undefined) set("texte_long", update.texteLong);
      if (update.texteCourt !== undefined) set("texte_court", update.texteCourt);
      if (update.slug !== undefined) set("slug", update.slug);
      if (update.ordre !== undefined) set("ordre", update.ordre);
      set("updated_at", new Date().toISOString());
      values.push(id, sec);
      if (updates.length <= 1) {
        const { rows } = await pool.query(
          "SELECT * FROM catalogue_blocs WHERE id = $1 AND section = $2",
          [id, sec]
        );
        return rows.length > 0 ? rowToBloc(rows[0]) : null;
      }
      const { rows } = await pool.query(
        `UPDATE catalogue_blocs SET ${updates.join(", ")} WHERE id = $${i} AND section = $${i + 1} RETURNING *`,
        values
      );
      return rows.length > 0 ? rowToBloc(rows[0]) : null;
    },
  };
}
