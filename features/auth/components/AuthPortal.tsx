"use client";

import Image from "next/image";
import { Card } from "@/shared/ui";
import { LoginForm } from "./LoginForm";

export function AuthPortal() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm flex flex-col items-center">
        <Image
          src="/logo.png"
          alt="Stanny's"
          width={160}
          height={80}
          className="h-20 w-auto object-contain mb-6"
        />
        <h1 className="font-serif text-2xl font-semibold text-luxe-blanc text-center mt-2 mb-8">
          Authentification
        </h1>
        <Card className="p-8 w-full">
          <LoginForm />
        </Card>
      </div>
    </div>
  );
}
