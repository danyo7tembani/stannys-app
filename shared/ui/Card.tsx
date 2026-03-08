"use client";

import { forwardRef } from "react";
import { cn } from "@/shared/lib";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: "div" | "article" | "section";
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, as: Component = "div", ...props }, ref) => (
    <Component
      ref={ref}
      className={cn("card-luxe rounded-sm border border-luxe-or-muted/30 bg-luxe-noir-soft transition-all duration-300 hover:border-luxe-or/50", className)}
      {...props}
    />
  )
);
Card.displayName = "Card";
