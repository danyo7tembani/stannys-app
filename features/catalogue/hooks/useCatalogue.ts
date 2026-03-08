import { useMemo } from "react";
import { getCatalogueVetements, getVetementBySlug } from "../services";
import type { Vetement } from "../types";

/**
 * Hook : liste du catalogue (côté client ; pour le serveur utiliser directement le service).
 */
export function useCatalogue(): Vetement[] {
  return useMemo(() => getCatalogueVetements(), []);
}

/**
 * Hook : un vêtement par slug (côté client).
 */
export function useVetementBySlug(slug: string): Vetement | undefined {
  return useMemo(() => getVetementBySlug(slug), [slug]);
}
