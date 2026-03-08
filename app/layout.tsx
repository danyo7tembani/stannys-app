import type { Metadata } from "next";
import { Playfair_Display, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { AuthGuard } from "@/features/auth/components";
import { ThemeProvider } from "@/features/settings/components";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-cormorant",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Stanny's",
  description:
    "Sur-mesure de luxe — Catalogue, Dossier Client, Transmission Atelier.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${playfair.variable} ${cormorant.variable}`}>
      <body className="min-h-screen font-sans">
        <AuthGuard>
          <ThemeProvider>{children}</ThemeProvider>
        </AuthGuard>
      </body>
    </html>
  );
}
