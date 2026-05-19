"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import supabase from "../../lib/supabaseClient";
import HeaderPages from "../../components/HeaderPages";
import ProtectedRoute from "../../components/ProtectedRoute";
import Footer from "../../components/Footer";
import { useLang } from "../../hooks/useLang";

// ─── TRADUCTIONS ──────────────────────────────────────────────────────────────
const translations = {
  fr: {
    title: "Espace Conseiller",
    subtitle1: "Chaque",
    highlight1: "conseiller",
    subtitle2: "est un soutien attentif et un",
    highlight2: "bâtisseur de vies",
    subtitle3: ". Ensemble nous accompagnons, encourageons et faisons grandir chaque âme avec foi, patience et amour.",
    cards: {
      membres:       "Gérer les membres",
      suivisMembres: "Suivis des membres",
      suivisEvang:   "Suivis des évangélisés",
      evolution:     "L'évolution des Âmes",
      presence:      "Registre des présences",
      notifications: "Notifications",
    },
    footer: "Chaque vie que nous touchons est précieuse. Continuons à servir avec amour, sagesse et fidélité.",
  },
  en: {
    title: "Counselor Space",
    subtitle1: "Every",
    highlight1: "counselor",
    subtitle2: "is a caring support and a",
    highlight2: "builder of lives",
    subtitle3: ". Together we accompany, encourage and help every soul grow with faith, patience and love.",
    cards: {
      membres:       "Manage members",
      suivisMembres: "Member follow-up",
      suivisEvang:   "Evangelism follow-up",
      evolution:     "Soul progress",
      presence:      "Attendance register",
      notifications: "Notifications",
    },
    footer: "Every life we touch is precious. Let us continue to serve with love, wisdom and faithfulness.",
  },
};

export default function ConseillerHub() {
  return (
    <ProtectedRoute allowedRoles={["Administrateur", "Conseiller", "ResponsableIntegration"]}>
      <ConseillerHubContent />
    </ProtectedRoute>
  );
}

function ConseillerHubContent() {
  const { lang } = useLang();
  const t = translations[lang];

  const [role, setRole] = useState(null);
  const [loadingRole, setLoadingRole] = useState(true);

  useEffect(() => {
    const fetchRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("profiles").select("role").eq("id", user.id).single();
      setRole(data?.role || null);
      setLoadingRole(false);
    };
    fetchRole();
  }, []);

  if (loadingRole) return null;

  return (
    <div
      className="min-h-screen flex flex-col items-center p-6 text-center"
      style={{ background: "linear-gradient(135deg, #2E3192 0%, #92EFFD 100%)" }}
    >
      <HeaderPages />

      <div className="text-center mb-8 mt-4">
        <h1 className="text-3xl font-extrabold mt-4 mb-6 text-white drop-shadow-lg">{t.title}</h1>
        <div className="max-w-3xl mx-auto">
          <p className="italic text-base text-white/90 leading-relaxed">
            {t.subtitle1}{" "}
            <span className="text-blue-300 font-semibold">{t.highlight1}</span>{" "}
            {t.subtitle2}{" "}
            <span className="text-blue-300 font-semibold">{t.highlight2}</span>
            {t.subtitle3}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl mb-10">

        <Link href="/membres/list-members"
          className="bg-white rounded-3xl shadow-md flex flex-col justify-center items-center border-t-4 border-[#0D9488] p-6 hover:shadow-2xl hover:scale-[1.02] transition-all duration-200 cursor-pointer h-36">
          <div className="text-5xl mb-3">👥</div>
          <div className="text-lg font-bold text-gray-800 text-center">{t.cards.membres}</div>
        </Link>

        <Link href="/membres/suivis-membres"
          className="bg-white rounded-3xl shadow-md flex flex-col justify-center items-center border-t-4 border-[#38BDF8] p-6 hover:shadow-2xl hover:scale-[1.02] transition-all duration-200 cursor-pointer h-36">
          <div className="text-5xl mb-3">💌</div>
          <div className="text-lg font-bold text-gray-800 text-center">{t.cards.suivisMembres}</div>
        </Link>

        <Link href="/evangelisation/suivis-evangelisation"
          className="bg-white rounded-3xl shadow-md flex flex-col justify-center items-center border-t-4 border-[#10B981] p-6 hover:shadow-2xl hover:scale-[1.02] transition-all duration-200 cursor-pointer h-36">
          <div className="text-5xl mb-3">💗</div>
          <div className="text-lg font-bold text-gray-800 text-center">{t.cards.suivisEvang}</div>
        </Link>

        <Link href="/conseiller/EtatConseillerPage"
          className="bg-white rounded-3xl shadow-md flex flex-col justify-center items-center border-t-4 border-yellow-500 p-6 hover:shadow-2xl hover:scale-[1.02] transition-all duration-200 cursor-pointer h-36">
          <div className="text-5xl mb-3">🌱</div>
          <div className="text-lg font-bold text-gray-800 text-center">{t.cards.evolution}</div>
        </Link>

        <Link href="/Presence"
          className="bg-white rounded-3xl shadow-md flex flex-col justify-center items-center border-t-4 border-purple-500 p-6 hover:shadow-2xl hover:scale-[1.02] transition-all duration-200 cursor-pointer h-36">
          <div className="text-5xl mb-3">✍🏻</div>
          <div className="text-lg font-bold text-gray-800 text-center">{t.cards.presence}</div>
        </Link>

        <Link href="/admin/notifications"
          className="bg-white rounded-3xl shadow-md flex flex-col justify-center items-center border-t-4 border-red-500 p-6 hover:shadow-2xl hover:scale-[1.02] transition-all duration-200 cursor-pointer h-36">
          <div className="text-5xl mb-3">🔔</div>
          <div className="text-lg font-bold text-gray-800 text-center">{t.cards.notifications}</div>
        </Link>

      </div>

      <div className="max-w-3xl text-center mb-8">
        <p className="italic text-base text-white/90">{t.footer}</p>
      </div>

      <Footer />
    </div>
  );
}
