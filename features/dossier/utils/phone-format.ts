/**
 * Formatage et validation des numéros nationaux (sans indicatif),
 * selon l’indicatif choisi. Stockage recommandé : chiffres uniquement.
 */

export function digitsOnly(s: string): string {
  return s.replace(/\D/g, "");
}

export type PhoneNationalRule = {
  /** Nombre de chiffres attendus (partie nationale) */
  length: number;
  /** Découpage pour les espaces (doit sommer à `length`) */
  groups: number[];
};

/** Règles explicites ; les autres indicatifs utilisent `DEFAULT_RULE`. */
const RULES: Record<string, PhoneNationalRule> = {
  "+242": { length: 9, groups: [2, 3, 2, 2] },
  "+243": { length: 9, groups: [3, 2, 2, 2] },
  "+33": { length: 9, groups: [1, 2, 2, 2, 2] },
  "+32": { length: 9, groups: [3, 2, 2, 2] },
  "+237": { length: 9, groups: [3, 2, 2, 2] },
  "+225": { length: 10, groups: [2, 2, 2, 2, 2] },
  "+221": { length: 9, groups: [2, 3, 2, 2] },
  "+226": { length: 8, groups: [2, 2, 2, 2] },
  "+228": { length: 8, groups: [2, 2, 2, 2] },
  "+229": { length: 8, groups: [2, 2, 2, 2] },
  "+212": { length: 9, groups: [3, 2, 2, 2] },
  "+213": { length: 9, groups: [2, 3, 2, 2] },
  "+216": { length: 8, groups: [2, 2, 2, 2] },
  "+1": { length: 10, groups: [3, 3, 4] },
  "+44": { length: 10, groups: [4, 3, 3] },
  "+49": { length: 11, groups: [3, 2, 2, 2, 2] },
  "+39": { length: 10, groups: [3, 3, 4] },
  "+34": { length: 9, groups: [3, 3, 3] },
  "+351": { length: 9, groups: [3, 3, 3] },
  "+41": { length: 9, groups: [2, 3, 2, 2] },
  "+91": { length: 10, groups: [5, 5] },
  "+86": { length: 11, groups: [3, 4, 4] },
};

const DEFAULT_RULE: PhoneNationalRule = { length: 9, groups: [3, 3, 3] };

export function getPhoneRuleForPrefix(prefix: string): PhoneNationalRule {
  return RULES[prefix] ?? DEFAULT_RULE;
}

export function formatNationalDisplay(digits: string, prefix: string): string {
  const rule = getPhoneRuleForPrefix(prefix);
  const d = digitsOnly(digits).slice(0, rule.length);
  if (!d) return "";
  const parts: string[] = [];
  let i = 0;
  for (const g of rule.groups) {
    if (i >= d.length) break;
    parts.push(d.slice(i, i + g));
    i += g;
  }
  return parts.join(" ");
}

export function isCompleteNationalNumber(
  digits: string,
  prefix: string
): boolean {
  const d = digitsOnly(digits);
  const { length } = getPhoneRuleForPrefix(prefix);
  return d.length === length;
}

export function getNationalMaxDigits(prefix: string): number {
  return getPhoneRuleForPrefix(prefix).length;
}

export type PhoneFieldStatus = "empty" | "incomplete" | "valid";

export function getPhoneFieldStatus(
  nationalDigits: string,
  prefix: string,
  optional: boolean
): PhoneFieldStatus {
  const d = digitsOnly(nationalDigits);
  if (d.length === 0) return "empty";
  if (isCompleteNationalNumber(d, prefix)) return "valid";
  return "incomplete";
}
