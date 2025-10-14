"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { canAccessPage } from "../lib/accessControl";
import Image from "next/image";

export default function MembresHub() {
  const router = useRouter();
  const [profile, setProfile] = useState({ role: null });

  // ✅ Vérifie la connexion et les droits d'accès
  useEffect(() => {
    const userId = localStorage.getItem("userId");
    const userRole = localStorage.getItem("userRole");
    const userEmail = localStorage.getItem("userEmail");

    if (!userId || !userRole) {
      router.push("/login");
      return;
    }

    if (!canAccessPage(userRole, "/membres-hub")) {
      alert("⛔ Accès refusé : vous n'avez pas les droits nécessaires.");
      router.push("/home");
      return;
    }

    setProfile({ id: userId, role: userRole, email: userEmail });
  }, [router]);

  /* 🧩 DÉBUT DU CODE DE DÉCONNEXION — À COPIER SUR TES AUTRES PAGES */
  const handleLogout = () => {
    localStorage.removeItem("userId");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userEmail");
    router.push("/login");
  };
  /* 🧩 FIN DU CODE DE DÉCONNEXION */

  return (
    <div
      className="min-h-screen flex flex-col items-center p-6"
      style={{
        background: "linear-gradient(135deg, #1A2980 0%, #26D0CE 100%)",
      }}
    >
      {/* Header avec logo et déconnexion */}
      <div className="flex justify-between items-center w-full max-w-5xl mb-6">
        <Image src="/logo.png" alt="SoulTrack Logo" width={80} height={80} />
        <p
          onClick={handleLogout}
          className="text-white text-sm cursor-pointer hover:underline ml-auto"
        >
          Déconnexion
        </p>
      </div>

      {/* Titre principal */}
      <h1 className="text-4xl sm:text-5xl font-handwriting text-white mb-4">
        Suivis des membres 👥
      </h1>

      {/* Description */}
      <p className="text-white text-center max-w-2xl mb-6">
        Ici, les responsables peuvent suivre, mettre à jour et accompagner les membres de leur groupe avec amour et attention 💛
      </p>

      {/* Contenu principal (à personnaliser) */}
      <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-4xl">
        <p className="text-gray-700 text-center">
          👉 Ici, tu peux ajouter ton tableau des membres, les filtres, les boutons d’action, etc.
        </p>
      </div>
    </div>
  );
}
