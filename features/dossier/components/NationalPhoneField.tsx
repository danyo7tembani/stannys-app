"use client";

import type { ChangeEvent } from "react";
import { cn } from "@/shared/lib";
import {
  digitsOnly,
  formatNationalDisplay,
  getNationalMaxDigits,
  getPhoneFieldStatus,
} from "../utils/phone-format";

export type NationalPhoneFieldProps = {
  id?: string;
  name: string;
  prefix: string;
  value: string;
  onChange: (digits: string) => void;
  optional?: boolean;
  placeholder?: string;
  "aria-label"?: string;
  className?: string;
};

/** Partie nationale après l’indicatif (même si l’utilisateur a effacé le préfixe à l’écran). */
function stripLeadingPrefix(input: string, prefix: string): string {
  const t = input.trimStart();
  if (t.startsWith(prefix)) {
    return t.slice(prefix.length).trimStart();
  }
  return t;
}

export function NationalPhoneField({
  id,
  name,
  prefix,
  value,
  onChange,
  optional = false,
  placeholder,
  "aria-label": ariaLabel,
  className,
}: NationalPhoneFieldProps) {
  const nationalFmt = formatNationalDisplay(value, prefix);
  const fullDisplay = nationalFmt ? `${prefix} ${nationalFmt}` : `${prefix} `;
  const status = getPhoneFieldStatus(value, prefix, optional);
  const maxDigits = getNationalMaxDigits(prefix);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const after = stripLeadingPrefix(e.target.value, prefix);
    const d = digitsOnly(after).slice(0, maxDigits);
    onChange(d);
  };

  const showStatus = status !== "empty";

  return (
    <div className={cn("relative min-w-0 flex-1", className)}>
      <input
        id={id}
        name={name}
        type="tel"
        inputMode="text"
        autoComplete="tel"
        value={fullDisplay}
        onChange={handleChange}
        placeholder={placeholder}
        aria-label={ariaLabel}
        aria-invalid={status === "incomplete"}
        className="input-luxe w-full min-w-0 rounded border border-luxe-or-muted/40 bg-luxe-noir px-3 py-2 pr-10 text-luxe-blanc placeholder:text-luxe-blanc-muted focus:border-luxe-or focus:outline-none font-dossier-nombres"
      />
      {showStatus && (
        <span
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 font-dossier-nombres text-lg leading-none"
          aria-hidden
        >
          {status === "valid" ? (
            <span className="text-green-500" title="Numéro complet">
              ✓
            </span>
          ) : (
            <span className="text-red-400" title="Numéro incomplet">
              ✕
            </span>
          )}
        </span>
      )}
    </div>
  );
}
