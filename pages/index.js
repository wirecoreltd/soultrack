"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import supabase from "../lib/supabaseClient";
import LogoutLink from "../components/LogoutLink";

// Composant Header
function Header() {
  const [prenom, setPrenom] = useState("");
  const [eglise, setEglise] = useState("Église Principale");
  const [branche, setBranche] = useState("Maurice");
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userEmail = localStorage.getItem("userEmail");
        if (!userEmail) return;

        // 🔹 On récupère le prénom et l'église/branche du profil
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("prenom, eglise_name, branche_name")
          .eq("email", userEmail)
          .single();

        if (error) throw error;

        setPrenom(profile?.prenom || "");
        setEglise(profile?.eglise_name || "Église Principale");
        setBranche(profile?.branche_name || "Maurice");
      } catch (err) {
        console.error("Erreur récupération user:", err);
      }
    };

    fetchUser();
  }, []);

  return (
    <div className="w-full max-w-5xl mx-auto mt-4">
      {/* Ligne retour / déconnexion */}
      <div className="flex justify-between items-center mb-1">
        <button
          onClick={() => router.back()}
          className="text-white text-base hover:text-gray-200 transition-colors"
        >
          ← Retour
        </button>
        <LogoutLink />
      </div>

      {/* Texte sous Déconnexion */}
      <div className="flex flex-col items-end text-right space-y-0 mb-4">
        <p className="text-white text-base">
          👋 Bienvenue <span className="font-semibold">{prenom}</span>
        </p>
        <p className="text-white text-base">
          {eglise} <span className="text-amber-300 font-semibold">— {branche}</span>
        </p>
      </div>

      {/* Logo centré */}
      <div className="flex justify-center mb-6">
        <img src="/logo.png" alt="Logo SoulTrack" className="w-20 h-20" />
      </div>
    </div>
  );
}

// Cartes selon les rôles
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
      {/* Header */}
      <Header />

      {/* Titre */}
      <h1 className="text-3xl font-login text-white mb-6 font-bold text-center">
        Tableau De Bord
      </h1>

      {/* Message motivant */}
      <p className="text-white text-lg italic mb-6 max-w-2xl leading-relaxed tracking-wide font-light">
        La famille est le premier lieu où l'amour, le soutien et la foi se transmettent. 
        Prenez soin de ceux qui vous entourent et soyez un exemple d'unité et de bonté.
      </p>

      {/* Cartes des fonctionnalités */}
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

      {/* Verset biblique sous les cartes */}
      <div className="text-white text-lg italic max-w-2xl mt-6 leading-relaxed tracking-wide font-light">
        Car le corps ne se compose pas d’un seul membre, mais de plusieurs. <br />
        1 Corinthiens 12:14 ❤️
      </div>
    </div>
  );
}
