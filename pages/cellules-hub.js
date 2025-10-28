/* ✅ pages/cellules-hub.js */
"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import SendLinkPopup from "../components/SendLinkPopup";
import LogoutLink from "../components/LogoutLink";
import AccessGuard from "../components/AccessGuard";
import { useEffect, useState } from "react";

export default function CellulesHub() {
  const router = useRouter();
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const name = localStorage.getItem("userName") || "Utilisateur";
    const prenom = name.split(" ")[0]; // récupère uniquement le prénom
    setUserName(prenom);
  }, []);

  const handleRedirect = (path) => {
    router.push(path.startsWith("/") ? path : "/" + path);
  };

  const cards = [
    {
      path: "/ajouter-membre-cellule",
      label: "Ajouter un membre à la Cellule",
      emoji: "➕",
      color: "blue-500",
    },
    {
      path: "/membres-cellule",
      label: "Membres de la Cellule",
      emoji: "👥",
      color: "green-500",
    },
    {
      path: "/suivis-evangelisation",
      label: "Suivis des évangélisés",
      emoji: "📋",
      color: "orange-500",
    },
    {
      path: "/suivis-membres",
      label: "Suivis des membres",
      emoji: "📋",
      color: "yellow-500",
    },
  ];

  return (
    <AccessGuard allowedRoles={["Administrateur", "ResponsableCellule"]}>
      <div
        className="min-h-screen flex flex-col items-center p-6"
        style={{ background: "linear-gradient(135deg, #2E3192 0%, #92EFFD 100%)" }}
      >
        {/* 🔹 Top bar: Retour + Déconnexion + prénom */}
        <div className="w-full max-w-5xl flex justify-between items-center mb-6">
          {/* Retour */}
          <button
            onClick={() => router.back()}
            className="flex items-center text-white font-semibold hover:text-gray-200 transition-colors"
          >
            ← Retour
          </button>

          {/* Déconnexion et prénom */}
          <div className="flex flex-col items-end">
            <LogoutLink className="text-red-300 hover:text-red-400" />
            <p className="text-yellow-200 text-sm mt-4">Bienvenue {userName}</p>
          </div>
        </div>

        {/* 🔹 Logo centré */}
        <div className="mb-6">
          <Image src="/logo.png" alt="Logo SoulTrack" width={90} height={90} />
        </div>

        {/* 🔹 Cartes principales */}
        <div className="flex flex-col md:flex-row gap-6 justify-center w-full max-w-5xl mb-6">
          {cards.map((card) => (
            <div
              key={card.path}
              onClick={() => handleRedirect(card.path)}
              className={`flex-1 min-w-[250px] w-full h-32 bg-white rounded-2xl shadow-md flex flex-col justify-center items-center border-t-4 border-${card.color} p-6 hover:shadow-xl transition-all duration-200 cursor-pointer`}
            >
              <div className="text-5xl mb-2">{card.emoji}</div>
              <div className="text-lg font-bold text-gray-800 text-center">{card.label}</div>
            </div>
          ))}
        </div>

        {/* 🔹 Bouton popup */}
        <div className="w-full max-w-md mb-10">
          <SendLinkPopup
            label="Envoyer l'appli – Évangélisé"
            type="ajouter_evangelise"
            buttonColor="from-[#09203F] to-[#537895]"
          />
        </div>

        {/* 🔹 Verset biblique */}
        <div className="mt-auto mb-4 text-center text-white text-lg font-handwriting max-w-2xl">
          Car le corps ne se compose pas d’un seul membre, mais de plusieurs. <br />
          1 Corinthiens 12:14 ❤️
        </div>
      </div>
    </AccessGuard>
  );
}
