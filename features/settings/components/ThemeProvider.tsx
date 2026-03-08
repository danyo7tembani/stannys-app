"use client";

import { useEffect } from "react";
import { useSettingsStore } from "../store";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSettingsStore((s) => s.theme);

  useEffect(() => {
    const apply = () => {
      const root = document.documentElement;
      root.classList.remove("light", "dark");
      if (theme === "system") {
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        root.classList.add(prefersDark ? "dark" : "light");
      } else {
        root.classList.add(theme);
      }
    };
    apply();
    if (theme === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      mq.addEventListener("change", apply);
      return () => mq.removeEventListener("change", apply);
    }
  }, [theme]);

  return <>{children}</>;
}
