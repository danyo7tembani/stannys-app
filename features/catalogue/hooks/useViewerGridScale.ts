"use client";

import { useEffect, useState } from "react";

const GRID_W = 1100;
const GRID_H = 1081;
const MIN_SCALE = 0.32;
const STACK_BREAKPOINT = 720;

export function useViewerGridScale(containerRef: React.RefObject<HTMLDivElement | null>) {
  const [scale, setScale] = useState(1);
  const [isStacked, setIsStacked] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const update = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (w <= 0 || h <= 0) return;

      if (w < STACK_BREAKPOINT) {
        setIsStacked(true);
        setScale(1);
        return;
      }

      setIsStacked(false);
      const availableW = w - 32;
      const availableH = h;
      const scaleW = availableW / GRID_W;
      const scaleH = availableH / GRID_H;
      const s = Math.max(MIN_SCALE, Math.min(1, scaleW, scaleH));
      setScale(s);
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [containerRef]);

  return { scale, isStacked };
}
