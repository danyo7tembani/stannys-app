"use client";

import { useToastStore } from "./toast-store";

function IconCheckCircle({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M8 12l2.5 2.5L16 9" />
    </svg>
  );
}

function IconXCircle({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M9 9l6 6M15 9l-6 6" />
    </svg>
  );
}

/**
 * Toasts centrés (succès vert / erreur rouge), icône + texte, disparition en fondu.
 */
export function ToastViewport() {
  const visible = useToastStore((s) => s.visible);
  const exiting = useToastStore((s) => s.exiting);
  const variant = useToastStore((s) => s.variant);
  const message = useToastStore((s) => s.message);

  if (!visible && !exiting) return null;

  const isSuccess = variant === "success";

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[220] flex items-center justify-center p-6"
      aria-live={isSuccess ? "polite" : "assertive"}
    >
      <div
        role={isSuccess ? "status" : "alert"}
        className={`pointer-events-auto flex max-w-[min(90vw,22rem)] items-center gap-3 rounded-lg border px-5 py-4 shadow-2xl backdrop-blur-sm transition-all duration-300 ease-out ${
          isSuccess
            ? "border-emerald-500/50 bg-emerald-950/95 text-emerald-50"
            : "border-red-500/50 bg-red-950/95 text-red-50"
        } ${exiting ? "scale-95 opacity-0" : "scale-100 opacity-100"}`}
      >
        {isSuccess ? (
          <IconCheckCircle className="h-8 w-8 shrink-0 text-emerald-400" />
        ) : (
          <IconXCircle className="h-8 w-8 shrink-0 text-red-400" />
        )}
        <p className="text-center text-sm font-medium leading-snug">{message}</p>
      </div>
    </div>
  );
}
