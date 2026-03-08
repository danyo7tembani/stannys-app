import { clsx, type ClassValue } from "clsx";

/**
 * Utilitaire pour fusionner des classes Tailwind de manière conditionnelle.
 */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}
