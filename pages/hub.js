"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import supabase from "../lib/supabaseClient";
import HeaderPages from "../components/HeaderPages";
import Footer from "../components/Footer";
import { FEATURE_ROUTES, buildFeaturesState, canAccessFeature } from "../lib/features";
import { useLang } from "../hooks/useLang";

// ─── TRADUCTIONS ──────────────────────────────────────────────────────────────
const translations = {
  fr: {
    dashboard: "Tableau de bord",
    welcome: "Bienvenue dans votre espace",
    welcomeSub: "Accédez aux différents hubs selon votre rôle pour servir et organiser l'église.",
    footer: "Une vision, plusieurs rôles, un même objectif : voir des vies transformées.",
    loading: "Chargement...",
    cards: {
      membres:        "Gestion des membres",
      evangelisation: "Évangélisation",
      cellule:        "Cellule",
      conseiller:     "Conseiller",
      conseillerHub:  "Conseiller Hub",
      familles:       "Familles",
      rapport:        "Rapport",
      admin:          "Admin",
      presence:       "Registre des présences",
      enfants:        "Gestion des enfants",
      notifications:  "Notifications",
      superadmin:     "Admin SoulTrack",
    },
  },
  en: {
    dashboard: "Dashboard",
    welcome: "Welcome to your space",
    welcomeSub: "Access the different hubs according to your role to serve and organise the church.",
    footer: "One vision, multiple roles, one goal: seeing lives transformed.",
    loading: "Loading...",
    cards: {
      membres:        "Member management",
      evangelisation: "Evangelism",
      cellule:        "Cell group",
      conseiller:     "Counselor",
      conseillerHub:  "Counselor Hub",
      familles:       "Families",
      rapport:        "Report",
      admin:          "Admin",
      presence:       "Attendance register",
      enfants:        "Child management",
      notifications:  "Notifications",
      superadmin:     "SoulTrack Admin",
    },
  },
};

const ROLES_WITH_NOTIF_IN_HUB = ["ResponsableFamilles", "ResponsableCellule", "Conseiller", "SuperviseurCellule"];

// Les cards utilisent des clés pour récupérer le label traduit
// Ordre global : Membres → Évangélisation → Cellule → Conseiller → Familles → Enfants → Présences → Rapport → Notifications → Admin
const roleCards = {
  Administrateur: [
    { path: "/membres/membres-hub",               key: "membres",        emoji: "🧭", color: "#0E7490" },
    { path: "/evangelisation/evangelisation-hub", key: "evangelisation", emoji: "✝️", color: "#F97316" },
    { path: "/cellule/cellules-hub",              key: "cellule",        emoji: "🏠", color: "#10B981" },
    { path: "/conseiller/conseiller-hub",         key: "conseiller",     emoji: "🤝", color: "#0EA5E9" },
    { path: "/famille/familles-hub",              key: "familles",       emoji: "👑", color: "#F59E0B" },
    { path: "/enfants/enfants-hub",               key: "enfants",        emoji: "🦁", color: "#e640b7" },
    { path: "/Presence",                          key: "presence",       emoji: "✍🏻", color: "#3052cf" },
    { path: "/rapport/rapport-hub",               key: "rapport",        emoji: "📈", color: "#FBBF24" },
    { path: "/admin/notifications",               key: "notifications",  emoji: "🔔", color: "#ef4444" },
    { path: "/administrateur/administrateur",     key: "admin",          emoji: "⚙️", color: "#202330" },
  ],
  Superadmin: [
    { path: "/membres/membres-hub",               key: "membres",        emoji: "🧭", color: "#0E7490" },
    { path: "/evangelisation/evangelisation-hub", key: "evangelisation", emoji: "✝️", color: "#F97316" },
    { path: "/cellule/cellules-hub",              key: "cellule",        emoji: "🏠", color: "#10B981" },
    { path: "/conseiller/conseiller-hub",         key: "conseiller",     emoji: "🤝", color: "#0EA5E9" },
    { path: "/famille/familles-hub",              key: "familles",       emoji: "👑", color: "#F59E0B" },
    { path: "/enfants/enfants-hub",               key: "enfants",        emoji: "🦁", color: "#e640b7" },
    { path: "/Presence",                          key: "presence",       emoji: "✍🏻", color: "#3052cf" },
    { path: "/rapport/rapport-hub",               key: "rapport",        emoji: "📈", color: "#FBBF24" },
    { path: "/admin/notifications",               key: "notifications",  emoji: "🔔", color: "#ef4444" },
    { path: "/administrateur/administrateur",     key: "admin",          emoji: "⚙️", color: "#202330" },
    { path: "/Superadmin/Superadmin-hub",         key: "superadmin",     emoji: "🔐", color: "#000000" },
  ],
  ResponsableIntegration: [
    { path: "/membres/membres-hub", key: "membres", emoji: "🧭", color: "#0284C7" },
  ],
  ResponsableEvangelisation: [
    { path: "/evangelisation/evangelisation-hub", key: "evangelisation", emoji: "✝️", color: "#0D9488" },
  ],
  ResponsableCellule: [
    { path: "/cellule/cellules-hub", key: "cellule", emoji: "🏠", color: "#06B6D4" },
  ],
  SuperviseurCellule: [
    { path: "/cellule/cellules-hub", key: "cellule", emoji: "🏠", color: "#06B6D4" },
  ],
  Conseiller: [
    { path: "/conseiller/conseiller-hub", key: "conseillerHub", emoji: "🤝", color: "#F59E0B" },
  ],
  ResponsableFamilles: [
    { path: "/famille/familles-hub", key: "familles", emoji: "👑", color: "#F59E0B" },
  ],
  CheckInPresence: [
    { path: "/Presence", key: "presence", emoji: "✍🏻", color: "#3052cf" },
  ],
  ResponsableCheckIn: [
    { path: "/Presence", key: "presence", emoji: "✍🏻", color: "#3052cf" },
  ],
  ResponsableEnfants: [
    { path: "/enfants/enfants-hub", key: "enfants", emoji: "🦁", color: "#e640b7" },
  ],
  Membre: [],
};

const PAGE_BACKGROUND =
  "linear-gradient(to bottom, #3A48A0 0%, #3A48A0 10%, #405BAF 30%, #3E7DCF 55%, #405BAF 80%, #3A48A0 100%)";

export default function IndexPage() {
  const router = useRouter();
  const { lang } = useLang();
  const t = translations[lang];

  const [roles, setRoles] = useState([]);
  const [features, setFeatures] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      try {
        // 1) Lire les rôles depuis localStorage tout de suite (aucun coût réseau,
        //    permet potentiellement d'afficher les cards avant même la vérif session)
        const storedRoles = localStorage.getItem("userRole");
        let parsedRoles = [];
        if (storedRoles) {
          try {
            const parsed = JSON.parse(storedRoles);
            parsedRoles = Array.isArray(parsed) ? parsed : [parsed];
          } catch {
            parsedRoles = [storedRoles];
          }
        }

        // 2) Vérifier la session (obligatoire, mais rapide - lit le token local
        //    en priorité avant de revalider avec le serveur)
        const { data } = await supabase.auth.getSession();
        if (cancelled) return;

        if (!data?.session) {
          router.replace("/login");
          return;
        }

        if (cancelled) return;
        setRoles(parsedRoles);

        // Redirection directe pour les rôles à page unique : pas besoin
        // de charger quoi que ce soit d'autre
        if (parsedRoles.length === 1 && parsedRoles[0] === "CheckInPresence") {
          router.replace("/Presence");
          return;
        }

        // 3) Pour un Administrateur (non Superadmin), on a besoin des features.
        //    Fusion en UNE requête via le join Supabase au lieu de deux requêtes
        //    séquentielles (profiles puis eglise_features).
        if (parsedRoles.includes("Administrateur") && !parsedRoles.includes("Superadmin")) {
          const { data: profile, error } = await supabase
            .from("profiles")
            .select("eglise_id, eglise_features(feature, active)")
            .eq("id", data.session.user.id)
            .single();

          if (cancelled) return;

          if (!error && profile?.eglise_id) {
            setFeatures(buildFeaturesState(profile.eglise_features || []));
          }
        }

        if (!cancelled) setReady(true);
      } catch (err) {
        console.error("Init error:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    init();
    return () => {
      cancelled = true;
    };
  }, [router]);

  // ─── Construction des cards (mémoïsée, ne recalcule que si roles/features changent) ──
  const cardsToShow = useMemo(() => {
    if (!ready) return [];

    if (roles.includes("Superadmin")) {
      return [...roleCards.Superadmin];
    }

    if (roles.includes("Administrateur")) {
      return roleCards.Administrateur.filter((card) => {
        const featureKey = Object.keys(FEATURE_ROUTES).find((k) => FEATURE_ROUTES[k] === card.path);
        if (!featureKey) return true;
        return canAccessFeature(features, featureKey);
      });
    }

    const list = [];
    roles.forEach((role) => {
      const key = role.trim();
      if (roleCards[key]) {
        roleCards[key].forEach((card) => {
          if (!list.find((c) => c.path === card.path)) list.push(card);
        });
      }
    });

    const isMemberOnly = roles.length === 1 && roles[0] === "Membre";
    const notifAlreadyInCards = list.find((c) => c.path === "/admin/notifications");
    if (!isMemberOnly && !notifAlreadyInCards) {
      list.push({ path: "/admin/notifications", key: "notifications", emoji: "🔔", color: "#ef4444" });
    }

    return list;
  }, [ready, roles, features]);

  const handleRedirect = (path) => router.push(path.startsWith("/") ? path : "/" + path);

  // ─── Skeleton pendant le chargement (au lieu d'un écran blanc) ───────────────
  if (loading || !ready) {
    return (
      <div
        className="min-h-screen flex flex-col items-center p-6 text-center space-y-6"
        style={{ background: PAGE_BACKGROUND }}
      >
        <HeaderPages />
        <div className="animate-pulse text-white/80 text-sm mt-10">{t.loading}</div>
        <div className="flex flex-col md:flex-row flex-wrap gap-4 justify-center items-center w-full max-w-4xl">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="flex-1 min-w-[250px] w-full h-32 bg-white/20 rounded-2xl animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center p-6 text-center space-y-6"
      style={{ background: PAGE_BACKGROUND }}
    >
      <HeaderPages />

      <div className="text-center mb-6">
        <h1 className="text-3xl font-extrabold mt-4 mb-6 text-white drop-shadow-lg">
          {t.dashboard}
        </h1>
        <div className="max-w-3xl w-full mb-6 text-center">
          <p className="italic text-base text-white/90">
            <span className="text-blue-300 font-semibold">{t.welcome}</span>. {t.welcomeSub}
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
            <div className="text-lg font-bold text-gray-800">
              {t.cards[card.key]}
            </div>
          </div>
        ))}
      </div>

      <div className="max-w-3xl w-full mb-6 text-center">
        <p className="italic text-base text-white/90">{t.footer}</p>
      </div>

      <Footer />
    </div>
  );
}
