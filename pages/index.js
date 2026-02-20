"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import supabase from "../lib/supabaseClient";
import HeaderPages from "../components/HeaderPages";
import Footer from "../components/Footer";

const roleCards = {
  Administrateur: [
    { path: "/membres-hub", label: "Gestion des membres", emoji: "👥", color: "#0E7490" },
    { path: "/evangelisation-hub", label: "Évangélisation", emoji: "✝️", color: "#F97316" },
    { path: "/cellules-hub", label: "Cellule", emoji: "🏠", color: "#10B981" },
    { path: "/rapport-hub", label: "Rapport", emoji: "📈", color: "#FBBF24" },
    { path: "/administrateur", label: "Admin", emoji: "⚙️", color: "#0EA5E9" },
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
  SuperviseurCellule: [
    { path: "/cellules-hub", label: "Cellule", emoji: "🏠", color: "#06B6D4" },
  ],
  Membre: [],
};

export default function IndexPage() {
  const router = useRouter();
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      // 1️⃣ Vérifier session Supabase
      const { data } = await supabase.auth.getSession();
      if (!data?.session) {
        router.replace("/SignupEglise");
        return;
      }

      // 2️⃣ Récupérer les rôles depuis localStorage
      const storedRoles = localStorage.getItem("userRole");
      if (storedRoles) {
        try {
          const parsedRoles = JSON.parse(storedRoles);
          setRoles(Array.isArray(parsedRoles) ? parsedRoles : [parsedRoles]);
        } catch {
          setRoles([storedRoles]);
        }
      }

      setLoading(false);
    };
    init();
  }, [router]);

  if (loading) return null;

  // 3️⃣ Construire la liste des cartes à afficher
  let cardsToShow = [];

  if (roles.includes("Administrateur")) {
    Object.values(roleCards).forEach((cards) => {
      cards.forEach((card) => {
        if (!cardsToShow.find((c) => c.path === card.path)) cardsToShow.push(card);
      });
    });
  } else {
    roles.forEach((role) => {
      const roleKey = role.trim();
      if (roleCards[roleKey]) {
        roleCards[roleKey].forEach((card) => {
          if (!cardsToShow.find((c) => c.path === card.path)) cardsToShow.push(card);
        });
      }
    });
  }

  const handleRedirect = (path) => {
    router.push(path.startsWith("/") ? path : "/" + path);
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center p-6 text-center space-y-6"
      style={{ background: "linear-gradient(135deg, #2E3192 0%, #92EFFD 100%)" }}
    >
      <HeaderPages />

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

      <div className="text-white text-lg italic max-w-2xl mt-6 leading-relaxed tracking-wide font-light">
        Car le corps ne se compose pas d’un seul membre, mais de plusieurs. <br />
        1 Corinthiens 12:14 ❤️
      </div>

      <Footer />
    </div>
  );
}
