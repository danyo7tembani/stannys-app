"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

const SPLASH_DURATION_MS = 2000;

export function AuthSplash({ children }: { children: React.ReactNode }) {
  const [splashDone, setSplashDone] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setSplashDone(true), SPLASH_DURATION_MS);
    return () => clearTimeout(t);
  }, []);

  if (!splashDone) {
    return (
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-[var(--luxe-noir)]"
        aria-hidden="true"
      >
        <Image
          src="/logo.png"
          alt=""
          width={200}
          height={100}
          className="h-24 w-auto object-contain"
          style={{
            animation: "loading-zoom 2s ease-in-out 1 forwards",
          }}
          priority
          unoptimized={false}
        />
      </div>
    );
  }

  return <>{children}</>;
}
