/**
 * Date de livraison : affichage jj/mm/aaaa, stockage ISO yyyy-mm-dd.
 */

export function getCurrentYear(): number {
  return new Date().getFullYear();
}

export function isoDateToFrDisplay(iso: string): string {
  const t = iso.trim();
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(t);
  if (!m) return "";
  const y = m[1];
  const mo = m[2];
  const d = m[3];
  return `${d}/${mo}/${y}`;
}

/** 4 chiffres JJMM → affichage jj/mm (saisie limitée jour/mois). */
export function formatDmDigitsDisplay(dmDigits: string): string {
  const d = dmDigits.replace(/\D/g, "").slice(0, 4);
  if (d.length <= 2) return d;
  return `${d.slice(0, 2)}/${d.slice(2)}`;
}

/** ISO yyyy-mm-dd → chaîne JJMM (sans slash) pour l’input jour/mois. */
export function isoToDmDigits(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
  if (!m) return "";
  return `${m[3]}${m[2]}`;
}

/** Année à afficher en suffixe : celle de la date enregistrée, sinon année courante. */
export function yearSuffixFromIsoOrCurrent(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
  if (m) return m[1];
  return String(getCurrentYear());
}

function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

/** Valide jour/mois/année calendaire. */
export function frDisplayToIso(fr: string): string | null {
  const t = fr.trim();
  const parts = t.split("/").map((p) => p.trim());
  if (parts.length !== 3) return null;
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const year = parseInt(parts[2], 10);
  if (
    !Number.isFinite(day) ||
    !Number.isFinite(month) ||
    !Number.isFinite(year) ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31 ||
    year < 1900 ||
    year > 2100
  ) {
    return null;
  }
  const dt = new Date(year, month - 1, day);
  if (
    dt.getFullYear() !== year ||
    dt.getMonth() !== month - 1 ||
    dt.getDate() !== day
  ) {
    return null;
  }
  return `${year}-${pad2(month)}-${pad2(day)}`;
}

/**
 * Si la saisie est uniquement jj/mm (1 ou 2 chiffres par bloc), ajoute l’année courante.
 * Retourne une chaîne jj/mm/aaaa normalisée (zéros de tête) ou la chaîne d’origine si déjà 3 segments.
 */
export function completeFrDateWithCurrentYear(input: string): string {
  const t = input.trim();
  const parts = t.split("/").map((p) => p.trim()).filter(Boolean);
  if (parts.length === 2) {
    const d = parseInt(parts[0], 10);
    const mo = parseInt(parts[1], 10);
    if (
      Number.isFinite(d) &&
      Number.isFinite(mo) &&
      mo >= 1 &&
      mo <= 12 &&
      d >= 1 &&
      d <= 31
    ) {
      const y = getCurrentYear();
      return `${pad2(d)}/${pad2(mo)}/${y}`;
    }
  }
  if (parts.length === 3) {
    const d = parseInt(parts[0], 10);
    const mo = parseInt(parts[1], 10);
    const y = parseInt(parts[2], 10);
    if (
      Number.isFinite(d) &&
      Number.isFinite(mo) &&
      Number.isFinite(y)
    ) {
      return `${pad2(d)}/${pad2(mo)}/${y}`;
    }
  }
  return t;
}
