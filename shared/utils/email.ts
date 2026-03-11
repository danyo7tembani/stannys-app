/**
 * Vérifie qu'une chaîne est une adresse e-mail valide avec un vrai nom de domaine
 * (ex. @gmail.com, @outlook.com, @yahoo.fr). Rejette "a@b" ou "x@".
 * Champ facultatif : chaîne vide ou que des espaces → valide.
 */
export function isValidEmail(value: string | undefined | null): boolean {
  const trimmed = (value ?? "").trim();
  if (trimmed === "") return true;
  // Au moins un @, partie locale non vide, domaine avec au moins un point (ex. domaine.com)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(trimmed);
}
