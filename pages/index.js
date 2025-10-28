//pages/index.js
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LogoutLink from "../components/LogoutLink";

const roleCards = {
  Administrateur: [ 
    { path: "/membres-hub", label: "Suivis des membres", emoji: "👤", color: "blue-500" },
    { path: "/evangelisation-hub", label: "Évangélisation", emoji: "🙌", color: "green-500" },
    { path: "/cellules-hub", label: "Cellule", emoji: "🏠", color: "blue-500" },
    { path: "/rapport", label: "Rapport", emoji: "📊", color: "red-500" },
    { path: "/administrateur", label: "Admin", emoji: "🧑‍💻", color: "blue-400" },
  ],
  ResponsableIntegration: [
    { path: "/membres-hub", label: "Suivis des membres", emoji: "👤", color: "blue-500" },
  ],
  ResponsableEvangelisation: [
    { path: "/evangelisation-hub", label: "Évangélisation", emoji: "🙌", color: "green-500" },
  ],
  ResponsableCellule: [
    { path: "/cellules-hub", label: "Cellule", emoji: "🏠", color: "blue-500" },
  ],
  Membre: [],
};

export default function IndexPage() {
  const [userEmail, setUserEmail] = useState("");
  const [roles, setRoles] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const email = localStorage.getItem("userEmail");
    setUserEmail(email || "Inconnu");

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
      {/* 🔹 Top bar: Retour + Bienvenue + Déconnexion */}
      <div className="w-full max-w-5xl flex justify-between items-center mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center text-white font-semibold hover:text-gray-200 transition-colors"
        >
          ← Retour
        </button>
        <div className="flex flex-col items-end">
          <p className="text-gray-200 text-sm mb-1">Bienvenue {userEmail}</p>
          <LogoutLink />
        </div>
      </div>

      {/* 🔹 Logo centré */}
      <div className="mb-6">
        <img src="/logo.png" alt="Logo SoulTrack" className="w-20 h-20 mx-auto" />
      </div>

      {/* 🔹 Message motivant */}
      <p className="text-white text-lg italic mb-6 max-w-2xl">
        "La famille est le premier lieu où l'amour, le soutien et la foi se transmettent. Prenez soin de ceux qui vous entourent et soyez un exemple d'unité et de bonté."
      </p>

      {/* 🔹 Cartes des fonctionnalités */}
      <div className="flex flex-col md:flex-row flex-wrap gap-4 justify-center items-center w-full max-w-4xl">
        {cardsToShow.map((card) => (
          <div
            key={card.path}
            onClick={() => handleRedirect(card.path)}
            className={`flex-1 min-w-[250px] w-full h-32 bg-white rounded-2xl shadow-md flex flex-col justify-center items-center border-t-4 border-${card.color} p-3 hover:shadow-lg transition-all duration-200 cursor-pointer`}
          >
            <div className="text-4xl mb-1">{card.emoji}</div>
            <div className="text-lg font-bold text-gray-800">{card.label}</div>
          </div>
        ))}
      </div>

      {/* 🔹 Verset biblique */}
      <div className="text-white text-lg font-handwriting-light max-w-2xl mt-6">
        Car le corps ne se compose pas d’un seul membre, mais de plusieurs. <br />
        1 Corinthiens 12:14 ❤️
      </div>
    </div>
  );
}
