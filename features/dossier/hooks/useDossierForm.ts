import { useCallback } from "react";
import { useDossierStore } from "../store";
import type { DossierFormData } from "../types";

export function useDossierForm() {
  const { dossier, setDossier } = useDossierStore();

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setDossier({ [name]: value } as Partial<DossierFormData>);
    },
    [setDossier]
  );

  return { dossier, setDossier, handleChange };
}
