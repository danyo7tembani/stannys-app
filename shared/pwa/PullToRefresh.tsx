"use client";

import { useEffect, useRef, useState } from "react";

const PULL_THRESHOLD_PX = 72;
const MAX_PULL_PX = 120;

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName.toLowerCase();
  return (
    tag === "input" ||
    tag === "textarea" ||
    tag === "select" ||
    target.isContentEditable
  );
}

function isAtTop(): boolean {
  const scrollEl = document.scrollingElement || document.documentElement;
  return (scrollEl?.scrollTop ?? 0) <= 0;
}

export function PullToRefresh() {
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const activeRef = useRef(false);
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const lockAxisRef = useRef<"horizontal" | "vertical" | null>(null);
  const triggerArmedRef = useRef(false);
  const enabledRef = useRef(false);

  useEffect(() => {
    const media = window.matchMedia("(pointer: coarse)");
    const setEnabled = () => {
      enabledRef.current = media.matches;
    };
    setEnabled();
    media.addEventListener("change", setEnabled);

    const previousOverscroll = document.documentElement.style.overscrollBehaviorY;
    document.documentElement.style.overscrollBehaviorY = "contain";

    const onTouchStart = (e: TouchEvent) => {
      if (refreshing || !enabledRef.current) return;
      if (e.touches.length !== 1) return;
      if (!isAtTop()) return;
      if (isEditableTarget(e.target)) return;
      activeRef.current = true;
      lockAxisRef.current = null;
      triggerArmedRef.current = false;
      startXRef.current = e.touches[0].clientX;
      startYRef.current = e.touches[0].clientY;
      setPullDistance(0);
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!activeRef.current || refreshing || !enabledRef.current) return;
      if (e.touches.length !== 1) return;
      const x = e.touches[0].clientX;
      const y = e.touches[0].clientY;
      const dx = x - startXRef.current;
      const dy = y - startYRef.current;

      if (lockAxisRef.current === null) {
        const adx = Math.abs(dx);
        const ady = Math.abs(dy);
        if (adx < 8 && ady < 8) return;
        lockAxisRef.current = ady > adx ? "vertical" : "horizontal";
      }

      if (lockAxisRef.current === "horizontal") {
        activeRef.current = false;
        setPullDistance(0);
        return;
      }

      if (dy <= 0 || !isAtTop()) {
        setPullDistance(0);
        return;
      }

      e.preventDefault();
      const next = Math.min(MAX_PULL_PX, dy * 0.6);
      setPullDistance(next);
      triggerArmedRef.current = next >= PULL_THRESHOLD_PX;
    };

    const finishGesture = () => {
      if (!activeRef.current) return;
      activeRef.current = false;
      lockAxisRef.current = null;
      const shouldRefresh = triggerArmedRef.current && !refreshing;
      triggerArmedRef.current = false;
      setPullDistance(0);
      if (shouldRefresh) {
        setRefreshing(true);
        // Give feedback frame before reload.
        window.setTimeout(() => {
          window.location.reload();
        }, 120);
      }
    };

    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", finishGesture, { passive: true });
    window.addEventListener("touchcancel", finishGesture, { passive: true });

    return () => {
      media.removeEventListener("change", setEnabled);
      document.documentElement.style.overscrollBehaviorY = previousOverscroll;
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", finishGesture);
      window.removeEventListener("touchcancel", finishGesture);
    };
  }, [refreshing]);

  if (pullDistance <= 0 && !refreshing) return null;

  const progress = Math.min(1, pullDistance / PULL_THRESHOLD_PX);
  const rotate = Math.round(progress * 180);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[120] flex justify-center">
      <div
        className="mt-2 flex items-center gap-2 rounded-full border border-luxe-or/40 bg-luxe-noir/85 px-3 py-1.5 text-xs text-luxe-or shadow-lg"
        style={{ transform: `translateY(${Math.round(pullDistance * 0.45)}px)` }}
      >
        <svg
          className={refreshing ? "animate-spin" : ""}
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            transform: refreshing ? undefined : `rotate(${rotate}deg)`,
            transition: refreshing ? undefined : "transform 80ms linear",
          }}
          aria-hidden
        >
          <path d="M12 5v14" />
          <path d="m19 12-7 7-7-7" />
        </svg>
        <span>{refreshing ? "Actualisation..." : "Tirez pour actualiser"}</span>
      </div>
    </div>
  );
}
