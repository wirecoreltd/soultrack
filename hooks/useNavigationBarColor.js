"use client";

import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";

/**
 * Hook pour piloter dynamiquement la couleur de la barre de navigation
 * Android (bas de l'écran) depuis une page Next.js chargée dans Capacitor.
 *
 * @param {string} color - Couleur hex (ex: "#333699")
 * @param {boolean} isLight - true si le fond est clair (icônes système en noir),
 *                            false si le fond est foncé (icônes système en blanc)
 */
export function useNavigationBarColor(color, isLight = false) {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    if (Capacitor.getPlatform() !== "android") return;

    let cancelled = false;

    import("@capacitor-community/navigation-bar")
      .then(({ NavigationBar }) => {
        if (cancelled) return;
        NavigationBar.setColor({ color, darkButtons: isLight }).catch(() => {});
      })
      .catch(() => {
        // Plugin non disponible (ex: build web) — on ignore silencieusement
      });

    return () => {
      cancelled = true;
    };
  }, [color, isLight]);
}

export default useNavigationBarColor;
