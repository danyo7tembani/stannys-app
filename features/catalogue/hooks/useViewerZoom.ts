import { useState, useCallback } from "react";

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 3;
const STEP = 0.25;

export function useViewerZoom(initial = 1) {
  const [zoom, setZoom] = useState(initial);
  const zoomIn = useCallback(
    () => setZoom((z) => Math.min(z + STEP, MAX_ZOOM)),
    []
  );
  const zoomOut = useCallback(
    () => setZoom((z) => Math.max(z - STEP, MIN_ZOOM)),
    []
  );
  return { zoom, zoomIn, zoomOut };
}
