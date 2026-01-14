"use client";

import LogoutLink from "./LogoutLink";

export default function Header({ prenom, eglise = "Église Principale", branche = "Maurice" }) {
  return (
    <div className="w-full max-w-5xl flex flex-col items-center space-y-2">

      {/* Barre du haut : Retour / Déconnexion */}
      <div className="w-full flex justify-between items-center mb-1">
        <button
          onClick={() => history.back()}
          className="text-white text-base hover:text-gray-200 transition-colors"
        >
          ← Retour
        </button>
        <LogoutLink className="text-white text-base" />
      </div>

      {/* Bienvenue et infos utilisateur */}
      <div className="text-center">
        <p className="text-white text-base mb-1">
          👋 Bienvenue {prenom}
        </p>
        <p className="text-white text-base">
          {eglise} — {branche}
        </p>
      </div>

      {/* Logo centré */}
      <div className="mt-2">
        <img src="/logo.png" alt="Logo SoulTrack" className="w-20 h-20 mx-auto" />
      </div>
    </div>
  );
}
