"use client";

import { useState, useCallback } from "react";
import { AuthInput } from "./AuthInput";
import { AuthNeonButton } from "./AuthNeonButton";
import { useAuth } from "../hooks";

export function LoginForm() {
  const { login, error } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      login({ username, password });
    },
    [login, username, password]
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <AuthInput
        label="Nom (rôle)"
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="admin, editeur, lecteur ou atelier"
        autoComplete="username"
        required
      />
      <AuthInput
        label="Code"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="••••••••"
        autoComplete="current-password"
        required
      />
      {error && (
        <p className="text-sm text-red-400" role="alert">
          {error}
        </p>
      )}
      <div className="flex justify-center">
        <AuthNeonButton>Se connecter</AuthNeonButton>
      </div>
    </form>
  );
}
