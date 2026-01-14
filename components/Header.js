// components/Header.js
"use client";

import { useRouter } from "next/navigation";
import LogoutLink from "./LogoutLink";

export default function Header({ prenom, eglise, branche }) {
  const router = useRouter();

  return (
    <div className="w-full bg-transparent p-6 flex flex-col items-center relative">
      {/* Ligne du haut: ← Retour (gauche) | Déconnexion (droite) */}
      <div className="w-full flex justify-between items-center mb-2">
        <button
          onClick={() => router.back()}
          className="text-white text-base font-normal hover:text-gray-200 transition-colors"
        >
          ← Retour
        </button>
        <LogoutLink className="text-white text-base font-normal" />
      </div>

      {/* Ligne du milieu: Bienvenue et Église */}
      <div className="w-full flex flex-col items-start mb-4">
        <p className="text-white text-base font-normal">
          👋 Bienvenue <span className="font-semibold">{prenom}</span>
        </p>
        <p className="text-white text-base font-normal">
          {eglise} — <span className="text-amber-300 font-semibold">{branche}</span>
        </p>
      </div>

      {/* Logo centré */}
      <div className="flex justify-center w-full">
        <img src="/logo.png" alt="Logo SoulTrack" className="w-20 h-20" />
      </div>
    </div>
  );
}
