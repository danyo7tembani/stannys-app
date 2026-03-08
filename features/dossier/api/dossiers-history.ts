import { apiUrl } from "@/shared/api/client";
import type { DossierClient } from "../types";

export interface DossierEnregistreApi extends DossierClient {
  id: string;
  createdAt: string;
}

const BASE = "/dossiers-history";

/**
 * Upload une photo (blob URL) vers le serveur et retourne l’URL publique.
 * Utilisé pour persister les photos du dossier (faciale/corps) à l’enregistrement.
 */
async function uploadBlobPhoto(blobUrl: string, fileName: string): Promise<string> {
  const res = await fetch(blobUrl);
  const blob = await res.blob();
  const file = new File([blob], fileName, { type: blob.type || "image/jpeg" });
  const form = new FormData();
  form.append("file", file);
  const uploadRes = await fetch(apiUrl("/upload"), {
    method: "POST",
    body: form,
  });
  if (!uploadRes.ok) {
    const err = await uploadRes.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? "Erreur upload photo");
  }
  const data = (await uploadRes.json()) as { url?: string };
  if (!data?.url) throw new Error("Réponse upload invalide");
  return data.url;
}

export async function fetchDossiersList(): Promise<DossierEnregistreApi[]> {
  const res = await fetch(apiUrl(BASE));
  if (!res.ok) throw new Error("Erreur lors du chargement de l'historique");
  const data = await res.json();
  return Array.isArray(data.dossiers) ? data.dossiers : [];
}

export async function fetchDossierById(id: string): Promise<DossierEnregistreApi | null> {
  const res = await fetch(apiUrl(`${BASE}/${id}`));
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Erreur lors du chargement du dossier");
  return res.json();
}

/**
 * Envoie le dossier au serveur. Upload les photos blob vers le serveur avant envoi pour persistance.
 */
export async function apiAddDossier(
  dossier: Partial<DossierClient>
): Promise<DossierEnregistreApi> {
  const payload = { ...dossier, status: dossier.status ?? "brouillon" };
  if (payload.photoFaciale?.startsWith("blob:")) {
    try {
      payload.photoFaciale = await uploadBlobPhoto(payload.photoFaciale, "photo-faciale.jpg");
    } catch {
      payload.photoFaciale = undefined;
    }
  }
  if (payload.photoCorps?.startsWith("blob:")) {
    try {
      payload.photoCorps = await uploadBlobPhoto(payload.photoCorps, "photo-corps.jpg");
    } catch {
      payload.photoCorps = undefined;
    }
  }
  const res = await fetch(apiUrl(BASE), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? "Erreur lors de l'enregistrement");
  }
  return res.json();
}

export async function apiUpdateDossierStatus(
  id: string,
  status: "brouillon" | "definitif"
): Promise<DossierEnregistreApi> {
  const res = await fetch(apiUrl(`${BASE}/${id}`), {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? "Erreur lors de la mise à jour du statut");
  }
  return res.json();
}

export async function apiUpdateDossierAtelierStatut(
  id: string,
  atelierStatut: "en_cours" | "termine"
): Promise<DossierEnregistreApi> {
  const res = await fetch(apiUrl(`${BASE}/${id}`), {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ atelierStatut }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? "Erreur lors de la mise à jour du statut atelier");
  }
  return res.json();
}

export async function apiRemoveDossier(id: string): Promise<void> {
  const res = await fetch(apiUrl(`${BASE}/${id}`), { method: "DELETE" });
  if (res.status === 404) return;
  if (!res.ok) throw new Error("Erreur lors de la suppression du dossier");
}
