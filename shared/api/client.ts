/**
 * Base URL de l'API backend. Préfixe pour toutes les requêtes mur-de-style et upload.
 * En développement, défaut http://localhost:4000 si NEXT_PUBLIC_API_URL n'est pas défini.
 */
export function getApiBase(): string {
  const url = typeof process !== "undefined" ? process.env.NEXT_PUBLIC_API_URL : undefined;
  return url !== undefined && url !== "" ? url : "http://localhost:4000";
}

export function apiUrl(path: string): string {
  const base = getApiBase();
  const p = path.startsWith("/") ? path : `/${path}`;
  return base ? `${base.replace(/\/$/, "")}${p}` : p;
}

/**
 * Pour l'affichage des images : si l'URL est relative (commence par /), préfixe par la base API ;
 * sinon (blob:, http:, https:) retourne l'URL telle quelle.
 */
export function getImageUrl(url: string | undefined | null): string {
  if (url == null || url === "") return "";
  if (url.startsWith("/")) return apiUrl(url);
  return url;
}
