"use client";

import { useNavigationBarColor } from "../hooks/useNavigationBarColor";

// Nav bar blanche partout, icônes foncées. Simple, fixe, fiable.
export default function NavigationBarSync() {
  useNavigationBarColor("#FFFFFF", true);
  return null;
}
