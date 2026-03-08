"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/shared/constants";
import { apiUrl } from "@/shared/api/client";
import { useAuthStore } from "@/features/auth/store";

interface UserRow {
  role: string;
  label: string;
}

export function UtilisateursPageContent() {
  const router = useRouter();
  const role = useAuthStore((s) => s.role);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (role !== "admin") {
      router.replace(ROUTES.PARAMETRES);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(apiUrl("users"));
        if (!res.ok) throw new Error("Erreur chargement");
        const data = await res.json();
        if (!cancelled) setUsers(Array.isArray(data) ? data : []);
      } catch (e) {
        if (!cancelled) setError("Impossible de charger les utilisateurs.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [role, router]);

  const handleSubmit = useCallback(
    async (r: string, newCode: string, adminPassword: string) => {
      if (!newCode.trim() || !adminPassword) return;
      setUpdating(r);
      setError(null);
      setMessage(null);
      try {
        const res = await fetch(apiUrl("users/code"), {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            role: r,
            newCode: newCode.trim(),
            adminPassword,
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(data.error ?? "Erreur lors de la modification.");
          return;
        }
        setMessage(`Code pour ${r} mis à jour.`);
      } catch {
        setError("Erreur de connexion.");
      } finally {
        setUpdating(null);
      }
    },
    []
  );

  if (role !== "admin") {
    return null;
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <p className="text-luxe-blanc-muted">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <Link
          href={ROUTES.PARAMETRES}
          className="inline-flex items-center justify-center rounded border border-luxe-or-muted/40 bg-luxe-noir-soft px-4 py-2 text-sm font-medium text-luxe-or transition-colors hover:border-luxe-or/50 hover:bg-white/5"
        >
          ← Retour aux paramètres
        </Link>
      </div>
      <h1 className="font-serif text-3xl font-semibold text-luxe-blanc">
        Gestion des utilisateurs
      </h1>
      <p className="mt-2 text-luxe-blanc-muted">
        Attribuez ou modifiez le code (mot de passe) de chaque rôle. Connexion avec le nom du rôle et ce code.
      </p>

      {error && (
        <p className="mt-4 text-sm text-red-400" role="alert">
          {error}
        </p>
      )}
      {message && (
        <p className="mt-4 text-sm text-emerald-400" role="status">
          {message}
        </p>
      )}

      <div className="mt-8 space-y-6">
        {users.map((u) => (
          <UserCodeForm
            key={u.role}
            role={u.role}
            label={u.label}
            updating={updating === u.role}
            onSubmit={handleSubmit}
          />
        ))}
      </div>
    </div>
  );
}

function UserCodeForm({
  role,
  label,
  updating,
  onSubmit,
}: {
  role: string;
  label: string;
  updating: boolean;
  onSubmit: (role: string, newCode: string, adminPassword: string) => void;
}) {
  const [newCode, setNewCode] = useState("");
  const [adminPassword, setAdminPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(role, newCode, adminPassword);
  };

  return (
    <section className="rounded border border-luxe-or-muted/30 bg-luxe-noir-soft p-4">
      <h2 className="font-serif text-lg font-medium text-luxe-or">
        {label} <span className="text-luxe-blanc-muted font-normal">({role})</span>
      </h2>
      <p className="mt-1 text-sm text-luxe-blanc-muted">
        Identifiant de connexion : <strong>{role}</strong>. Modifiez le code ci-dessous.
      </p>
      <form onSubmit={handleSubmit} className="mt-4 flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-xs text-luxe-blanc-muted">Nouveau code</span>
          <input
            type="password"
            value={newCode}
            onChange={(e) => setNewCode(e.target.value)}
            className="rounded border border-luxe-or-muted/40 bg-luxe-noir px-3 py-2 text-sm text-luxe-blanc placeholder-luxe-blanc-muted focus:border-luxe-or focus:outline-none"
            placeholder="••••••••"
            required
            autoComplete="new-password"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs text-luxe-blanc-muted">Votre mot de passe admin</span>
          <input
            type="password"
            value={adminPassword}
            onChange={(e) => setAdminPassword(e.target.value)}
            className="rounded border border-luxe-or-muted/40 bg-luxe-noir px-3 py-2 text-sm text-luxe-blanc placeholder-luxe-blanc-muted focus:border-luxe-or focus:outline-none"
            placeholder="••••••••"
            required
            autoComplete="current-password"
          />
        </label>
        <button
          type="submit"
          disabled={updating}
          className="rounded border border-luxe-or/50 bg-luxe-or/10 px-4 py-2 text-sm font-medium text-luxe-or transition-colors hover:bg-luxe-or/20 disabled:opacity-50"
        >
          {updating ? "Enregistrement…" : "Modifier le code"}
        </button>
      </form>
    </section>
  );
}
