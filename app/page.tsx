import { redirect } from "next/navigation";

/**
 * Ouverture directe sur le catalogue — section Vestes par défaut.
 */
export default function HomePage() {
  redirect("/catalogue/vestes");
}
