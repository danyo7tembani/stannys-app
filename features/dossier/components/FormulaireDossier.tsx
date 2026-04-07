"use client";

import { Input, Select } from "@/shared/ui";
import { isValidEmail } from "@/shared/utils/email";
import { useDossierForm } from "../hooks";
import { COUNTRY_PHONE_CODES, DEFAULT_COUNTRY_CODE } from "../constants/country-codes";
import { digitsOnly, getNationalMaxDigits } from "../utils/phone-format";
import { NationalPhoneField } from "./NationalPhoneField";

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
            onChange={(e) => {
              const p = e.target.value;
              const cur = digitsOnly(dossier.contact1 ?? "");
              const max = getNationalMaxDigits(p);
              setDossier({
                contact1Prefix: p,
                contact1: cur.slice(0, max),
              });
            }}
            className="min-w-[140px] shrink-0"
            aria-label="Indicatif pays contact 1"
          />
          <NationalPhoneField
            name="contact1"
            prefix={dossier.contact1Prefix ?? DEFAULT_COUNTRY_CODE}
            value={digitsOnly(dossier.contact1 ?? "")}
            onChange={(d) => setDossier({ contact1: d })}
            aria-label="Numéro contact 1 (indicatif inclus)"
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
            onChange={(e) => {
              const p = e.target.value;
              const cur = digitsOnly(dossier.contact2 ?? "");
              const max = getNationalMaxDigits(p);
              setDossier({
                contact2Prefix: p,
                contact2: cur.slice(0, max),
              });
            }}
            className="min-w-[140px] shrink-0"
            aria-label="Indicatif pays contact 2"
          />
          <NationalPhoneField
            name="contact2"
            prefix={dossier.contact2Prefix ?? DEFAULT_COUNTRY_CODE}
            value={digitsOnly(dossier.contact2 ?? "")}
            onChange={(d) => setDossier({ contact2: d })}
            optional
            aria-label="Numéro contact 2 (indicatif inclus)"
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
