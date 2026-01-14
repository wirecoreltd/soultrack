"use client";

import { useRouter } from "next/navigation";
import LogoutLink from "./LogoutLink";
import Image from "next/image";

export default function Header({ prenom = "Admin", eglise = "Église Principale", branche = "Maurice" }) {
  const router = useRouter();

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col items-center p-4 space-y-3">
      
      {/* 🔹 Top bar: ← Retour et Déconnexion */}
      <div className="w-full flex justify-between items-center">
        <button
          onClick={() => router.back()}
          className="text-white font-login text-lg font-bold hover:text-gray-200 transition-colors"
        >
          ← Retour
        </button>

        <LogoutLink className="text-white font-login text-lg font-bold" />
      </div>

      {/* 🔹 Infos utilisateur */}
      <div className="flex flex-col items-center text-center space-y-1">
        <p className="text-yellow-100 font-login text-lg font-bold">👋 Bienvenue {prenom}</p>
        <p className="text-black font-login text-lg font-bold inline">
          {eglise}{" "}
          <span className="text-amber-300 font-login text-lg font-bold">- {branche}</span>
        </p>
      </div>

      {/* 🔹 Logo centré */}
      <div className="mt-3">
        <Image src="/logo.png" alt="SoulTrack Logo" width={100} height={100} />
      </div>

    </div>
  );
}
