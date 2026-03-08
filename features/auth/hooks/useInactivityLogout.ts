"use client";

import { useEffect, useRef, useCallback } from "react";

const INACTIVITY_MS = 5 * 60 * 1000; // 5 minutes

const ACTIVITY_EVENTS = [
  "mousedown",
  "mousemove",
  "keydown",
  "scroll",
  "touchstart",
  "click",
] as const;

/**
 * Déconnexion automatique après un délai d'inactivité (aucun clic, défilement, touche, etc.).
 * À utiliser uniquement quand l'utilisateur est authentifié.
 */
export function useInactivityLogout(onLogout: () => void, enabled: boolean) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onLogoutRef = useRef(onLogout);
  onLogoutRef.current = onLogout;

  const resetTimer = useCallback(() => {
    if (!enabled) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      onLogoutRef.current();
    }, INACTIVITY_MS);
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;

    resetTimer();

    const handleActivity = () => resetTimer();

    for (const ev of ACTIVITY_EVENTS) {
      window.addEventListener(ev, handleActivity);
    }

    return () => {
      for (const ev of ACTIVITY_EVENTS) {
        window.removeEventListener(ev, handleActivity);
      }
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [enabled, resetTimer]);
}
