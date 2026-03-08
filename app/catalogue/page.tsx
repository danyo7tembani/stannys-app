import { redirect } from "next/navigation";

/** À l’ouverture du catalogue, on arrive sur Vestes par défaut. */
export default function CataloguePage() {
  redirect("/catalogue/vestes");
}
