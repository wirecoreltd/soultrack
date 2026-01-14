"use client";
import LogoutLink from "./LogoutLink";

export default function Header({ prenom, eglise, branche }) {
  return (
    <div className="w-full max-w-5xl mx-auto mt-4 mb-6">
      {/* Ligne retour + déconnexion */}
      <div className="flex justify-between items-center mb-2">
        <button className="text-white hover:text-gray-200 transition-colors">
          ← Retour
        </button>
        <LogoutLink />
      </div>

      {/* Bienvenue + église */}
      <div className="text-center">
        <div className="text-white">
          👋 Bienvenue <span className="font-semibold">{prenom}</span>
        </div>
        <div className="text-white">
          {eglise}{" "}
          <span className="text-amber-300 font-semibold">— {branche}</span>
        </div>
      </div>

      {/* Logo centré */}
      <div className="flex justify-center mt-4">
        <img src="/logo.png" alt="Logo SoulTrack" className="w-20 h-20" />
      </div>
    </div>
  );
}
