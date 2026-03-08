import type { DossierClient } from "../types";
import {
  MESURES_HAUT_DU_CORPS,
  MESURES_BRAS,
  MESURES_BAS_DU_CORPS,
  MIN_MESURES_PAR_GROUPE,
} from "../constants/mesures";

/**
 * Enregistrement brouillon (local / Supabase plus tard).
 */
export function saveDossierDraft(_data: Partial<DossierClient>): Promise<void> {
  return Promise.resolve();
}

/**
 * Validation des infos personnelles : nom, prénom, contact1, adresse obligatoires.
 * contact2 facultatif. mail si renseigné doit contenir @.
 * Les photos sont facultatives.
 */
export function isDossierStepValid(data: Partial<DossierClient>): boolean {
  const hasContact1 = (data.contact1 ?? data.contact ?? "").trim().length > 0;
  const mailOk = !(data.mail ?? "").trim() || (data.mail ?? "").includes("@");
  return Boolean(
    data.nom?.trim() &&
      data.prenom?.trim() &&
      hasContact1 &&
      data.adresse?.trim() &&
      mailOk
  );
}

function countFilledInGroup(
  mesures: Record<string, number> | undefined,
  ids: readonly { id: string }[]
): number {
  if (!mesures) return 0;
  return ids.filter((m) => typeof mesures[m.id] === "number" && !Number.isNaN(mesures[m.id]))
    .length;
}

/**
 * Validation des mesures : au moins 3 mesures remplies par groupe (Haut, Bras, Bas).
 */
export function isMesuresStepValid(data: Partial<DossierClient>): boolean {
  const mesures = data.mesures;
  const haut = countFilledInGroup(mesures, MESURES_HAUT_DU_CORPS);
  const bras = countFilledInGroup(mesures, MESURES_BRAS);
  const bas = countFilledInGroup(mesures, MESURES_BAS_DU_CORPS);
  return (
    haut >= MIN_MESURES_PAR_GROUPE &&
    bras >= MIN_MESURES_PAR_GROUPE &&
    bas >= MIN_MESURES_PAR_GROUPE
  );
}
