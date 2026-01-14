"use client";

import LogoutLink from "./LogoutLink";

export default function Header({ prenom, eglise, branche }) {
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
      <div className="text-center space-y-1">
        <p className="text-yellow-100 text-base">
          👋 Bienvenue <span className="font-semibold text-white">{prenom}</span>
        </p>
        <p className="text-base text-black">
          {eglise} <span className="font-semibold text-amber-300">— {branche}</span>
        </p>
      </div>

      {/* Logo centré */}
      <div className="mt-2">
        <img src="/logo.png" alt="Logo SoulTrack" className="w-20 h-20 mx-auto" />
      </div>
    </div>
  );
}
