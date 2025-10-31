// pages/index.js
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LogoutLink from "../components/LogoutLink";

const roleCards = {
  Administrateur: [
    { path: "/membres-hub", label: "Suivis des membres", emoji: "👥", color: "#3B82F6" }, // blue
    { path: "/evangelisation-hub", label: "Évangélisation", emoji: "✝️", color: "#14B8A6" }, // teal
    { path: "/cellules-hub", label: "Cellule", emoji: "🏠", color: "#06B6D4" }, // cyan
    { path: "/rapport", label: "Rapport", emoji: "📈", color: "#60A5FA" }, // light blue
    { path: "/administrateur", label: "Admin", emoji: "⚙️", color: "#0EA5E9" }, // sky
  ],
  ResponsableIntegration: [
    { path: "/membres-hub", label: "Suivis des membres", emoji: "👥", color: "#3B82F6" },
  ],
  ResponsableEvangelisation: [
    { path: "/evangelisation-hub", label: "Évangélisation", emoji: "✝️", color: "#14B8A6" },
  ],
  ResponsableCellule: [
    { path: "/cellules-hub", label: "Cellule", emoji: "🏠", color: "#06B6D4" },
  ],
  Membre: [],
};

export default function IndexPage() {
  const [userName, setUserName] = useState("");
  const [roles, setRoles] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const name = localStorage.getItem("userName") || "Utilisateur";
    const prenom = name.split(" ")[0];
    setUserName(prenom);

    const storedRoles = localStorage.getItem("userRole");
    if (storedRoles) {
      try {
        const parsedRoles = JSON.parse(storedRoles);
        setRoles(Array.isArray(parsedRoles) ? parsedRoles : [parsedRoles]);
      } catch {
        setRoles([storedRoles]);
      }
    }
  }, []);

  const handleRedirect = (path) => {
    router.push(path.startsWith("/") ? path : "/" + path);
  };

  let cardsToShow = [];
  if (roles.includes("Administrateur")) {
    Object.values(roleCards).forEach((cards) => {
      cards.forEach((card) => {
        if (!cardsToShow.find((c) => c.path === card.path)) {
          cardsToShow.push(card);
        }
      });
    });
  } else {
    roles.forEach((role) => {
      const roleKey = role.trim();
      if (roleCards[roleKey]) {
        roleCards[roleKey].forEach((card) => {
          if (!cardsToShow.find((c) => c.path === card.path)) {
            cardsToShow.push(card);
          }
        });
      }
    });
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center p-6 text-center space-y-6 font-[Poppins]"
      style={{ background: "linear-gradient(135deg, #1E3A8A 0%, #38BDF8 100%)" }}
    >
      {/* 🔹 Barre du haut */}
      <div className="w-full max-w-5xl flex justify-between items-start mb-6 bg-white/10 backdrop-blur-sm rounded-xl px-6 py-3 shadow-sm">
        {/* Bouton retour */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 text-white hover:text-gray-200 transition-colors mt-[6px]"
        >
          ← <span>Retour</span>
        </button>

        {/* Déconnexion + Bienvenue */}
        <div className="flex flex-col items-end">
          <div>
            <LogoutLink className="text-red-300 hover:text-red-400" />
          </div>
          <p className="text-yellow-200 text-sm italic mt-2">
            👋 Bienvenue <span className="font-semibold text-white">{userName}</span>
          </p>
        </div>
      </div>

      {/* 🔹 Logo */}
      <div className="mb-4">
        <img src="/logo.png" alt="Logo SoulTrack" className="w-20 h-18 mx-auto" />
      </div>

      {/* 🔹 Texte inspirant */}
      <p className="text-white/90 text-lg italic mb-6 max-w-2xl leading-relaxed tracking-wide font-light">
        “Car le corps ne se compose pas d’un seul membre, mais de plusieurs.”
        <br />
        <span className="font-semibold">1 Corinthiens 12:14 ❤️</span>
      </p>

      {/* 🔹 Cartes */}
      <div className="flex flex-col md:flex-row flex-wrap gap-5 justify-center items-center w-full max-w-4xl">
        {cardsToShow.map((card) => (
          <div
            key={card.path}
            onClick={() => handleRedirect(card.path)}
            className="flex-1 min-w-[240px] w-full h-32 bg-white/80 backdrop-blur-md rounded-2xl shadow-md flex flex-col justify-center items-center border-t-4 p-3 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 hover:scale-105 cursor-pointer"
            style={{ borderTopColor: card.color }}
          >
            <div className="text-5xl mb-2">{card.emoji}</div>
            <div className="text-lg font-bold text-gray-800">{card.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
