/**
 * Types métier du module Design Studio (Split View, Stanny's Code).
 * À implémenter selon le blueprint.
 */
import type { PointOr, PointBleu } from "@/shared/types";

export type { PointOr, PointBleu };

export type AnnotationColor = "rouge" | "jaune" | "vert";

export interface StannyAnnotation {
  id: string;
  color: AnnotationColor;
  points: number[][];
  imageSource: "or" | "bleu";
}
