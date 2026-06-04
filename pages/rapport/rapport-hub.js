"use client";

import Link from "next/link";
import HeaderPages from "../../components/HeaderPages";
import ProtectedRoute from "../../components/ProtectedRoute";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import FooterHub from "../../components/FooterHub";
import { useLang } from "../../hooks/useLang";
import { useFeature } from "../../components/FeaturesContext"; // ← AJOUT

// ─── TRADUCTIONS ──────────────────────────────────────────────────────────────
const translations = { /* ... inchangé ... */ };

function RapportHubContent() {
  const router = useRouter();
  const { lang } = useLang();
  const t = translations[lang];

  // ─── FEATURES ───────────────────────────────
  const presenceActive      = useFeature("presence");
  const evangelisationActive = useFeature("evangelisation");
  const conseillerActive    = useFeature("conseiller");
  const cellulesActive      = useFeature("cellules");
  const famillesActive      = useFeature("familles");

  const [userName, setUserName] = useState("");
  useEffect(() => {
    const name = localStorage.getItem("userName") || "Utilisateur";
    setUserName(name.split(" ")[0]);
  }, []);

  const cardClass = "flex-1 bg-white rounded-2xl shadow-md flex flex-col justify-center items-center border-t-4 p-6 hover:shadow-lg transition-all duration-200 cursor-pointer h-32";

  return (
    <div
      className="min-h-screen flex flex-col items-center p-6 text-center space-y-6"
      style={{ background: "linear-gradient(135deg, #2E3192 0%, #92EFFD 100%)" }}
    >
      <HeaderPages />

      {/* ... intro inchangée ... */}

      <div className="text-center mb-6 max-w-5xl w-full">
        <h2 className="text-3xl font-extrabold mt-4 mb-6 text-white drop-shadow-lg">{t.title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {presenceActive && (
            <Link href="/rapport/attendance" className={cardClass} style={{ borderTopColor: "#0D9488" }}>
              <div className="text-4xl mb-2">⛪</div>
              <div className="text-lg font-bold text-gray-800 text-center">{t.cards.presences}</div>
            </Link>
          )}

          {evangelisationActive && (
            <Link href="/rapport/Rapport-evangelisation" className={cardClass} style={{ borderTopColor: "#38BDF8" }}>
              <div className="text-4xl mb-2">🗣️</div>
              <div className="text-lg font-bold text-gray-800 text-center">{t.cards.evangelisation}</div>
            </Link>
          )}

          {/* Toujours visibles (feature rapport = true par défaut) */}
          <Link href="/rapport/RapportBaptemePage" className={cardClass} style={{ borderTopColor: "#10B981" }}>
            <div className="text-4xl mb-2">💧</div>
            <div className="text-lg font-bold text-gray-800 text-center">{t.cards.baptemes}</div>
          </Link>

          <Link href="/rapport/RapportFormationPage" className={cardClass} style={{ borderTopColor: "#FBBF24" }}>
            <div className="text-4xl mb-2">✒️</div>
            <div className="text-lg font-bold text-gray-800 text-center">{t.cards.formation}</div>
          </Link>

          <Link href="/rapport/RapportMinisterePage" className={cardClass} style={{ borderTopColor: "#3B82F6" }}>
            <div className="text-4xl mb-2">💢</div>
            <div className="text-lg font-bold text-gray-800 text-center">{t.cards.ministere}</div>
          </Link>

          <Link href="/rapport/RapportBesoinPage" className={cardClass} style={{ borderTopColor: "#F472B6" }}>
            <div className="text-4xl mb-2">❓</div>
            <div className="text-lg font-bold text-gray-800 text-center">{t.cards.besoins}</div>
          </Link>

          {conseillerActive && (
            <Link href="/conseiller/EtatConseillerPage" className={cardClass} style={{ borderTopColor: "#22D3EE" }}>
              <div className="text-4xl mb-2">🌱</div>
              <div className="text-lg font-bold text-gray-800 text-center">{t.cards.evolution}</div>
            </Link>
          )}

          {cellulesActive && (
            <Link href="/cellule/EtatCellulePage" className={cardClass} style={{ borderTopColor: "#A78BFA" }}>
              <div className="text-4xl mb-2">🏠</div>
              <div className="text-lg font-bold text-gray-800 text-center">{t.cards.etatCellule}</div>
            </Link>
          )}

          {famillesActive && (
            <Link href="/famille/EtatFamillePage" className={cardClass} style={{ borderTopColor: "#14B8A6" }}>
              <div className="text-5xl mb-2">👑</div>
              <div className="text-lg font-bold text-gray-800 text-center">{t.cards.etatFamille}</div>
            </Link>
          )}

          <Link href="/rapport/RapportPresence" className={cardClass} style={{ borderTopColor: "#F59E0B" }}>
            <div className="text-4xl mb-2">✅</div>
            <div className="text-lg font-bold text-gray-800 text-center">{t.cards.registres}</div>
          </Link>

          <Link href="/rapport/StatGlobalPage" className={cardClass} style={{ borderTopColor: "#F59E0B" }}>
            <div className="text-4xl mb-2">🌍</div>
            <div className="text-lg font-bold text-gray-800 text-center">{t.cards.statsGlobale}</div>
          </Link>

        </div>
      </div>

      {/* ... verse + FooterHub inchangés ... */}
    </div>
  );
}

export default function Administrateur() {
  return (
    <ProtectedRoute allowedRoles={["Administrateur"]}>
      <RapportHubContent />
    </ProtectedRoute>
  );
}
