//✅pages/index.js

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LogoutLink from "../components/LogoutLink";

const roleCards = {
  Administrateur: [
    { path: "/membres-hub", label: "Gestion des membres", emoji: "👥", color: "#0E7490" }, // bleu profond
    { path: "/evangelisation-hub", label: "Évangélisation", emoji: "✝️", color: "#F97316" }, // teal foncé
    { path: "/cellules-hub", label: "Cellule", emoji: "🏠", color: "#10B981" }, // cyan
    { path: "/rapport", label: "Rapport", emoji: "📈", color: "#FBBF24" }, // bleu clair
    { path: "/administrateur", label: "Admin", emoji: "⚙️", color: "#0EA5E9" }, // sky
  ],
  ResponsableIntegration: [
    { path: "/membres-hub", label: "Gestion des membres", emoji: "👥", color: "#0284C7" },
  ],
  ResponsableEvangelisation: [
    { path: "/evangelisation-hub", label: "Évangélisation", emoji: "✝️", color: "#0D9488" },
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
      className="min-h-screen flex flex-col items-center p-6 text-center space-y-6"
      style={{ background: "linear-gradient(135deg, #2E3192 0%, #92EFFD 100%)" }}
    >
      {/* 🔹 Top bar */}
      <div className="w-full max-w-5xl flex justify-between items-center mb-6">
        {/* Bouton retour */}
        <button
          onClick={() => router.back()}
          className="flex items-center text-white hover:text-gray-200 transition-colors"
        >
          ← Retour
        </button>

        {/* Déconnexion */}
        <div className="flex flex-col items-end">
          <LogoutLink className="text-red-300 hover:text-red-400 mb-1" />
          <p className="text-yellow-200 text-sm mt-2">
            👋 Bienvenue {userName}
          </p>
        </div>
      </div>

      {/* 🔹 Logo centré */}
      <div className="mb-6">
        <img src="/logo.png" alt="Logo SoulTrack" className="w-20 h-18 mx-auto" />
      </div>

      {/* 🔹 Message motivant */}
      <p className="text-white text-lg italic mb-6 max-w-2xl leading-relaxed tracking-wide font-light">
        La famille est le premier lieu où l'amour, le soutien et la foi se transmettent. Prenez soin de ceux qui vous entourent et soyez un exemple d'unité et de bonté.
      </p>

      {/* 🔹 Cartes des fonctionnalités */}
      <div className="flex flex-col md:flex-row flex-wrap gap-4 justify-center items-center w-full max-w-4xl">
        {cardsToShow.map((card) => (
          <div
            key={card.path}
            onClick={() => handleRedirect(card.path)}
            className="flex-1 min-w-[250px] w-full h-32 bg-white rounded-2xl shadow-md flex flex-col justify-center items-center border-t-4 p-3 hover:shadow-lg transition-all duration-200 cursor-pointer"
            style={{ borderTopColor: card.color }}
          >
            <div className="text-4xl mb-1">{card.emoji}</div>
            <div className="text-lg font-bold text-gray-800">{card.label}</div>
          </div>
        ))}
      </div>

      {/* 🔹 Verset biblique sous les cartes */}
      <div className="text-white text-lg italic max-w-2xl mt-6 leading-relaxed tracking-wide font-light">
        Car le corps ne se compose pas d’un seul membre, mais de plusieurs. <br />
        1 Corinthiens 12:14 ❤️
      </div>
    </div>
  );
}

