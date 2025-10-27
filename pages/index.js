// pages/index.js
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// 🔹 Mapping des rôles et des pages/cartes autorisées
const roleCards = {
  Admin: [
    { path: "/membres-hub", label: "Suivis des membres", emoji: "👤", color: "blue-500" },
    { path: "/evangelisation-hub", label: "Évangélisation", emoji: "🙌", color: "green-500" },
    { path: "/cellules-hub", label: "Cellule", emoji: "🏠", color: "purple-500" },
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
    { path: "/cellules-hub", label: "Cellule", emoji: "🏠", color: "purple-500" },
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

  // 🔹 Construit les cartes à afficher selon les rôles
  const cardsToShow = [];
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

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6 text-center space-y-6"
      style={{ background: "linear-gradient(135deg, #2E3192 0%, #92EFFD 100%)" }}
    >
      <h1 className="text-3xl font-bold mb-4 text-white">🏠 Page d'accueil</h1>
      <p className="text-lg mb-6 text-white">Bienvenue {userEmail}</p>

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

      <div className="text-white text-lg font-handwriting-light max-w-2xl mt-6">
        Car le corps ne se compose pas d’un seul membre, mais de plusieurs. <br />
        1 Corinthiens 12:14 ❤️
      </div>
    </div>
  );
}
