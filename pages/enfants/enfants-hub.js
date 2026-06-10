"use client";

import { useRouter } from "next/navigation";
import HeaderPages from "../../components/HeaderPages";
import Footer from "../../components/Footer";
import ProtectedRoute from "../../components/ProtectedRoute";
import { useLang } from "../../hooks/useLang";

const translations = {
  fr: {
    title: "Espace",
    titleHighlight: "Enfants",
    subtitle: "Gérez les enfants de votre église,",
    subtitleAccent1: " suivez leurs présences",
    subtitleMid: " et",
    subtitleAccent2: " consultez les rapports",
    subtitleEnd: " pour accompagner chaque enfant avec soin.",
    cards: {
      liste: "Liste des enfants",
      listeSub: "Voir et gérer les fiches enfants",
      presence: "Présence",
      presenceSub: "Prendre la présence du jour",
      rapport: "Rapports",
      rapportSub: "Évolution, fidélité, tranches d'âge",
    },
  },
  en: {
    title: "Children's",
    titleHighlight: "Space",
    subtitle: "Manage your church's children,",
    subtitleAccent1: " track attendance",
    subtitleMid: " and",
    subtitleAccent2: " view reports",
    subtitleEnd: " to support every child with care.",
    cards: {
      liste: "Children list",
      listeSub: "View and manage children profiles",
      presence: "Attendance",
      presenceSub: "Take today's attendance",
      rapport: "Reports",
      rapportSub: "Growth, loyalty, age groups",
    },
  },
};

const hubCards = [
  {
    key: "liste",
    path: "/enfants/liste-enfants",
    emoji: "🐨",
    color: "#FCA5A5",
  },
  {
    key: "presence",
    path: "/enfants/presence-enfants",
    emoji: "✍🏻",
    color: "#FCD34D",
  },
  {
    key: "rapport",
    path: "/enfants/rapport-enfants",
    emoji: "📊",
    color: "#6EE7B7",
  },
];

export default function EnfantsHub() {
  return (
    <ProtectedRoute allowedRoles={["Administrateur", "ResponsableEnfants"]}>    
      <EnfantsHubContent />
    </ProtectedRoute>
  );
}

function EnfantsHubContent() {
  const router = useRouter();
  const { lang } = useLang();
  const t = translations[lang];

  return (
    <div className="min-h-screen flex flex-col items-center p-6" style={{ background: "#333699" }}>
      <HeaderPages />

      <h1 className="text-2xl font-bold mt-4 mb-2 text-center text-white">
        {t.title}{" "}
        <span className="text-emerald-300">{t.titleHighlight}</span>
      </h1>

      <div className="max-w-3xl w-full mb-8 text-center">
        <p className="italic text-base text-white/90">
          {t.subtitle}
          <span className="text-blue-300 font-semibold">{t.subtitleAccent1}</span>
          {t.subtitleMid}{" "}
          <span className="text-blue-300 font-semibold">{t.subtitleAccent2}</span>
          {t.subtitleEnd}
        </p>
      </div>

      <div className="flex flex-col md:flex-row flex-wrap gap-6 justify-center items-center w-full max-w-4xl">
        {hubCards.map((card) => (
          <div
            key={card.key}
            onClick={() => router.push(card.path)}
            className="flex-1 min-w-[250px] w-full bg-white rounded-2xl shadow-xl border-t-4 p-6 flex flex-col items-center justify-center cursor-pointer hover:shadow-2xl transition-all hover:-translate-y-1"
            style={{ borderTopColor: card.color }}
          >
            <span className="text-5xl mb-3">{card.emoji}</span>
            <h2 className="text-lg font-bold text-gray-800 mb-1">
              {t.cards[card.key]}
            </h2>
            <p className="text-sm text-gray-400 text-center">
              {t.cards[`${card.key}Sub`]}
            </p>
          </div>
        ))}
      </div>

      <Footer />
    </div>
  );
}
