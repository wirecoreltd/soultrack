"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import supabase from "../../lib/supabaseClient";
import HeaderPages from "../../components/HeaderPages";
import ProtectedRoute from "../../components/ProtectedRoute";
import FooterHub from "../../components/FooterHub";
import SendLinkPopup from "../../components/SendLinkPopup";
import { useLang } from "../../hooks/useLang";

// ─── TRADUCTIONS ──────────────────────────────────────────────────────────────
const translations = {
  fr: {
    title: "Espace Familles",
    subtitle1: "Chaque Famille est un",
    highlight1: "espace",
    subtitle2: "où les âmes grandissent, sont",
    highlight2: "accompagnées et encouragées dans leur cheminement",
    subtitle3: ". Ensemble, unissons nos forces, construisons et faisons fructifier chaque vie, afin que chacun puisse",
    highlight3: "s'épanouir pleinement dans la foi",
    cards: {
      listeFamilles:    "Liste des Familles",
      ajouterMembre:    "Ajouter un membre",
      importerListe:    "Importer une liste",
      membresFamille:   "Membres de ma Famille",
      suivisEvang:      "Suivis des évangélisés",
      suivisMembres:    "Suivis des membres",
      baptemes:         "Baptêmes",
      presences:        "Saisie et suivi des présences par réunion",
      etatFamille:      "Etat Famille",
      registre:         "Saisie des présences individuelles",
      rapportRegistres: "Statistiques des présences individuelles",
      notifications:    "Notifications",
    },
    sendLinkMembre: "Envoyer formulaire Famille – Nouveau membre",
    sendLinkEvang:  "Envoyer formulaire Famille – Évangélisation",
    footer: "La famille est le plus grand trésor. Prenez soin les uns des autres avec amour et patience.",
  },
  en: {
    title: "Families Space",
    subtitle1: "Every Family is a",
    highlight1: "space",
    subtitle2: "where souls grow, are",
    highlight2: "supported and encouraged in their journey",
    subtitle3: ". Together, let us unite our strengths, build and help every life flourish, so that each person can",
    highlight3: "fully thrive in faith",
    cards: {
      listeFamilles:    "Families list",
      ajouterMembre:    "Add a member",
      importerListe:    "Import a list",
      membresFamille:   "My Family members",
      suivisEvang:      "Evangelism follow-up",
      suivisMembres:    "Member follow-up",
      baptemes:         "Baptisms",
      presences:        "Attendance & statistics",
      etatFamille:      "Family status",
      registre:         "Attendance register",
      rapportRegistres: "Register report",
      notifications:    "Notifications",
    },
    sendLinkMembre: "Send Family form – New member",
    sendLinkEvang:  "Send Family form – Evangelism",
    footer: "Family is the greatest treasure. Take care of one another with love and patience.",
  },
};

export default function FamillesHub() {
  return (
    <ProtectedRoute
  allowedRoles={["Administrateur", "Superadmin", "ResponsableFamilles"]}
  requiredFeature="familles"
>
      <FamillesHubContent />
    </ProtectedRoute>
  );
}

function FamillesHubContent() {
  const { lang } = useLang();
  const t = translations[lang];

  const [role, setRole]               = useState(null);
  const [loadingRole, setLoadingRole] = useState(true);
  const [familleName, setFamilleName] = useState(null);

  useEffect(() => {
    const fetchRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("profiles").select("role").eq("id", user.id).single();

      setRole(data?.role || null);

      if (data?.role === "ResponsableFamilles") {
        const { data: familleData } = await supabase
          .from("familles")
          .select("famille")
          .eq("responsable_id", user.id)
          .single();

        if (familleData?.famille) {
          setFamilleName(familleData.famille);
        }
      }

      setLoadingRole(false);
    };
    fetchRole();
  }, []);

  if (loadingRole) return null;

  const isResponsableFamilles = role === "ResponsableFamilles";

  const cardClass =
    "flex-1 min-w-[250px] w-full h-32 bg-white rounded-3xl shadow-md flex flex-col justify-center items-center border-t-4 p-6 hover:shadow-2xl hover:scale-[1.02] transition-all duration-200 cursor-pointer";

  return (
    <div
      className="min-h-screen flex flex-col items-center p-6"
      style={{ background: "linear-gradient(135deg, #2E3192 0%, #92EFFD 100%)" }}
    >
      <HeaderPages />

      <div className="text-center mb-6">
        <h1 className="text-3xl font-extrabold mt-4 mb-2 text-white drop-shadow-lg">
          {t.title}
          {familleName && (
            <span className="text-yellow-300 font-extrabold"> - {familleName}</span>
          )}
        </h1>

        <div className="max-w-3xl w-full mb-6 text-center">
          <p className="italic text-base text-white/90 leading-relaxed">
            {t.subtitle1}{" "}
            <span className="text-blue-200 font-semibold">{t.highlight1}</span>{" "}
            {t.subtitle2}{" "}
            <span className="text-cyan-200 font-semibold">{t.highlight2}</span>
            {t.subtitle3}{" "}
            <span className="text-yellow-200 font-semibold">{t.highlight3}</span>.
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6 justify-center w-full max-w-6xl mb-6 flex-wrap">

        <Link href="/famille/list-familles" className={cardClass} style={{ borderTopColor: "#3B82F6" }}>
          <div className="text-5xl mb-2">👑</div>
          <div className="text-lg font-bold text-gray-800 text-center">{t.cards.listeFamilles}</div>
        </Link>

        {isResponsableFamilles && (
          <>
            <Link href="/famille/ajouter-membre-famille" className={cardClass} style={{ borderTopColor: "#10B981" }}>
              <div className="text-5xl mb-2">➕</div>
              <div className="text-lg font-bold text-gray-800 text-center">{t.cards.ajouterMembre}</div>
            </Link>

            <Link href="/admin/import-famille" className={cardClass} style={{ borderTopColor: "#F97316" }}>
              <div className="text-5xl mb-2">📤</div>
              <div className="text-lg font-bold text-gray-800 text-center">{t.cards.importerListe}</div>
            </Link>
          </>
        )}

        <Link href="/famille/membres-famille" className={cardClass} style={{ borderTopColor: "#22C55E" }}>
          <div className="text-5xl mb-2">👥</div>
          <div className="text-lg font-bold text-gray-800 text-center">{t.cards.membresFamille}</div>
        </Link>

        <Link href="/evangelisation/suivis-evangelisation" className={cardClass} style={{ borderTopColor: "#F97316" }}>
          <div className="text-5xl mb-2">💗</div>
          <div className="text-lg font-bold text-gray-800 text-center">{t.cards.suivisEvang}</div>
        </Link>

        <Link href="/membres/suivis-membres" className={cardClass} style={{ borderTopColor: "#EAB308" }}>
          <div className="text-5xl mb-2">💌</div>
          <div className="text-lg font-bold text-gray-800 text-center">{t.cards.suivisMembres}</div>
        </Link>

        <Link href="/rapport/RapportBaptemePage" className={cardClass} style={{ borderTopColor: "#10B981" }}>
          <div className="text-5xl mb-2">💧</div>
          <div className="text-lg font-bold text-gray-800 text-center">{t.cards.baptemes}</div>
        </Link>

        <Link href="/famille/attendance_famille" className={cardClass} style={{ borderTopColor: "#8B5CF6" }}>
          <div className="text-5xl mb-2">🗒️</div>
          <div className="text-lg font-bold text-gray-800 text-center">{t.cards.presences}</div>
        </Link>

        <Link href="/famille/EtatFamillePage" className={cardClass} style={{ borderTopColor: "#14B8A6" }}>
          <div className="text-5xl mb-2">🌱</div>
          <div className="text-lg font-bold text-gray-800 text-center">{t.cards.etatFamille}</div>
        </Link>

        <Link href="/Presence" className={cardClass} style={{ borderTopColor: "#EC4899" }}>
          <div className="text-5xl mb-2">✍️</div>
          <div className="text-lg font-bold text-gray-800 text-center">{t.cards.registre}</div>
        </Link>

        <Link href="/rapport/RapportPresence" className={cardClass} style={{ borderTopColor: "#6366F1" }}>
          <div className="text-5xl mb-2">✅</div>
          <div className="text-lg font-bold text-gray-800 text-center">{t.cards.rapportRegistres}</div>
        </Link>

        <Link href="/admin/notifications" className={cardClass} style={{ borderTopColor: "#EF4444" }}>
          <div className="text-5xl mb-2">🔔</div>
          <div className="text-lg font-bold text-gray-800 text-center">{t.cards.notifications}</div>
        </Link>

      </div>

      {isResponsableFamilles && (
        <>
          <div className="w-full max-w-md mb-3">
            <SendLinkPopup
              label={t.sendLinkMembre}
              type="ajouter_membre_famille"
              buttonColor="from-[#f7971e] to-[#ffd200]"
            />
          </div>
          <div className="w-full max-w-md mb-6">
            <SendLinkPopup
              label={t.sendLinkEvang}
              type="ajouter_evangelise_famille"
              buttonColor="from-[#11998e] to-[#38ef7d]"
            />
          </div>
        </>
      )}

      <div className="max-w-3xl w-full mb-6 text-center">
        <p className="italic text-base text-white/90">{t.footer}</p>
      </div>

      <FooterHub />
    </div>
  );
}
