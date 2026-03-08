"use client";

import { useState, useCallback } from "react";
import "../styles/auth-button.css";

export interface AuthNeonButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export function AuthNeonButton({
  children,
  onClick,
  type = "submit",
  ...props
}: AuthNeonButtonProps) {
  const [pulseActive, setPulseActive] = useState(false);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      setPulseActive(true);
      const t = window.setTimeout(() => {
        setPulseActive(false);
        window.clearTimeout(t);
      }, 500);
      onClick?.(e);
    },
    [onClick]
  );

  return (
    <button
      type={type}
      className="auth-neon-button"
      onClick={handleClick}
      {...props}
    >
      <span
        className={`auth-neon-button__pulse ${pulseActive ? "auth-neon-button__pulse--active" : ""}`}
        aria-hidden
      />
      {children}
    </button>
  );
}
