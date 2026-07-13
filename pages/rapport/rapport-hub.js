"use client";

import Link from "next/link";
import HeaderPages from "../../components/HeaderPages";
import ProtectedRoute from "../../components/ProtectedRoute";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import FooterHub from "../../components/FooterHub";
import { useLang } from "../../hooks/useLang";
import { useFeature } from "../../components/FeaturesContext";
import supabase from "../../lib/supabaseClient";

// ─── TRADUCTIONS ──────────────────────────────────────────────────────────────
const translations = {
  fr: {
    title: "Espace Rapports",
    intro: "Chaque rapport",
    highlight1: "raconte",
    intro2: "une étape de la",
    highlight2: "vie spirituelle",
    intro3: ": les",
    highlight3: "conseillers",
    intro4: "qui soutiennent, les",
    highlight4: "cellules",
    intro5: "qui accompagnent, les âmes qui grandissent, les",
    highlight5: "baptêmes",
    intro6: "qui marquent l'engagement et les",
    highlight6: "formations",
    intro7:
      "qui font mûrir. Avec patience, écoute et foi, nous construisons ensemble et célébrons chaque progrès.",
    cards: {
      presences: "Saisie et suivi des présences par réunion",
      evangelisation: "Évangélisation",
      baptemes: "Baptêmes",
      formation: "Formation",
      ministere: "Ministère",
      etatFamille: "Etat Famille",
      besoins: "Difficultés / Besoins",
      evolution: "Évolution des Âmes par Conseiller",
      etatCellule: "État Cellule",
      registres: "Statistiques des présences individuelles",
      leader: "Etat Leader",
      statsGlobale: "Stats Globale",
    },
    verse:
      "Et le Seigneur ajoutait chaque jour à l'Église ceux qui étaient sauvés.",
    verseRef: "Actes 2:47",
  },
  en: {
    title: "Reports Space",
    intro: "Every report",
    highlight1: "tells",
    intro2: "a stage of",
    highlight2: "spiritual life",
    intro3: ": the",
    highlight3: "counselors",
    intro4: "who support, the",
    highlight4: "cell groups",
    intro5: "that accompany, souls that grow, the",
    highlight5: "baptisms",
    intro6: "that mark commitment and the",
    highlight6: "training",
    intro7:
      "that brings maturity. With patience, listening and faith, we build together and celebrate every step.",
    cards: {
      presences: "Meeting Attendance Entry & Tracking",
      evangelisation: "Evangelism",
      baptemes: "Baptisms",
      formation: "Training",
      ministere: "Ministry",
      etatFamille: "Family status",
      besoins: "Difficulties / Needs",
      evolution: "Soul progress by Counselor",
      etatCellule: "Cell group status",
      registres: "Individual Attendance Statistics",
      leader: "Etat Leader",
      statsGlobale: "Global stats",
    },
    verse: "And the Lord added to the church daily those who were being saved.",
    verseRef: "Acts 2:47",
  },
};

// ─── CONTENU ──────────────────────────────────────────────────────────────────
function RapportHubContent() {
  const router = useRouter();
  const { lang } = useLang();
  const t = translations[lang];

  // ─── FEATURES ─────────────────────────────────────────────────────────────
  const presenceActive       = useFeature("presence");
  const evangelisationActive = useFeature("evangelisation");
  const conseillerActive     = useFeature("conseiller");
  const cellulesActive       = useFeature("cellules");
  const famillesActive       = useFeature("familles");

  const [userName, setUserName] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const name = localStorage.getItem("userName") || "Utilisateur";
    setUserName(name.split(" ")[0]);
  }, []);

  // ─── Rôle utilisateur (pour sécuriser les cards réservées aux Administrateurs,
  //     même si ce composant venait à être réutilisé dans un hub multi-rôles) ───
  useEffect(() => {
    const fetchRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("roles")
        .eq("id", user.id)
        .single();
      setIsAdmin(!!data?.roles?.includes("Administrateur"));
    };
    fetchRole();
  }, []);

  const cardClass =
    "flex-1 bg-white rounded-2xl shadow-md flex flex-col justify-center items-center border-t-4 p-6 hover:shadow-lg transition-all duration-200 cursor-pointer h-32";

  return (
    <div
      className="min-h-screen flex flex-col items-center p-6 text-center space-y-6"
      style={{
        background: "linear-gradient(135deg, #2E3192 0%, #92EFFD 100%)",
      }}
    >
      <HeaderPages />

      {/* ─── INTRO ─────────────────────────────────────────────────────────── */}
      <div className="text-center mb-6 max-w-3xl">
        <h1 className="text-2xl font-bold mb-4 text-white">{t.title}</h1>
        <p className="italic text-base text-white/90">
          {t.intro}{" "}
          <span className="text-blue-300 font-semibold">{t.highlight1}</span>{" "}
          {t.intro2}{" "}
          <span className="text-blue-300 font-semibold">{t.highlight2}</span>
          {t.intro3}{" "}
          <span className="text-blue-300 font-semibold">{t.highlight3}</span>{" "}
          {t.intro4}{" "}
          <span className="text-blue-300 font-semibold">{t.highlight4}</span>{" "}
          {t.intro5}{" "}
          <span className="text-blue-300 font-semibold">{t.highlight5}</span>{" "}
          {t.intro6}{" "}
          <span className="text-blue-300 font-semibold">{t.highlight6}</span>{" "}
          {t.intro7}
        </p>
      </div>

      {/* ─── GRILLE DE CARDS ───────────────────────────────────────────────── */}
      <div className="text-center mb-6 max-w-5xl w-full">
        <h2 className="text-3xl font-extrabold mt-4 mb-6 text-white drop-shadow-lg">
          {t.title}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Présences — feature: presence */}
          {presenceActive && (
            <Link
              href="/rapport/attendance"
              className={cardClass}
              style={{ borderTopColor: "#0D9488" }}
            >
              <div className="text-4xl mb-2">🛐</div>
              <div className="text-lg font-bold text-gray-800 text-center">
                {t.cards.presences}
              </div>
            </Link>
          )}

          {/* Évangélisation — feature: evangelisation */}
          {evangelisationActive && (
            <Link
              href="/rapport/Rapport-evangelisation"
              className={cardClass}
              style={{ borderTopColor: "#38BDF8" }}
            >
              <div className="text-4xl mb-2">🗣️</div>
              <div className="text-lg font-bold text-gray-800 text-center">
                {t.cards.evangelisation}
              </div>
            </Link>
          )}

          {/* Baptêmes — toujours visible (rapport = true par défaut) */}
          <Link
            href="/rapport/RapportBaptemePage"
            className={cardClass}
            style={{ borderTopColor: "#10B981" }}
          >
            <div className="text-4xl mb-2">💧</div>
            <div className="text-lg font-bold text-gray-800 text-center">
              {t.cards.baptemes}
            </div>
          </Link>

          {/* Formation — toujours visible */}
          <Link
            href="/rapport/RapportFormationPage"
            className={cardClass}
            style={{ borderTopColor: "#FBBF24" }}
          >
            <div className="text-4xl mb-2">✒️</div>
            <div className="text-lg font-bold text-gray-800 text-center">
              {t.cards.formation}
            </div>
          </Link>

          {/* Ministère — toujours visible */}
          <Link
            href="/rapport/RapportMinisterePage"
            className={cardClass}
            style={{ borderTopColor: "#3B82F6" }}
          >
            <div className="text-4xl mb-2">💢</div>
            <div className="text-lg font-bold text-gray-800 text-center">
              {t.cards.ministere}
            </div>
          </Link>

          {/* Besoins — toujours visible */}
          <Link
            href="/rapport/RapportBesoinPage"
            className={cardClass}
            style={{ borderTopColor: "#F472B6" }}
          >
            <div className="text-4xl mb-2">❓</div>
            <div className="text-lg font-bold text-gray-800 text-center">
              {t.cards.besoins}
            </div>
          </Link>

          {/* Évolution par Conseiller — feature: conseiller */}
          {conseillerActive && (
            <Link
              href="/conseiller/EtatConseillerPage"
              className={cardClass}
              style={{ borderTopColor: "#22D3EE" }}
            >
              <div className="text-4xl mb-2">🌱</div>
              <div className="text-lg font-bold text-gray-800 text-center">
                {t.cards.evolution}
              </div>
            </Link>
          )}

          {/* État Cellule — feature: cellules */}
          {cellulesActive && (
            <Link
              href="/cellule/EtatCellulePage"
              className={cardClass}
              style={{ borderTopColor: "#A78BFA" }}
            >
              <div className="text-4xl mb-2">🏠</div>
              <div className="text-lg font-bold text-gray-800 text-center">
                {t.cards.etatCellule}
              </div>
            </Link>
          )}

          {/* État Famille — feature: familles */}
          {famillesActive && (
            <Link
              href="/famille/EtatFamillePage"
              className={cardClass}
              style={{ borderTopColor: "#14B8A6" }}
            >
              <div className="text-5xl mb-2">👑</div>
              <div className="text-lg font-bold text-gray-800 text-center">
                {t.cards.etatFamille}
              </div>
            </Link>
          )}

          {/* Registres présences — toujours visible */}
          <Link
            href="/rapport/RapportPresence"
            className={cardClass}
            style={{ borderTopColor: "#F59E0B" }}
          >
            <div className="text-4xl mb-2">✅</div>
            <div className="text-lg font-bold text-gray-800 text-center">
              {t.cards.registres}
            </div>
          </Link>          

          {/* Stats Globale — toujours visible */}
          <Link
            href="/rapport/StatGlobalPage"
            className={cardClass}
            style={{ borderTopColor: "#F59E0B" }}
          >
            <div className="text-4xl mb-2">🌍</div>
            <div className="text-lg font-bold text-gray-800 text-center">
              {t.cards.statsGlobale}
            </div>
          </Link>

        </div>
      </div>

      {/* ─── VERSET ────────────────────────────────────────────────────────── */}
      <div className="max-w-3xl w-full mb-6 text-center">
        <p className="italic text-base text-white/90">
          {t.verse} <br />
          {t.verseRef}
        </p>
      </div>

      <FooterHub />
    </div>
  );
}

// ─── EXPORT ───────────────────────────────────────────────────────────────────
export default function Administrateur() {
  return (
    <ProtectedRoute allowedRoles={["Administrateur"]}>
      <RapportHubContent />
    </ProtectedRoute>
  );
}
