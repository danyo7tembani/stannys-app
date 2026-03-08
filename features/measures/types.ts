/**
 * Types métier du module Mesures (saisie sur mannequin 2D).
 * À implémenter selon le blueprint.
 */
export interface MesureDefinition {
  id: string;
  label: string;
  key: string;
  min?: number;
  max?: number;
  unit: "cm" | "mm";
}

export type MesuresRecord = Record<string, number>;
