import { isValidEmail } from "@/shared/utils/email";
import type { DossierClient } from "../types";
import {
  digitsOnly,
  getPhoneFieldStatus,
  isCompleteNationalNumber,
} from "../utils/phone-format";
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
 * contact2 facultatif. mail si renseigné doit être une adresse valide (domaine avec extension).
 * Les photos sont facultatives.
 */
export function isDossierStepValid(data: Partial<DossierClient>): boolean {
  const p1 = data.contact1Prefix ?? "+242";
  const c1 = digitsOnly(data.contact1 ?? data.contact ?? "");
  const contact1Ok =
    c1.length > 0 && isCompleteNationalNumber(c1, p1);
  const p2 = data.contact2Prefix ?? "+242";
  const c2 = digitsOnly(data.contact2 ?? "");
  const contact2Ok =
    getPhoneFieldStatus(c2, p2, true) !== "incomplete";
  const mailOk = isValidEmail(data.mail);
  return Boolean(
    data.nom?.trim() &&
      data.prenom?.trim() &&
      contact1Ok &&
      contact2Ok &&
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
 * Validation des mesures : au moins 3 mesures par groupe (Haut, Bras, Bas)
 * et choix du modèle obligatoire (image de base OR). Chaussures et accessoires restent facultatifs.
 */
export function isMesuresStepValid(data: Partial<DossierClient>): boolean {
  const hasChoixModele = Boolean(data.imageBaseOr);
  if (!hasChoixModele) return false;
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
