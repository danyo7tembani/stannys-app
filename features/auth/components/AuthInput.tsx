"use client";

import { forwardRef } from "react";
import "../styles/auth-inputs.css";

export interface AuthInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(
  ({ label, error, id, className, ...props }, ref) => {
    const inputId =
      id ?? label?.toLowerCase().replace(/\s+/g, "-").replace(/'/g, "");

    return (
      <div className="space-y-1">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-luxe-blanc-muted"
          >
            {label}
          </label>
        )}
        <div className="auth-input-container">
          <input
            ref={ref}
            id={inputId}
            className={className}
            {...props}
          />
        </div>
        {error && (
          <p className="text-sm text-red-400" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);
AuthInput.displayName = "AuthInput";
