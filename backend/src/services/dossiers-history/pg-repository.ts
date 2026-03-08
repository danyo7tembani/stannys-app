import type { Pool } from "pg";
import type { DossiersHistoryRepository } from "./repository.js";
import type { DossierEnregistre } from "./types.js";

function rowToDossier(row: Record<string, unknown>): DossierEnregistre {
  return {
    id: row.id as string,
    createdAt:
      row.created_at instanceof Date
        ? row.created_at.toISOString()
        : String(row.created_at ?? ""),
    nom: String(row.nom ?? ""),
    prenom: String(row.prenom ?? ""),
    contact: row.contact != null ? String(row.contact) : undefined,
    contact1: row.contact1 != null ? String(row.contact1) : undefined,
    contact2: row.contact2 != null ? String(row.contact2) : undefined,
    contact1Prefix: row.contact1_prefix != null ? String(row.contact1_prefix) : undefined,
    contact2Prefix: row.contact2_prefix != null ? String(row.contact2_prefix) : undefined,
    mail: row.mail != null ? String(row.mail) : undefined,
    dateDepot:
      row.date_depot instanceof Date
        ? row.date_depot.toISOString()
        : row.date_depot != null
          ? String(row.date_depot)
          : undefined,
    dateLivraison: row.date_livraison != null ? String(row.date_livraison) : undefined,
    adresse: row.adresse != null ? String(row.adresse) : undefined,
    photoFaciale: row.photo_faciale != null ? String(row.photo_faciale) : undefined,
    photoCorps: row.photo_corps != null ? String(row.photo_corps) : undefined,
    vetementBaseId: row.vetement_base_id != null ? String(row.vetement_base_id) : undefined,
    vetementComparaisonIds: Array.isArray(row.vetement_comparaison_ids)
      ? (row.vetement_comparaison_ids as string[])
      : undefined,
    imageBaseOr: row.image_base_or as DossierEnregistre["imageBaseOr"],
    imagesComparaisonBleu: row.images_comparaison_bleu as DossierEnregistre["imagesComparaisonBleu"],
    mesures: row.mesures as DossierEnregistre["mesures"],
    imagesChaussures: row.images_chaussures as DossierEnregistre["imagesChaussures"],
    imagesAccessoires: row.images_accessoires as DossierEnregistre["imagesAccessoires"],
    annotations: row.annotations as DossierEnregistre["annotations"],
    status: (row.status as "brouillon" | "definitif") ?? "brouillon",
    atelierStatut: row.atelier_statut as "en_cours" | "termine" | undefined,
  };
}

export function createDossiersHistoryPgRepository(pool: Pool): DossiersHistoryRepository {
  return {
    async list() {
      const { rows } = await pool.query(
        "SELECT * FROM dossiers ORDER BY created_at DESC"
      );
      return rows.map((r) => rowToDossier(r));
    },

    async getById(id: string) {
      const { rows } = await pool.query("SELECT * FROM dossiers WHERE id = $1", [
        id,
      ]);
      return rows.length > 0 ? rowToDossier(rows[0]) : null;
    },

    async add(dossier: Omit<DossierEnregistre, "id" | "createdAt">) {
      const contact1 = (dossier.contact1 ?? dossier.contact ?? "").trim();
      const dateDepot = dossier.dateDepot ?? new Date().toISOString();
      const { rows } = await pool.query(
        `INSERT INTO dossiers (
          nom, prenom, contact, contact1, contact2, contact1_prefix, contact2_prefix,
          mail, date_depot, date_livraison, adresse, photo_faciale, photo_corps,
          vetement_base_id, vetement_comparaison_ids, image_base_or, images_comparaison_bleu,
          mesures, images_chaussures, images_accessoires, annotations, status, atelier_statut
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23)
        RETURNING *`,
        [
          dossier.nom ?? "",
          dossier.prenom ?? "",
          dossier.contact ?? contact1,
          contact1 || (dossier.contact ?? ""),
          dossier.contact2?.trim() ?? null,
          dossier.contact1Prefix ?? "+242",
          dossier.contact2Prefix ?? "+242",
          dossier.mail?.trim() ?? null,
          dateDepot,
          dossier.dateLivraison?.trim() ?? null,
          dossier.adresse ?? null,
          dossier.photoFaciale ?? null,
          dossier.photoCorps ?? null,
          dossier.vetementBaseId ?? null,
          dossier.vetementComparaisonIds ?? null,
          dossier.imageBaseOr != null ? JSON.stringify(dossier.imageBaseOr) : null,
          dossier.imagesComparaisonBleu != null
            ? JSON.stringify(dossier.imagesComparaisonBleu)
            : null,
          dossier.mesures != null ? JSON.stringify(dossier.mesures) : null,
          dossier.imagesChaussures != null
            ? JSON.stringify(dossier.imagesChaussures)
            : null,
          dossier.imagesAccessoires != null
            ? JSON.stringify(dossier.imagesAccessoires)
            : null,
          dossier.annotations != null ? JSON.stringify(dossier.annotations) : null,
          dossier.status ?? "brouillon",
          dossier.atelierStatut ?? null,
        ]
      );
      return rowToDossier(rows[0]);
    },

    async updateStatus(id: string, status: "brouillon" | "definitif") {
      const { rowCount } = await pool.query(
        "UPDATE dossiers SET status = $1 WHERE id = $2",
        [status, id]
      );
      return (rowCount ?? 0) > 0;
    },

    async updateAtelierStatut(id: string, atelierStatut: "en_cours" | "termine") {
      const { rowCount } = await pool.query(
        "UPDATE dossiers SET atelier_statut = $1 WHERE id = $2",
        [atelierStatut, id]
      );
      return (rowCount ?? 0) > 0;
    },

    async remove(id: string) {
      const { rowCount } = await pool.query("DELETE FROM dossiers WHERE id = $1", [
        id,
      ]);
      return (rowCount ?? 0) > 0;
    },
  };
}
