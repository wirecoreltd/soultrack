"use client";
import "@capacitor-community/safe-area";

// La couleur des barres système (haut/bas) est désormais entièrement
// pilotée par capacitor.config.js (plugin SafeArea). Cet import suffit
// à initialiser le pont natif du plugin.
export default function NavigationBarSync() {
  return null;
}
