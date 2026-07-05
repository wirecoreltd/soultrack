"use client";

import Link from "next/link";
import SendLinkPopup from "../../components/SendLinkPopup";
import { useEffect, useState } from "react";
import HeaderPages from "../../components/HeaderPages";
import ProtectedRoute from "../../components/ProtectedRoute";
import FooterHub from "../../components/FooterHub";
import supabase from "../../lib/supabaseClient";
import { useLang } from "../../hooks/useLang";

// ─── TRADUCTIONS ──────────────────────────────────────────────────────────────
const translations = {
  fr: {
    loading: "Chargement de l'utilisateur...",
    title: "Espace Membres",
    subtitle: "Accédez facilement à toutes les",
    subtitleHighlight1: "fonctionnalités",
    subtitleMid: "de votre équipe : gestion des membres, suivi des familles, création et suivi des conseillers, ainsi que les rapports et présences.",
    subtitleHighlight2: "Tout votre suivi au même endroit",
    cards: {
      gererMembres:      "Gérer les membres",
      suiviMembres:      "Suivi des membres",
      creerConseiller:   "Créer un Conseiller",
      listConseillers:   "Liste des Conseillers",
      baptemes:          "Baptêmes",
      presencesRapports: "Saisie et suivi des présences par réunion",
      registrePresences: "Saisie des présences individuelles",
      notifications:     "Notifications",
      registres:         "Statistiques des présences individuelles",
    },
    sendLink: "Envoyer formulaire Église – Nouveau membre",
    verse: "Car le corps ne se compose pas d'un seul membre, mais de plusieurs.",
    verseRef: "1 Corinthiens 12:14 ❤️",
  },
  en: {
    loading: "Loading user...",
    title: "Members Space",
    subtitle: "Easily access all the",
    subtitleHighlight1: "features",
    subtitleMid: "of your team: member management, family follow-up, counselor creation and tracking, as well as reports and attendance.",
    subtitleHighlight2: "All your tracking in one place",
    cards: {
      gererMembres:      "Manage members",
      suiviMembres:      "Member follow-up",
      creerConseiller:   "Create a Counselor",
      listConseillers:   "Counselors list",
      baptemes:          "Baptisms",
      presencesRapports: "Meeting Attendance Entry & Tracking",
      registrePresences: "Individual Attendance Entry",
      notifications:     "Notifications",
      registres:         "Individual Attendance Statistics",
    },
    sendLink: "Send Church form – New member",
    verse: "For the body is not one member, but many.",
    verseRef: "1 Corinthians 12:14 ❤️",
  },
};

const HUB_BACKGROUND = "linear-gradient(135deg, #2E3192 0%, #92EFFD 100%)";

export default function MembresHub() {
  return (
    <ProtectedRoute allowedRoles={["Administrateur", "Superadmin", "ResponsableIntegration"]}>
      <MembresHubContent />
    </ProtectedRoute>
  );
}

function MembresHubContent() {
  const { lang } = useLang();
  const t = translations[lang];

  const [userId, setUserId] = useState("");
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error || !session) {
        console.error("Erreur récupération session :", error?.message);
        setLoadingUser(false);
        return;
      }
      setUserId(session.user.id);
      setLoadingUser(false);
    };
    fetchUser();
  }, []);

  if (loadingUser) return <p className="text-white mt-10 text-center">{t.loading}</p>;

  return (
    <div
      className="min-h-screen flex flex-col items-center p-6 text-center space-y-6"
      style={{ background: HUB_BACKGROUND }}
    >
      <HeaderPages />

      <div className="text-center mb-6">
        <h1 className="text-3xl font-extrabold mt-4 mb-6 text-white drop-shadow-lg">{t.title}</h1>
        <div className="max-w-3xl w-full mb-6 text-center">
          <p className="italic text-base text-white/90">
            {t.subtitle}{" "}
            <span className="text-blue-300 font-semibold">{t.subtitleHighlight1}</span>{" "}
            {t.subtitleMid}{" "}
            <span className="text-blue-300 font-semibold">{t.subtitleHighlight2}</span>.
          </p>
        </div>
      </div>

      {/* Cartes principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-5xl mb-6">
        <Link href="/membres/list-members" className="flex-1 bg-white rounded-2xl shadow-md flex flex-col justify-center items-center border-t-4 border-[#0D9488] p-6 hover:shadow-lg transition-all duration-200 cursor-pointer h-32">
          <div className="text-4xl mb-2">🏛️</div>
          <div className="text-lg font-bold text-gray-800 text-center">{t.cards.gererMembres}</div>
        </Link>

        <Link href="/membres/suivis-membres" className="flex-1 bg-white rounded-2xl shadow-md flex flex-col justify-center items-center border-t-4 border-[#38BDF8] p-6 hover:shadow-lg transition-all duration-200 cursor-pointer h-32">
          <div className="text-4xl mb-2">💌</div>
          <div className="text-lg font-bold text-gray-800 text-center">{t.cards.suiviMembres}</div>
        </Link>

        <Link href="/membres/create-conseiller" className="flex-1 bg-white rounded-2xl shadow-md flex flex-col justify-center items-center border-t-4 border-[#F97316] p-6 hover:shadow-lg transition-all duration-200 cursor-pointer h-32">
          <div className="text-4xl mb-2">➕</div>
          <div className="text-lg font-bold text-gray-800 text-center">{t.cards.creerConseiller}</div>
        </Link>

        <Link href="/membres/list-conseillers" className="flex-1 bg-white rounded-2xl shadow-md flex flex-col justify-center items-center border-t-4 border-[#F472B6] p-6 hover:shadow-lg transition-all duration-200 cursor-pointer h-32">
          <div className="text-4xl mb-2">🗃️</div>
          <div className="text-lg font-bold text-gray-800 text-center">{t.cards.listConseillers}</div>
        </Link>
      </div>

      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Link href="/rapport/RapportBaptemePage" className="bg-white rounded-2xl shadow-md flex flex-col justify-center items-center border-t-4 border-[#10B981] p-6 hover:shadow-lg transition-all duration-200 cursor-pointer h-32">
          <div className="text-4xl mb-2">💧</div>
          <div className="text-lg font-bold text-gray-800 text-center">{t.cards.baptemes}</div>
        </Link>

        <Link href="/rapport/attendance" className="bg-white rounded-2xl shadow-md flex flex-col justify-center items-center border-t-4 border-[#0EA5E9] p-6 hover:shadow-lg transition-all duration-200 cursor-pointer h-32">
          <div className="text-4xl mb-2">🛐</div>
          <div className="text-lg font-bold text-gray-800 text-center">{t.cards.presencesRapports}</div>
        </Link>

        <Link href="/Presence" className="bg-white rounded-2xl shadow-md flex flex-col justify-center items-center border-t-4 border-[#84CC16] p-6 hover:shadow-lg transition-all duration-200 cursor-pointer h-32">
          <div className="text-4xl mb-2">✍🏻</div>
          <div className="text-lg font-bold text-gray-800 text-center">{t.cards.registrePresences}</div>
        </Link>

        <Link href="/rapport/RapportPresence" className="bg-white rounded-2xl shadow-md flex flex-col justify-center items-center border-t-4 border-[#F59E0B] p-6 hover:shadow-lg transition-all duration-200 cursor-pointer h-32">
          <div className="text-4xl mb-2">✅</div>
          <div className="text-lg font-bold text-gray-800 text-center">{t.cards.registres}</div>
        </Link>

        <Link href="/admin/notifications" className="flex-1 bg-white rounded-2xl shadow-md flex flex-col justify-center items-center border-t-4 border-[#FBBF24] p-6 hover:shadow-lg transition-all duration-200 cursor-pointer h-32">
          <div className="text-4xl mb-2">🔔</div>
          <div className="text-lg font-bold text-gray-800 text-center">{t.cards.notifications}</div>
        </Link>
      </div>

      <div className="w-full max-w-md mb-10">
        <SendLinkPopup
          label={t.sendLink}
          type="ajouter_membre"
          buttonColor="from-[#09203F] to-[#537895]"
          userId={userId}
        />
      </div>

      <div className="mt-auto mb-4 text-center text-white text-base italic max-w-2xl leading-relaxed tracking-wide font-light">
        {t.verse} <br />
        {t.verseRef}
      </div>

      <FooterHub />
    </div>
  );
}
