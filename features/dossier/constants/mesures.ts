/**
 * Liste des mesures client (noms uniquement), en 3 groupes.
 * Clé = identifiant pour dossier.mesures (Record<string, number>).
 */
export const MESURES_HAUT_DU_CORPS = [
  { id: "tourDeCou", label: "Tour de cou" },
  { id: "tourDePoitrine", label: "Tour de poitrine" },
  { id: "tourDeTailleBuste", label: "Tour de taille (buste)" },
  { id: "tourDeBassinVeste", label: "Tour de bassin (veste)" },
  { id: "carrureDos", label: "Carrure dos" },
  { id: "carrureDevant", label: "Carrure devant" },
  { id: "largeurEpaule", label: "Largeur d'épaule" },
  { id: "longueurDosVeste", label: "Longueur dos (veste)" },
  { id: "longueurTailleDos", label: "Longueur taille dos" },
] as const;

export const MESURES_BRAS = [
  { id: "profondeurEmmanchure", label: "Profondeur d'emmanchure" },
  { id: "longueurMancheExterieure", label: "Longueur de manche (extérieure)" },
  { id: "longueurMancheInterieure", label: "Longueur de manche (intérieure)" },
  { id: "tourDeBiceps", label: "Tour de biceps" },
  { id: "tourDePoignet", label: "Tour de poignet" },
  { id: "aisanceMontre", label: "Aisance pour la montre" },
] as const;

export const MESURES_BAS_DU_CORPS = [
  { id: "tourDeCeinture", label: "Tour de ceinture" },
  { id: "tourDeBassinFesses", label: "Tour de bassin (fesses)" },
  { id: "enfourchureMontant", label: "Enfourchure (ou Montant)" },
  { id: "tourDeCuisse", label: "Tour de cuisse" },
  { id: "tourDeGenou", label: "Tour de genou" },
  { id: "tourDeCheville", label: "Tour de cheville (ou largeur du bas)" },
  { id: "longueurExterieureOutseam", label: "Longueur extérieure (Outseam)" },
  { id: "longueurInterieureInseam", label: "Longueur intérieure (Inseam)" },
] as const;

export const GROUPES_MESURES = [
  { titre: "Le Haut du Corps", mesures: MESURES_HAUT_DU_CORPS },
  { titre: "Les Bras", mesures: MESURES_BRAS },
  { titre: "Le Bas du Corps", mesures: MESURES_BAS_DU_CORPS },
] as const;

/** Nombre minimum de mesures à remplir par groupe pour valider l'étape. */
export const MIN_MESURES_PAR_GROUPE = 3;
