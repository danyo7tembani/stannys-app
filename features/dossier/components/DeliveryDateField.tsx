"use client";

import type { ChangeEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { useDossierStore } from "../store";
import {
  formatDmDigitsDisplay,
  frDisplayToIso,
  isoToDmDigits,
  yearSuffixFromIsoOrCurrent,
} from "../utils/delivery-date";

function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

export function DeliveryDateField() {
  const dateLivraison = useDossierStore((s) => s.dossier.dateLivraison ?? "");
  const setDossier = useDossierStore((s) => s.setDossier);
  const [dmDigits, setDmDigits] = useState(() => isoToDmDigits(dateLivraison));

  const yearSuffix = useMemo(
    () => yearSuffixFromIsoOrCurrent(dateLivraison),
    [dateLivraison]
  );

  useEffect(() => {
    setDmDigits(isoToDmDigits(dateLivraison));
  }, [dateLivraison]);

  const dmDisplay = formatDmDigitsDisplay(dmDigits);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 4);
    setDmDigits(digits);
  };

  const revertFromStore = () => {
    const prev = useDossierStore.getState().dossier.dateLivraison ?? "";
    setDmDigits(isoToDmDigits(prev));
  };

  const commit = () => {
    if (dmDigits.length === 0) {
      setDossier({ dateLivraison: "" });
      return;
    }
    if (dmDigits.length < 4) {
      revertFromStore();
      return;
    }
    const day = parseInt(dmDigits.slice(0, 2), 10);
    const month = parseInt(dmDigits.slice(2, 4), 10);
    const y = parseInt(yearSuffix, 10);
    const iso = frDisplayToIso(`${pad2(day)}/${pad2(month)}/${y}`);
    if (iso) {
      setDossier({ dateLivraison: iso });
    } else {
      revertFromStore();
    }
  };

  return (
    <div className="flex w-full min-w-0 items-stretch overflow-hidden rounded border border-luxe-or-muted/40 bg-luxe-noir font-dossier-nombres focus-within:border-luxe-or focus-within:ring-1 focus-within:ring-luxe-or/50">
      <input
        id="date-livraison"
        name="dateLivraison"
        type="text"
        inputMode="numeric"
        autoComplete="off"
        value={dmDisplay}
        onChange={handleChange}
        onBlur={commit}
        placeholder="jj/mm"
        maxLength={5}
        className="min-w-0 flex-1 border-0 bg-transparent px-3 py-2 text-luxe-blanc placeholder:text-luxe-blanc-muted focus:outline-none"
        aria-label="Jour et mois de livraison"
      />
      <span
        className="flex shrink-0 items-center border-l border-luxe-or-muted/40 bg-luxe-noir-soft/50 px-3 py-2 text-luxe-blanc tabular-nums select-none"
        aria-hidden
      >
        /{yearSuffix}
      </span>
    </div>
  );
}
