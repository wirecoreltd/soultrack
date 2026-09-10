"use client";
import { useEffect } from "react";
import { SystemBars, SystemBarsStyle } from "@capacitor/core";

export default function NavigationBarSync() {
  useEffect(() => {
    // Icônes claires : lisibles sur les deux fonds bleus configurés
    // dans capacitor.config.js (plugins.EdgeToEdge).
    SystemBars.setStyle({ style: SystemBarsStyle.Dark }); // "Dark" = fond sombre → icônes claires
  }, []);

  return null;
}
