import { Request, Response, NextFunction } from "express";
import { config } from "../config.js";

function isAllowedOrigin(origin: string | undefined): string | null {
  if (!origin || typeof origin !== "string") return null;
  if (config.FRONTEND_ORIGINS.includes(origin)) return origin;
  // En dev : autoriser les origines LAN (tablette / autre appareil sur le même Wi‑Fi)
  if (/^https?:\/\/(192\.168\.|10\.|172\.(1[6-9]|2\d|3[01])\.)/.test(origin)) return origin;
  return null;
}

export function cors(req: Request, res: Response, next: NextFunction): void {
  const origin = req.headers.origin;
  const allowed = isAllowedOrigin(origin) ?? config.FRONTEND_ORIGINS[0] ?? "http://localhost:3000";
  res.setHeader("Access-Control-Allow-Origin", allowed);
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }
  next();
}
