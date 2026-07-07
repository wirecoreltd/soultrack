"use client";

import Link from "next/link";
import SendLinkPopup from "../../components/SendLinkPopup";
import { useEffect, useState } from "react";
import supabase from "../../lib/supabaseClient";
import HeaderPages from "../../components/HeaderPages";
import ProtectedRoute from "../../components/ProtectedRoute";
import FooterHub from "../../components/FooterHub";
import { useLang } from "../../hooks/useLang";

// ─── TRADUCTIONS ──────────────────────────────────────────────────────────────
const translations = {
  fr: {
    title: "Espace Cellule",
    subtitle1: "Chaque cellule est un",
    highlight1: "espace",
    subtitle2: "où les âmes grandissent, sont",
    highlight2: "accompagnées et encouragées dans leur cheminement",
    subtitle3: ". Ensemble, unissons nos forces, construisons et faisons fructifier chaque vie, afin que chacun puisse",
    highlight3: "s'épanouir pleinement dans la foi",
    cards: {
      listeCellules:    "Liste des Cellules",
      ajouterMembre:    "Ajouter un membre",
      import:           "Import liste membres",
      membresCellule:   "Membres de la Cellule",
      suivisEvang:      "Suivis évangélisation",
      suivisMembres:    "Suivis des membres",
      baptemes:         "Baptêmes",
      presencesStats:   "Saisie et suivi des présences par réunion",
      ajouterCellule:    "Ajouter une Cellule",
      etatCellule:      "État Cellule",
      registrePresences:"Saisie des présences individuelles",
      rapportRegistres: "Statistiques des présences individuelles",
      notifications:    "Notifications",
    },
    sendLinkMembre:   "Envoyer formulaire Cellule – Nouveau membre",
    sendLinkEvang:    "Envoyer formulaire Cellule – Évangélisation",
    footer: "La famille est le plus grand trésor. Prenez soin les uns des autres avec amour et patience.",
  },
  en: {
    title: "Cell Group Space",
    subtitle1: "Every cell group is a",
    highlight1: "space",
    subtitle2: "where souls grow, are",
    highlight2: "supported and encouraged in their journey",
    subtitle3: ". Together, let us unite our strengths, build and help every life flourish, so that each person can",
    highlight3: "fully thrive in faith",
    cards: {
      listeCellules:    "Cell groups list",
      :    "Add a member",
      import:           "Import member list",
      membresCellule:   "Cell group members",
      suivisEvang:      "Evangelism follow-up",
      suivisMembres:    "Member follow-up",
      baptemes:         "Baptisms",
      presencesStats:   "Meeting Attendance Entry & Tracking",
      ajouterCellule:    "Add a Cell group",
      etatCellule:      "Cell group status",
      registrePresences:"Individual Attendance Entry",
      rapportRegistres: "Individual Attendance Statistics",
      notifications:    "Notifications",
    },
    sendLinkMembre:   "Send Cell form – New member",
    sendLinkEvang:    "Send Cell form – Evangelism",
    footer: "Family is the greatest treasure. Take care of one another with love and patience.",
  },
};

export default function CellulesHub() {
  return (
    <ProtectedRoute allowedRoles={["Administrateur", "ResponsableCellule", "SuperviseurCellule"]}>
      <CellulesHubContent />
    </ProtectedRoute>
  );
}

function CellulesHubContent() {
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

  const isResponsableCellule = role === "ResponsableCellule";

  const CARD_CLASS =
    "flex-1 min-w-[250px] w-full h-32 bg-white rounded-3xl shadow-md flex flex-col justify-center items-center p-6 hover:shadow-xl transition-all duration-200 cursor-pointer";

  return (
    <div
      className="min-h-screen flex flex-col items-center p-6"
      style={{ background: "linear-gradient(135deg, #2E3192 0%, #92EFFD 100%)" }}
    >
      <HeaderPages />

      <h1 className="text-3xl font-extrabold mt-4 mb-6 text-white drop-shadow-lg">{t.title}</h1>

      <div className="max-w-3xl w-full mb-6 text-center">
        <p className="italic text-base text-white/90">
          {t.subtitle1} <span className="text-blue-300 font-semibold">{t.highlight1}</span> {t.subtitle2}{" "}
          <span className="text-blue-300 font-semibold">{t.highlight2}</span>{t.subtitle3}{" "}
          <span className="text-blue-300 font-semibold">{t.highlight3}</span>.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6 flex-wrap w-full max-w-5xl">

        <Link href="/cellule/list-cellules" className={CARD_CLASS} style={{ borderTop: "4px solid #3b82f6" }}>
          <div className="text-5xl mb-2">🏠</div>
          <div className="text-lg font-bold text-gray-800 text-center">{t.cards.listeCellules}</div>
        </Link>

        {isResponsableCellule && (
          <Link href="/cellule/ajouter-membre-cellule" className={CARD_CLASS} style={{ borderTop: "4px solid #10b981" }}>
            <div className="text-5xl mb-2">➕</div>
            <div className="text-lg font-bold text-gray-800 text-center">{t.cards.ajouterMembre}</div>
          </Link>
        )}

        {isResponsableCellule && (
          <Link href="/admin/import" className={CARD_CLASS} style={{ borderTop: "4px solid #f97316" }}>
            <div className="text-4xl mb-1">📤</div>
            <div className="text-lg font-bold text-gray-800 text-center">{t.cards.import}</div>
          </Link>
        )}

        <Link href="/cellule/membres-cellule" className={CARD_CLASS} style={{ borderTop: "4px solid #22c55e" }}>
          <div className="text-5xl mb-2">👥</div>
          <div className="text-lg font-bold text-gray-800 text-center">{t.cards.membresCellule}</div>
        </Link>

        <Link href="/evangelisation/suivis-evangelisation" className={CARD_CLASS} style={{ borderTop: "4px solid #ec4899" }}>
          <div className="text-5xl mb-2">💗</div>
          <div className="text-lg font-bold text-gray-800 text-center">{t.cards.suivisEvang}</div>
        </Link>

        <Link href="/membres/suivis-membres" className={CARD_CLASS} style={{ borderTop: "4px solid #eab308" }}>
          <div className="text-5xl mb-2">💌</div>
          <div className="text-lg font-bold text-gray-800 text-center">{t.cards.suivisMembres}</div>
        </Link>

        <Link href="/rapport/RapportBaptemePage" className={CARD_CLASS} style={{ borderTop: "4px solid #10B981" }}>
          <div className="text-5xl mb-2">💧</div>
          <div className="text-lg font-bold text-gray-800 text-center">{t.cards.baptemes}</div>
        </Link>

        <Link href="/cellule/attendance_cellule" className={CARD_CLASS} style={{ borderTop: "4px solid #6366f1" }}>
          <div className="text-5xl mb-2">🗒️</div>
          <div className="text-lg font-bold text-gray-800 text-center">{t.cards.presencesStats}</div>
        </Link>

        <Link href="/admin/create-cellule" className={CARD_CLASS} style={{ borderTop: "4px solid #c8cf0e" }}>
          <div className="text-5xl mb-2">➕</div>
          <div className="text-lg font-bold text-gray-800 text-center">{t.cards.ajouterCellule}</div>
        </Link>          

        <Link href="/cellule/EtatCellulePage" className={CARD_CLASS} style={{ borderTop: "4px solid #a855f7" }}>
          <div className="text-5xl mb-2">🌱</div>
          <div className="text-lg font-bold text-gray-800 text-center">{t.cards.etatCellule}</div>
        </Link>

        <Link href="/Presence" className={CARD_CLASS} style={{ borderTop: "4px solid #06b6d4" }}>
          <div className="text-5xl mb-2">✍️</div>
          <div className="text-lg font-bold text-gray-800 text-center">{t.cards.registrePresences}</div>
        </Link>

        <Link href="/rapport/RapportPresence" className={CARD_CLASS} style={{ borderTop: "4px solid #2a8496" }}>
          <div className="text-5xl mb-2">✅</div>
          <div className="text-lg font-bold text-gray-800 text-center">{t.cards.rapportRegistres}</div>
        </Link>

        <Link href="/admin/notifications" className={CARD_CLASS} style={{ borderTop: "4px solid #ef4444" }}>
          <div className="text-5xl mb-2">🔔</div>
          <div className="text-lg font-bold text-gray-800 text-center">{t.cards.notifications}</div>
        </Link>

      </div>

      {isResponsableCellule && (
        <>
          <div className="w-full max-w-md mt-5 mb-3">
            <SendLinkPopup
              label={t.sendLinkMembre}
              type="ajouter_membre_cellule"
              buttonColor="from-[#f7971e] to-[#ffd200]"
            />
          </div>
          <div className="w-full max-w-md mb-6">
            <SendLinkPopup
              label={t.sendLinkEvang}
              type="ajouter_evangelise_cellule"
              buttonColor="from-[#11998e] to-[#38ef7d]"
            />
          </div>
        </>
      )}

      <div className="max-w-3xl w-full mt-12 mb-4 text-center px-4">
        <p className="italic text-base text-white/90 leading-relaxed">
          {t.footer}
        </p>
      </div>

      <FooterHub />
    </div>
  );
}
