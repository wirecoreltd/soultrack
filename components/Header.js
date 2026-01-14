//✅ /components/Header.js
"use client";

import { useRouter } from "next/navigation";
import LogoutLink from "./LogoutLink";

export default function Header({ prenom, eglise, branche }) {
  const router = useRouter();

  return (
    <div className="w-full max-w-5xl mb-6">
      {/* Ligne du haut : Retour à gauche, Déconnexion à droite */}
      <div className="flex justify-between items-center mb-2">
        <button
          onClick={() => router.back()}
          className="text-white hover:text-gray-200"
        >
          ← Retour
        </button>
        <LogoutLink />
      </div>

      {/* Bienvenue et prénom */}
      <div className="text-right mb-1">
        <p className="text-white text-sm">
          👋 Bienvenue <span className="font-semibold">{prenom}</span>
        </p>
      </div>

      {/* Église et Branche sur une seule ligne */}
      <div className="text-right">
        <span className="text-white">{eglise}</span>{" "}
        <span className="text-amber-300 font-semibold">— {branche}</span>
      </div>

      {/* Logo centré */}
      <div className="flex justify-center mt-4">
        <img src="/logo.png" alt="Logo SoulTrack" className="w-20 h-18" />
      </div>
    </div>
  );
}
