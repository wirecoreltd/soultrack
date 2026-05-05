"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import supabase from "../lib/supabaseClient";
import HeaderPages from "../components/HeaderPages";
import Footer from "../components/Footer";

// ─── Carte notifications commune à tous les rôles ─────────────────────────
const NOTIF_CARD = {
  path: "/notifications",
  label: "Notifications",
  emoji: "🔔",
  color: "#ef4444",
};

const roleCards = {
  Administrateur: [
    { path: "/membres/membres-hub", label: "Gestion des membres", emoji: "🧭", color: "#0E7490" },
    { path: "/evangelisation/evangelisation-hub", label: "Évangélisation", emoji: "✝️", color: "#F97316" },
    { path: "/cellule/cellules-hub", label: "Cellule", emoji: "🏠", color: "#10B981" },
    { path: "/conseiller/conseiller-hub", label: "Conseiller", emoji: "🤝", color: "#0EA5E9" },
    { path: "/famille/familles-hub", label: "Familles", emoji: "👑", color: "#F59E0B" },
    { path: "/rapport/rapport-hub", label: "Rapport", emoji: "📈", color: "#FBBF24" },
    { path: "/administrateur/administrateur", label: "Admin", emoji: "⚙️", color: "#0EA5E9" },
    { path: "/Presence", label: "Presence", emoji: "✍🏻", color: "#0EA5E9" },
  ],

  Superadmin: [
    { path: "/membres/membres-hub", label: "Gestion des membres", emoji: "🧭", color: "#0E7490" },
    { path: "/evangelisation/evangelisation-hub", label: "Évangélisation", emoji: "✝️", color: "#F97316" },
    { path: "/cellule/cellules-hub", label: "Cellule", emoji: "🏠", color: "#10B981" },
    { path: "/conseiller/conseiller-hub", label: "Conseiller", emoji: "🤝", color: "#0EA5E9" },
    { path: "/famille/familles-hub", label: "Familles", emoji: "👑", color: "#F59E0B" },
    { path: "/rapport/rapport-hub", label: "Rapport", emoji: "📈", color: "#FBBF24" },
    { path: "/administrateur/administrateur", label: "Admin", emoji: "⚙️", color: "#0EA5E9" },
    { path: "/Presence", label: "Presence", emoji: "✍🏻", color: "#0EA5E9" },
    { path: "/Superadmin/Superadmin-hub", label: "Admin SoulTrack", emoji: "🔐", color: "#000000" },
  ],

  ResponsableIntegration: [
    { path: "/membres/membres-hub", label: "Gestion des membres", emoji: "🧭", color: "#0284C7" },
  ],
  ResponsableEvangelisation: [
    { path: "/evangelisation/evangelisation-hub", label: "Évangélisation", emoji: "✝️", color: "#0D9488" },
  ],
  ResponsableCellule: [
    { path: "/cellule/cellules-hub", label: "Cellule", emoji: "🏠", color: "#06B6D4" },
  ],
  SuperviseurCellule: [
    { path: "/cellule/cellules-hub", label: "Cellule", emoji: "🏠", color: "#06B6D4" },
  ],
  Conseiller: [
    { path: "/conseiller/conseiller-hub", label: "Conseiller Hub", emoji: "🤝", color: "#F59E0B" },
  ],
  ResponsableFamilles: [
    { path: "/famille/familles-hub", label: "Familles", emoji: "👑", color: "#F59E0B" },
  ],
  Membre: [],
};

export default function IndexPage() {
  const router = useRouter();

  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const { data } = await supabase.auth.getSession();

        if (!data?.session) {
          router.replace("/SignupEglise");
          return;
        }

        const storedRoles = localStorage.getItem("userRole");
        if (storedRoles) {
          try {
            const parsed = JSON.parse(storedRoles);
            setRoles(Array.isArray(parsed) ? parsed : [parsed]);
          } catch {
            setRoles([storedRoles]);
          }
        } else {
          setRoles([]);
        }

        setReady(true);
      } catch (err) {
        console.error("Init error:", err);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [router]);

  if (loading || !ready) return null;

  // ─── Construction des cards ───────────────────────────────────────────────
  let cardsToShow = [];

  if (roles.includes("Superadmin")) {
    cardsToShow = [...roleCards.Superadmin];
  } else {
    roles.forEach((role) => {
      const key = role.trim();
      if (roleCards[key]) {
        roleCards[key].forEach((card) => {
          if (!cardsToShow.find((c) => c.path === card.path)) {
            cardsToShow.push(card);
          }
        });
      }
    });
  }

  // ✅ Ajouter la carte Notifications pour tous les rôles (sauf Membre seul)
  const isMemberOnly = roles.length === 1 && roles[0] === "Membre";
  if (!isMemberOnly) {
    cardsToShow.push(NOTIF_CARD);
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

      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold mt-4 mb-6 text-white">
          Tableau de bord
        </h1>
        <div className="max-w-3xl w-full mb-6 text-center">
          <p className="italic text-base text-white/90">
            <span className="text-blue-300 font-semibold">Bienvenue dans votre espace</span>.
            Accédez aux différents hubs selon votre rôle pour servir et organiser l'église.
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row flex-wrap gap-4 justify-center items-center w-full max-w-4xl">
        {cardsToShow.map((card) => (
          <div
            key={card.path}
            onClick={() => handleRedirect(card.path)}
            className="flex-1 min-w-[250px] w-full h-32 bg-white rounded-2xl shadow-md flex flex-col justify-center items-center border-t-4 p-3 hover:shadow-lg transition cursor-pointer"
            style={{ borderTopColor: card.color }}
          >
            <div className="text-4xl mb-1">{card.emoji}</div>
            <div className="text-lg font-bold text-gray-800">{card.label}</div>
          </div>
        ))}
      </div>

      <div className="max-w-3xl w-full mb-6 text-center">
        <p className="italic text-base text-white/90">
          Une vision, plusieurs rôles, un même objectif : voir des vies transformées.
        </p>
      </div>

      <Footer />
    </div>
  );
}
