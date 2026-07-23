"use client";

import { usePathname } from "next/navigation";
import { useNavigationBarColor } from "../hooks/useNavigationBarColor";

// Couleur par défaut : fond bleu uni (#333699) utilisé par la majorité
// des pages "liste" (ex: /cellule/list-cellules, /membres/list-conseillers).
const DEFAULT_COLOR = { color: "#333699", isLight: false };

// Couleur pour les pages avec le fond en gradient
// (linear-gradient(135deg, #2E3192 0%, #92EFFD 100%)).
// On utilise la couleur de fin du gradient (#92EFFD, claire) car c'est
// généralement ce qui est visible en bas d'écran, là où se trouve la nav bar.
const GRADIENT_COLOR = { color: "#92EFFD", isLight: true };

// Routes utilisant le fond en gradient (pages "hub" / dashboard).
// Ajoutez ici toute nouvelle page qui utilise le même style de fond.
const GRADIENT_ROUTES = [
  "/",
  "/cellule",
  "/cellule/cellules-hub",
];

function getColorForPath(pathname) {
  if (GRADIENT_ROUTES.includes(pathname)) return GRADIENT_COLOR;
  return DEFAULT_COLOR;
}

export default function NavigationBarSync() {
  const pathname = usePathname();
  const { color, isLight } = getColorForPath(pathname);

  useNavigationBarColor(color, isLight);

  return null;
}
