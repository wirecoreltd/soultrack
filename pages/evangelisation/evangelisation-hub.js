"use client";

import Link from "next/link";
import Image from "next/image";
import LogoutLink from "../../components/LogoutLink";
import SendLinkPopup from "../../components/SendLinkPopup";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import HeaderPages from "../../components/HeaderPages";
import ProtectedRoute from "../../components/ProtectedRoute";
import FooterHub from "../../components/FooterHub";
import { useLang } from "../../hooks/useLang";

// ─── TRADUCTIONS ──────────────────────────────────────────────────────────────
const translations = {
  fr: {
    title: "Espace Évangélisation",
    subtitle: "Accédez à votre hub d'évangélisation pour consulter la liste des évangélisés,",
    subtitleHighlight: "suivre leurs progrès et générer des rapports détaillés avec KPIs et statistiques clés",
    cards: {
      liste:    "Liste des évangélisés",
      suivis:   "Suivis des évangélisés",
      rapport:  "Rapport Évangélisation",
      notifications: "Notifications",
    },
    sendLink: "Envoyer l'appli – Évangélisé",
    verse: "Va, fais de toutes les nations des disciples. Chaque rencontre compte, chaque âme est précieuse.",
  },
  en: {
    title: "Evangelism Space",
    subtitle: "Access your evangelism hub to view the list of evangelised people,",
    subtitleHighlight: "track their progress and generate detailed reports with KPIs and key statistics",
    cards: {
      liste:    "Evangelised list",
      suivis:   "Evangelism follow-up",
      rapport:  "Evangelism report",
      notifications: "Notifications",
    },
    sendLink: "Send app – Evangelised",
    verse: "Go and make disciples of all nations. Every encounter matters, every soul is precious.",
  },
};

export default function EvangelisationHub() {
  return (
    <ProtectedRoute allowedRoles={["Administrateur", "ResponsableEvangelisation"]}>
      <EvangelisationHubContent />
    </ProtectedRoute>
  );
}

function EvangelisationHubContent() {
  const router = useRouter();
  const { lang } = useLang();
  const t = translations[lang];

  const [userName, setUserName] = useState("");

  useEffect(() => {
    const name = localStorage.getItem("userName") || "Utilisateur";
    setUserName(name.split(" ")[0]);
  }, []);

  return (
    <div
      className="min-h-screen flex flex-col items-center p-6 text-center space-y-6"
      style={{ background: "linear-gradient(135deg, #2E3192 0%, #92EFFD 100%)" }}
    >
      <HeaderPages />

      <div className="text-center mb-6">
        <h1 className="text-3xl font-extrabold mt-4 mb-6 text-white drop-shadow-lg">{t.title}</h1>
        <p className="italic text-base text-white/90">
          {t.subtitle} <span className="text-blue-300 font-semibold">{t.subtitleHighlight}</span>.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6 justify-center w-full max-w-5xl mb-6">

        <Link href="/evangelisation/evangelisation"
          className="flex-1 bg-white rounded-2xl shadow-md flex flex-col justify-center items-center border-t-4 border-[#0D9488] p-6 hover:shadow-lg transition-all duration-200 cursor-pointer h-32">
          <div className="text-4xl mb-2">🌿</div>
          <div className="text-lg font-bold text-gray-800 text-center">{t.cards.liste}</div>
        </Link>

        <Link href="/evangelisation/suivis-evangelisation"
          className="flex-1 bg-white rounded-2xl shadow-md flex flex-col justify-center items-center border-t-4 border-[#38BDF8] p-6 hover:shadow-lg transition-all duration-200 cursor-pointer h-32">
          <div className="text-4xl mb-2">💗</div>
          <div className="text-lg font-bold text-gray-800 text-center">{t.cards.suivis}</div>
        </Link>

        <Link href="/rapport/Rapport-evangelisation"
          className="flex-1 bg-white rounded-2xl shadow-md flex flex-col justify-center items-center border-t-4 border-[#F97316] p-6 hover:shadow-lg transition-all duration-200 cursor-pointer h-32">
          <div className="text-4xl mb-2">🗒️</div>
          <div className="text-lg font-bold text-gray-800 text-center">{t.cards.rapport}</div>
        </Link>

        <Link href="/admin/notifications"
          className="flex-1 bg-white rounded-2xl shadow-md flex flex-col justify-center items-center border-t-4 border-[#84CC16] p-6 hover:shadow-lg transition-all duration-200 cursor-pointer h-32">
          <div className="text-4xl mb-2">🔔</div>
          <div className="text-lg font-bold text-gray-800 text-center">{t.cards.notifications}</div>
        </Link>
      </div>

      <div className="w-full max-w-md mb-10">
        <SendLinkPopup
          label={t.sendLink}
          type="ajouter_evangelise"
          buttonColor="from-[#09203F] to-[#537895]"
        />
      </div>

      <div className="mt-auto mb-4 text-center text-white text-base italic max-w-2xl leading-relaxed tracking-wide font-light">
        {t.verse}
      </div>

      <FooterHub />
    </div>
  );
}
