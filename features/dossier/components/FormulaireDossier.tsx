"use client";

import { Input, Select } from "@/shared/ui";
import { isValidEmail } from "@/shared/utils/email";
import { useDossierForm } from "../hooks";
import { COUNTRY_PHONE_CODES, DEFAULT_COUNTRY_CODE } from "../constants/country-codes";

const countryOptions = COUNTRY_PHONE_CODES.map((c) => ({
  value: c.code,
  label: `${c.code} ${c.label}`,
}));

export function FormulaireDossier() {
  const { dossier, handleChange, setDossier } = useDossierForm();
  const mailValue = dossier.mail ?? "";
  const mailError =
    mailValue.trim() && !isValidEmail(mailValue)
      ? "Indiquez une adresse e-mail valide avec un nom de domaine (ex. nom@gmail.com)"
      : undefined;

  return (
    <form className="space-y-6">
      <Input
        label="Prénom"
        name="prenom"
        value={dossier.prenom ?? ""}
        onChange={handleChange}
        placeholder="Prénom du client"
        autoComplete="given-name"
      />
      <Input
        label="Nom"
        name="nom"
        value={dossier.nom ?? ""}
        onChange={handleChange}
        placeholder="Nom du client"
        autoComplete="family-name"
      />

      <div className="space-y-1">
        <label className="block text-sm font-medium text-luxe-blanc-muted">
          Contact 1 (obligatoire)
        </label>
        <div className="flex gap-2">
          <Select
            options={countryOptions}
            value={dossier.contact1Prefix ?? DEFAULT_COUNTRY_CODE}
            onChange={(e) =>
              setDossier({ contact1Prefix: e.target.value })
            }
            className="min-w-[140px] shrink-0"
            aria-label="Indicatif pays contact 1"
          />
          <input
            name="contact1"
            type="tel"
            value={dossier.contact1 ?? ""}
            onChange={(e) => setDossier({ contact1: e.target.value })}
            placeholder="06 123 45 67"
            autoComplete="tel"
            className="input-luxe w-full min-w-0 rounded border border-luxe-or-muted/40 bg-luxe-noir px-3 py-2 text-luxe-blanc placeholder:text-luxe-blanc-muted focus:border-luxe-or focus:outline-none"
            aria-label="Numéro contact 1"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium text-luxe-blanc-muted">
          Contact 2 (facultatif)
        </label>
        <div className="flex gap-2">
          <Select
            options={countryOptions}
            value={dossier.contact2Prefix ?? DEFAULT_COUNTRY_CODE}
            onChange={(e) =>
              setDossier({ contact2Prefix: e.target.value })
            }
            className="min-w-[140px] shrink-0"
            aria-label="Indicatif pays contact 2"
          />
          <input
            name="contact2"
            type="tel"
            value={dossier.contact2 ?? ""}
            onChange={(e) => setDossier({ contact2: e.target.value })}
            placeholder="Optionnel"
            autoComplete="tel"
            className="input-luxe w-full min-w-0 rounded border border-luxe-or-muted/40 bg-luxe-noir px-3 py-2 text-luxe-blanc placeholder:text-luxe-blanc-muted focus:border-luxe-or focus:outline-none"
            aria-label="Numéro contact 2"
          />
        </div>
      </div>

      <Input
        label="Mail"
        name="mail"
        type="email"
        value={dossier.mail ?? ""}
        onChange={handleChange}
        placeholder="exemple@domaine.com"
        autoComplete="email"
        error={mailError}
      />

      <Input
        label="Adresse"
        name="adresse"
        value={dossier.adresse ?? ""}
        onChange={handleChange}
        placeholder="Adresse"
        autoComplete="street-address"
      />
    </form>
  );
}
