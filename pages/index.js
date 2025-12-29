"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import supabase from "../lib/supabaseClient";
import LogoutLink from "../components/LogoutLink";

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
  Membre: [],
};

export default function IndexPage() {
  const [prenom, setPrenom] = useState("");
  const [roles, setRoles] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userEmail = localStorage.getItem("userEmail");
        if (!userEmail) {
          setPrenom("cher membre");
          return;
        }

        const { data, error } = await supabase
          .from("profiles")
          .select("prenom")
          .eq("email", userEmail)
          .single();

        if (error) throw error;

        setPrenom(data?.prenom || "cher membre");

        const storedRoles = localStorage.getItem("userRole");
        if (storedRoles) {
          const parsed = JSON.parse(storedRoles);
          setRoles(Array.isArray(parsed) ? parsed : [parsed]);
        }
      } catch (err) {
        console.error(err);
        setPrenom("cher membre");
      }
    };

    fetchUser();
  }, []);

  const handleRedirect = (path) => {
    router.push(path.startsWith("/") ? path : "/" + path);
  };

  let cardsToShow = [];
  if (roles.includes("Administrateur")) {
    Object.values(roleCards).flat().forEach((card) => {
      if (!cardsToShow.find((c) => c.path === card.path)) {
        cardsToShow.push(card);
      }
    });
  } else {
    roles.forEach((role) => {
      roleCards[role]?.forEach((card) => {
        if (!cardsToShow.find((c) => c.path === card.path)) {
          cardsToShow.push(card);
        }
      });
    });
  }

  return (
    <div className="min-h-screen flex flex-col items-center p-6 text-center space-y-6 bg-white text-black">
      
      {/* 🔹 Top bar */}
      <div className="w-full max-w-5xl mb-6">
        <div className="flex justify-between items-center">
          <button
            onClick={() => router.back()}
            className="text-sm font-medium hover:underline"
          >
            ← Retour
          </button>
          <LogoutLink />
        </div>

        <div className="flex justify-end mt-2">
          <p className="text-sm text-gray-600">👋 Bienvenue {prenom}</p>
        </div>
      </div>

      {/* 🔹 Logo */}
      <img src="/logo.png" alt="Logo SoulTrack" className="w-20 mx-auto mb-4" />

      {/* 🔹 Titre */}
      <h1 className="text-3xl font-bold mb-4">
        Tableau de bord
      </h1>

      {/* 🔹 Message */}
      <p className="text-gray-700 text-lg italic max-w-2xl leading-relaxed">
        La famille est le premier lieu où l'amour, le soutien et la foi se transmettent.
        Prenez soin de ceux qui vous entourent et soyez un exemple d'unité et de bonté.
      </p>

      {/* 🔹 Cartes */}
      <div className="flex flex-col md:flex-row flex-wrap gap-4 justify-center w-full max-w-4xl mt-4">
        {cardsToShow.map((card) => (
          <div
            key={card.path}
            onClick={() => handleRedirect(card.path)}
            className="flex-1 min-w-[250px] h-32 bg-white rounded-2xl shadow border-t-4 flex flex-col justify-center items-center cursor-pointer hover:shadow-lg transition"
            style={{ borderTopColor: card.color }}
          >
            <div className="text-4xl">{card.emoji}</div>
            <div className="mt-1 font-semibold">{card.label}</div>
          </div>
        ))}
      </div>

      {/* 🔹 Verset */}
      <div className="text-gray-700 text-lg italic max-w-2xl mt-6">
        Car le corps ne se compose pas d’un seul membre, mais de plusieurs. <br />
        1 Corinthiens 12:14 ❤️
      </div>
    </div>
  );
}
