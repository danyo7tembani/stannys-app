"use client";

import { forwardRef } from "react";
import { cn } from "@/shared/lib";

export type ButtonVariant = "primary" | "secondary" | "ghost";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  fullWidth?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: "btn-luxe-primary",
  secondary: "btn-luxe",
  ghost:
    "text-luxe-or hover:bg-luxe-or/10 border-transparent hover:border-luxe-or/30",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = "secondary", fullWidth, type = "button", children, ...props },
    ref
  ) => (
    <button
      ref={ref}
      type={type}
      className={cn(
        "inline-flex items-center justify-center rounded-sm border px-6 py-3 font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-luxe-or focus:ring-offset-2 focus:ring-offset-luxe-noir disabled:opacity-50 disabled:pointer-events-none",
        variantClasses[variant],
        fullWidth && "w-full",
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
);
Button.displayName = "Button";
