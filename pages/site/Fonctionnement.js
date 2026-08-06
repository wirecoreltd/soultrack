"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import supabase from "../../lib/supabaseClient";
import { useLang } from "../../hooks/useLang";

import { Great_Vibes, Cormorant_Garamond, Inter } from "next/font/google";
const greatVibes = Great_Vibes({ subsets: ["latin"], weight: "400" });
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
});
const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600"] });

// ─── DICTIONNAIRE ────────────────────────────────────────────────────────────
const translations = {
  fr: {
    login: "Connexion",
    signup: "Créer mon église",
    webVersion: "Version web",
    logout: "Déconnexion",
    nav: [
      { label: "Accueil", path: "/site/HomePage" },
      { label: "Fonctionnement", path: "/site/Fonctionnement" },
      { label: "À propos", path: "/site/about" },
      { label: "Pricing", path: "/site/pricing" },
      { label: "Contact", path: "/site/contact" },
    ],
    eyebrow: "Comment ça marche",
    heroPara: `Chaque module sert un même chemin : suivre la présence, former les membres, accompagner les baptisés, engager chacun dans le service, répondre aux besoins et veiller d'abord sur la croissance personnelle de chaque vie, puis sur celle de l'église dans son ensemble. Rien ici n'est de simples données, mais des vies confiées à notre soin.`,
    heroPara2: `Que chaque âme soit gagnée, restaurée, bien entourée, enracinée dans la Parole et transformée en un disciple fidèle et accompli dans la maison de Dieu.`,
    heroTitle: "Comment fonctionne",
    footer: "Tous droits réservés.",
    modules: [
      {
        title: "Espace Membres",
        emoji: "🧭",
        desc: "Le registre vivant de l'église : chaque membre y est accueilli, situé et accompagné dans la durée.",
        accentText: "#9DC2A4",
        accent: "rgba(157,194,164,0.6)",
        accentSoft: "rgba(157,194,164,0.15)",
        steps: [
          { icon: "➕", title: "Nouveau Membre", desc: "Créer ou importer un nouveau membre avec ses informations essentielles pour l'intégrer dans la base." },
          { icon: "🏛️", title: "Liste des Membres", desc: "Accéder instantanément à tous les membres enregistrés, chacun disposant d'une carte dédiée, pour une vue claire et facile à exploiter." },
          { icon: "👤", title: "Affectation", desc: "Associer un membre à un conseiller ou une cellule pour un suivi plus structuré et personnalisé." },
          { icon: "💌", title: "Suivis", desc: "Enregistrer les interactions, commentaires et l'évolution du membre dans le temps." },
          { icon: "📊", title: "Rapport", desc: "Analyser les données pour suivre la croissance, l'activité et l'efficacité du suivi." },
        ],
      },
      {
        title: "Espace Évangélisation",
        emoji: "✝️",
        desc: "Le premier contact devient une histoire suivie, du témoignage jusqu'à la décision de foi.",
        accentText: "#D8B45B",
        accent: "rgba(216,180,91,0.6)",
        accentSoft: "rgba(216,180,91,0.15)",
        steps: [
          { icon: "➕", title: "Nouveau contact", desc: "Créer et centraliser toutes les nouvelles données afin de constituer une base structurée et exploitable." },
          { icon: "🌿", title: "Liste des Évangélisées", desc: "Accéder à une vue claire et structurée de toutes les informations avec une classification automatique." },
          { icon: "💗", title: "Suivis", desc: "Enregistrer les échanges, commentaires et évolutions pour garantir un accompagnement continu." },
          { icon: "💧", title: "Baptême", desc: "Enregistrer les étapes spirituelles." },
          { icon: "📊", title: "Rapport", desc: "Suivre les performances globales à travers des indicateurs pour mesurer l'impact et optimiser les actions." },
        ],
      },
      {
        title: "Espace Cellules",
        emoji: "🏠",
        desc: "Le tissu de proximité : des groupes vivants où chacun est vu, encadré et enraciné.",
        accentText: "#79B8B5",
        accent: "rgba(121,184,181,0.6)",
        accentSoft: "rgba(121,184,181,0.15)",
        steps: [
          { icon: "🏠", title: "Liste des Cellules", desc: "Créer, organiser et suivre les cellules afin d'assurer une structure claire et un encadrement efficace." },
          { icon: "💌", title: "Suivi des Âmes", desc: "Suivre l'évolution des personnes depuis leur premier contact jusqu'à leur intégration dans l'église." },
          { icon: "👤", title: "Responsable", desc: "Gérer les responsables de cellules et d'équipes pour un leadership efficace." },
          { icon: "🌱", title: "Intégration", desc: "Accompagner les nouveaux venus jusqu'à leur enracinement dans une cellule active." },
          { icon: "📊", title: "Croissance", desc: "Analyser l'évolution globale des membres, des cellules et des conversions." },
        ],
      },
      {
        title: "Espace Enfant",
        emoji: "🧒",
        desc: "Les plus jeunes grandissent en sécurité, suivis classe après classe, leçon après leçon.",
        accentText: "#D79A89",
        accent: "rgba(215,154,137,0.6)",
        accentSoft: "rgba(215,154,137,0.15)",
        steps: [
          { icon: "➕", title: "Nouvel Enfant", desc: "Inscrire un enfant avec les coordonnées de son parent ou tuteur." },
          { icon: "🧒", title: "Liste des Enfants", desc: "Retrouver tous les enfants inscrits, classés par tranche d'âge." },
          { icon: "🎒", title: "Classes & Groupes", desc: "Organiser les classes d'âge et assigner des encadrants responsables." },
          { icon: "✅", title: "Présence & Retrait", desc: "Pointer les arrivées et départs avec un code de retrait sécurisé pour les parents." },
          { icon: "📖", title: "Suivi Pédagogique", desc: "Suivre les leçons apprises et la progression spirituelle de chaque enfant." },
          { icon: "📊", title: "Rapport", desc: "Mesurer la fréquentation et la croissance de l'école du dimanche." },
        ],
      },
      {
        title: "Espace Conseiller",
        emoji: "🤝",
        desc: "Un accompagnement pastoral rapproché, du premier échange jusqu'à la maturité spirituelle.",
        accentText: "#E0A867",
        accent: "rgba(224,168,103,0.6)",
        accentSoft: "rgba(224,168,103,0.15)",
        steps: [
          { icon: "🏛️", title: "Mes membres", desc: "Centraliser tous les membres de l'église avec leurs informations complètes." },
          { icon: "💗", title: "Suivis", desc: "Assurer un accompagnement régulier pour renforcer la proximité et identifier les besoins." },
          { icon: "🌱", title: "Évolution des Âmes", desc: "Analyser la progression des personnes accompagnées." },
          { icon: "🎯", title: "Parcours Spirituel", desc: "Définir les étapes de croissance, du premier contact jusqu'à la maturité spirituelle." },
          { icon: "📊", title: "Rapports", desc: "Suivre et analyser les données globales pour évaluer l'impact du suivi pastoral." },
        ],
      },
      {
        title: "Espace Administrateur",
        emoji: "🛡️",
        desc: "La structure qui tient l'ensemble : utilisateurs, rôles et liens entre églises.",
        accentText: "#A79BD9",
        accent: "rgba(167,155,217,0.6)",
        accentSoft: "rgba(167,155,217,0.15)",
        steps: [
          { icon: "👤", title: "Liste des Utilisateurs", desc: "Consulter tous les utilisateurs rattachés à l'église, leurs rôles et leur statut." },
          { icon: "🔗", title: "Invitations & Liens", desc: "Inviter, superviser ou relier votre église à d'autres structures." },
          { icon: "🧑‍💻", title: "Créer un Utilisateur", desc: "Ajouter un membre d'équipe avec un rôle défini." },
          { icon: "💳", title: "Abonnement", desc: "Gérer l'abonnement et la facturation de l'église." },
          { icon: "🔧", title: "Modifier l'église", desc: "Mettre à jour les informations générales de l'église." },
          { icon: "🗑️", title: "Supprimer le compte", desc: "Faire une demande de suppression du compte et des données." },
        ],
      },
      {
        title: "Espace Rapports",
        emoji: "📉",
        desc: "Toutes les histoires se rassemblent ici, en une vue d'ensemble claire de la croissance.",
        accentText: "#8FB0D6",
        accent: "rgba(143,176,214,0.6)",
        accentSoft: "rgba(143,176,214,0.15)",
        steps: [
          { icon: "⛪", title: "Affluence", desc: "Suivi des présences aux cultes : hommes, femmes, jeunes, enfants, connectés et nouveaux venus." },
          { icon: "✒️", title: "Formations", desc: "Analyse des formations organisées : participation et évolution de la croissance spirituelle." },
          { icon: "💧", title: "Baptême", desc: "Suivi des baptêmes réalisés. Mesure les décisions publiques de foi." },
          { icon: "💢", title: "Ministère", desc: "État des serviteurs engagés par ministère : répartition, implication et dynamique." },
          { icon: "❓", title: "Besoins", desc: "Identification des besoins spirituels et personnels des membres." },
          { icon: "📊", title: "Vue d'ensemble", desc: "Vue d'ensemble complète de l'église : croissance, engagement, structures et impact spirituel." },
        ],
      },
    ],
  },
  en: {
    login: "Log in",
    signup: "Create my church",
    webVersion: "Web version",
    logout: "Log out",
    nav: [
      { label: "Home", path: "/site/HomePage" },
      { label: "How it works", path: "/site/Fonctionnement" },
      { label: "About", path: "/site/about" },
      { label: "Pricing", path: "/site/pricing" },
      { label: "Contact", path: "/site/contact" },
    ],
    eyebrow: "How it works",
    heroPara: `Every module serves the same journey: tracking attendance, training members, accompanying the baptised, engaging each person in service, responding to needs and watching first over the personal growth of each life, then over the church as a whole. Nothing here is mere data — these are lives entrusted to our care.`,
    heroPara2: `May every soul be won, restored, well surrounded, rooted in the Word and transformed into a faithful and fulfilled disciple in the house of God.`,
    heroTitle: "How",
    heroTitleSuffix: "works",
    footer: "All rights reserved.",
    modules: [
      {
        title: "Members Space",
        emoji: "🧭",
        desc: "The living register of the church: every member is welcomed, placed and accompanied over time.",
        accentText: "#9DC2A4",
        accent: "rgba(157,194,164,0.6)",
        accentSoft: "rgba(157,194,164,0.15)",
        steps: [
          { icon: "➕", title: "New Member", desc: "Create or import a new member with their essential information to integrate them into the database." },
          { icon: "🏛️", title: "Members List", desc: "Instantly access all registered members, each with a dedicated card, for a clear and structured view." },
          { icon: "👤", title: "Assignment", desc: "Associate a member with a counselor or cell group for more structured, personalised follow-up." },
          { icon: "💌", title: "Follow-ups", desc: "Record interactions, comments and the member's progress over time." },
          { icon: "📊", title: "Report", desc: "Analyse data to track growth, activity and the effectiveness of follow-up." },
        ],
      },
      {
        title: "Evangelism Space",
        emoji: "✝️",
        desc: "A first contact becomes a followed story, from the initial encounter to a decision of faith.",
        accentText: "#D8B45B",
        accent: "rgba(216,180,91,0.6)",
        accentSoft: "rgba(216,180,91,0.15)",
        steps: [
          { icon: "➕", title: "New Contact", desc: "Create and centralise all new data to build a structured and usable database." },
          { icon: "🌿", title: "Evangelised List", desc: "Access a clear and structured view of all information with automatic classification." },
          { icon: "💗", title: "Follow-ups", desc: "Record exchanges, comments and progress to ensure continuous support." },
          { icon: "💧", title: "Baptism", desc: "Record spiritual milestones." },
          { icon: "📊", title: "Report", desc: "Track overall performance through indicators to measure impact and optimise actions." },
        ],
      },
      {
        title: "Cell Groups Space",
        emoji: "🏠",
        desc: "The fabric of community: living groups where everyone is seen, guided and rooted.",
        accentText: "#79B8B5",
        accent: "rgba(121,184,181,0.6)",
        accentSoft: "rgba(121,184,181,0.15)",
        steps: [
          { icon: "🏠", title: "Cell Groups List", desc: "Create, organise and track cell groups to ensure a clear structure and effective oversight." },
          { icon: "💌", title: "Soul Follow-up", desc: "Track people's journey from their first contact through to full integration into the church." },
          { icon: "👤", title: "Leader", desc: "Manage cell and team leaders for effective on-the-ground leadership." },
          { icon: "🌱", title: "Integration", desc: "Guide newcomers until they are rooted in an active cell group." },
          { icon: "📊", title: "Growth", desc: "Analyse the overall evolution of members, cells and conversions." },
        ],
      },
      {
        title: "Children's Space",
        emoji: "🧒",
        desc: "The youngest grow in safety, followed class by class, lesson by lesson.",
        accentText: "#D79A89",
        accent: "rgba(215,154,137,0.6)",
        accentSoft: "rgba(215,154,137,0.15)",
        steps: [
          { icon: "➕", title: "New Child", desc: "Register a child with their parent or guardian's contact details." },
          { icon: "🧒", title: "Children List", desc: "Find every registered child, grouped by age range." },
          { icon: "🎒", title: "Classes & Groups", desc: "Organise classes by age and assign responsible carers." },
          { icon: "✅", title: "Check-in & Pickup", desc: "Log arrivals and departures with a secure pickup code for parents." },
          { icon: "📖", title: "Learning Journey", desc: "Track lessons learned and each child's spiritual progress." },
          { icon: "📊", title: "Report", desc: "Measure Sunday school attendance and growth." },
        ],
      },
      {
        title: "Counselor Space",
        emoji: "🤝",
        desc: "Close pastoral accompaniment, from the first conversation to spiritual maturity.",
        accentText: "#E0A867",
        accent: "rgba(224,168,103,0.6)",
        accentSoft: "rgba(224,168,103,0.15)",
        steps: [
          { icon: "🏛️", title: "My Members", desc: "Centralise all church members with their complete information." },
          { icon: "💗", title: "Follow-ups", desc: "Provide regular support to strengthen connection and identify needs." },
          { icon: "🌱", title: "Soul Progress", desc: "Analyse the progression of those being accompanied." },
          { icon: "🎯", title: "Spiritual Journey", desc: "Define growth stages, from first contact to spiritual maturity." },
          { icon: "📊", title: "Reports", desc: "Track and analyse overall data to evaluate the impact of pastoral care." },
        ],
      },
      {
        title: "Administrator Space",
        emoji: "🛡️",
        desc: "The structure holding it together: users, roles and links between churches.",
        accentText: "#A79BD9",
        accent: "rgba(167,155,217,0.6)",
        accentSoft: "rgba(167,155,217,0.15)",
        steps: [
          { icon: "👤", title: "Users List", desc: "View every user linked to the church, their roles and status." },
          { icon: "🔗", title: "Invitations & Links", desc: "Invite, supervise or link your church with other structures." },
          { icon: "🧑‍💻", title: "Create a User", desc: "Add a team member with a defined role." },
          { icon: "💳", title: "Subscription", desc: "Manage the church's subscription and billing." },
          { icon: "🔧", title: "Edit church", desc: "Update the church's general information." },
          { icon: "🗑️", title: "Delete account", desc: "Request deletion of the account and its data." },
        ],
      },
      {
        title: "Reports Space",
        emoji: "📉",
        desc: "Every story gathers here, into one clear view of the church's growth.",
        accentText: "#8FB0D6",
        accent: "rgba(143,176,214,0.6)",
        accentSoft: "rgba(143,176,214,0.15)",
        steps: [
          { icon: "⛪", title: "Attendance", desc: "Track service attendance: men, women, youth, children, online and newcomers." },
          { icon: "✒️", title: "Training", desc: "Analysis of organised training: participation and spiritual growth." },
          { icon: "💧", title: "Baptism", desc: "Track baptisms performed. Measures public decisions of faith." },
          { icon: "💢", title: "Ministry", desc: "Status of servants engaged by ministry: distribution and involvement." },
          { icon: "❓", title: "Needs", desc: "Identify spiritual and personal needs of church members." },
          { icon: "📊", title: "Overview", desc: "Complete church overview: growth, engagement, structures and spiritual impact." },
        ],
      },
    ],
  },
};

const numerals = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];

function langBtnStyle(active) {
  return {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 0,
    opacity: active ? 1 : 0.45,
    transition: "opacity 0.2s",
  };
}

export default function Fonctionnement() {
  const router = useRouter();
  const pathname = usePathname();

  const [openMenu, setOpenMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { lang, changeLang } = useLang();

  // ── Profil connecté ─────────────────────────────────────────────────────
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const t = translations[lang];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ── Profil : chargement + écoute des changements de session ────────────
  useEffect(() => {
    const loadProfile = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session) {
        setProfile(null);
        setLoadingProfile(false);
        return;
      }

      const { data: profileData, error } = await supabase
        .from("profiles")
        .select("id, prenom, nom, role, roles")
        .eq("id", sessionData.session.user.id)
        .single();

      if (!error) setProfile(profileData);
      setLoadingProfile(false);
    };

    loadProfile();

    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      loadProfile();
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.clear();
    setProfile(null);
    router.push("/login");
  };

  return (
    <div
      className={inter.className}
      style={{ background: "#333699", minHeight: "100vh", position: "relative", overflowX: "hidden" }}
    >
      {/* ───── HEADER (inchangé) ───── */}
      <header
        style={{
          background: scrolled ? "rgba(51,54,153,0.92)" : "transparent",
          borderBottom: scrolled
            ? "0.5px solid rgba(255,255,255,0.15)"
            : "0.5px solid transparent",
          position: "sticky",
          top: 0,
          zIndex: 100,
          backdropFilter: scrolled ? "blur(16px)" : "none",
          transition: "background 0.3s, border-color 0.3s",
        }}
      >
        <div
          style={{
            maxWidth: "1240px",
            margin: "0 auto",
            padding: "22px 24px",
            height: "88px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "24px",
            boxSizing: "border-box",
          }}
        >
          {/* LOGO */}
          <div
            onClick={() => router.push("/site/HomePage")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              cursor: "pointer",
              zIndex: 1,
              flexShrink: 0,
            }}
          >
            <Image src="/logo.png" alt="SoulTrack" width={38} height={38} />
            <span
              style={{
                color: "#fff",
                fontSize: "19px",
                fontWeight: 500,
                fontFamily: "'Great Vibes', cursive",
                whiteSpace: "nowrap",
              }}
            >
              SoulTrack
            </span>
          </div>

          {/* ───── GROUPE DROITE desktop : nav + boutons + switcher langue ───── */}
          <div
            className="nav-hide"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "26px",
              zIndex: 1,
              flexShrink: 0,
            }}
          >
            {/* NAV */}
            <nav
              style={{
                display: "flex",
                alignItems: "center",
                gap: "20px",
                zIndex: 1,
                flexShrink: 0,
              }}
            >
              {t.nav.map((item) => (
                <span
                  key={item.path}
                  onClick={() => router.push(item.path)}
                  style={{
                    color: pathname === item.path ? "#fbbf24" : "#fff",
                    fontSize: "14px",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "color 0.2s",
                    whiteSpace: "nowrap",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color =
                      pathname === item.path ? "#fbbf24" : "#fff")
                  }
                >
                  {item.label}
                </span>
              ))}
            </nav>

            {/* BOUTONS profil / login+signup */}
            <div
              style={{
                display: "flex",
                gap: "8px",
                alignItems: "center",
                zIndex: 1,
                flexShrink: 0,
              }}
            >
              {loadingProfile ? (
                <div style={{ width: "180px", height: "34px" }} />
              ) : profile ? (
                <>
                  <span
                    onClick={() => router.push("/hub")}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      cursor: "pointer",
                      color: "#fff",
                      fontSize: "14px",
                      fontWeight: 600,
                      whiteSpace: "nowrap",
                    }}
                  >
                    <span
                      style={{
                        width: "28px",
                        height: "28px",
                        borderRadius: "50%",
                        background: "#fbbf24",
                        color: "#333699",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 700,
                        fontSize: "13px",
                      }}
                    >
                      {profile.prenom?.[0]?.toUpperCase() || "U"}
                    </span>
                    {profile.prenom} {profile.nom}
                  </span>

                  <button
                    onClick={() => router.push("/hub")}
                    style={{
                      background: "transparent",
                      color: "#fff",
                      border: "0.5px solid rgba(255,255,255,0.35)",
                      padding: "6px 12px",
                      borderRadius: "8px",
                      fontSize: "14px",
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {t.webVersion}
                  </button>

                  <button
                    onClick={handleLogout}
                    style={{
                      background: "transparent",
                      color: "#fbbf24",
                      border: "0.5px solid rgba(255,255,255,0.35)",
                      padding: "6px 12px",
                      borderRadius: "8px",
                      fontSize: "14px",
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {t.logout}
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => router.push("/login")}
                    style={{
                      background: "transparent",
                      color: "#fbbf24",
                      border: "0.5px solid rgba(255,255,255,0.35)",
                      padding: "7px 18px",
                      borderRadius: "8px",
                      fontSize: "14px",
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {t.login}
                  </button>
                  <button
                    onClick={() => router.push("/site/pricing")}
                    style={{
                      background: "#fff",
                      color: "#333699",
                      border: "none",
                      padding: "7px 18px",
                      borderRadius: "8px",
                      fontSize: "14px",
                      fontWeight: 600,
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {t.signup}
                  </button>
                </>
              )}
            </div>

            {/* Switcher langue */}
            <div style={{ display: "flex", gap: "10px", alignItems: "center", flexShrink: 0 }}>
              <button onClick={() => changeLang("fr")} title="Français" style={{ background: "none", border: "none", cursor: "pointer", padding: 0, opacity: lang === "fr" ? 1 : 0.45, transition: "opacity 0.2s", flexShrink: 0 }}>
                <img src="https://flagcdn.com/w40/fr.png" srcSet="https://flagcdn.com/w80/fr.png 2x" width="30" height="21" alt="Français" style={{ display: "block", borderRadius: "3px", flexShrink: 0 }} />
              </button>
              <button onClick={() => changeLang("en")} title="English" style={{ background: "none", border: "none", cursor: "pointer", padding: 0, opacity: lang === "en" ? 1 : 0.45, transition: "opacity 0.2s", flexShrink: 0 }}>
                <img src="https://flagcdn.com/w40/gb.png" srcSet="https://flagcdn.com/w80/gb.png 2x" width="30" height="21" alt="English" style={{ display: "block", borderRadius: "3px", flexShrink: 0 }} />
              </button>
            </div>
          </div>
          {/* ───── FIN GROUPE DROITE ───── */}

          {/* HAMBURGER */}
          <button
            onClick={() => setOpenMenu(!openMenu)}
            className="nav-show"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              display: "none",
              flexDirection: "column",
              gap: "5px",
              padding: "4px",
              zIndex: 1,
            }}
          >
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                style={{
                  display: "block",
                  width: "22px",
                  height: "1.5px",
                  background: "rgba(255,255,255,0.85)",
                  borderRadius: "2px",
                  transition: "transform 0.2s, opacity 0.2s",
                  transform: openMenu
                    ? i === 0
                      ? "rotate(45deg) translate(5px, 5px)"
                      : i === 2
                      ? "rotate(-45deg) translate(5px, -5px)"
                      : "scaleX(0)"
                    : "none",
                  opacity: openMenu && i === 1 ? 0 : 1,
                }}
              />
            ))}
          </button>
        </div>

        {/* MENU MOBILE */}
        {openMenu && (
          <div
            style={{
              background: "#333699",
              borderTop: "0.5px solid rgba(255,255,255,0.15)",
              padding: "20px 24px 28px",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
            }}
          >
            {t.nav.map((item) => (
              <span
                key={item.path}
                onClick={() => {
                  router.push(item.path);
                  setOpenMenu(false);
                }}
                style={{
                  color: pathname === item.path ? "#fbbf24" : "#fff",
                  fontSize: "15px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {item.label}
              </span>
            ))}

            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <button onClick={() => changeLang("fr")} title="Français" style={langBtnStyle(lang === "fr")}>
                <img src="https://flagcdn.com/w20/fr.png" srcSet="https://flagcdn.com/w40/fr.png 2x" width="20" height="14" alt="Français" style={{ display: "block", borderRadius: "2px" }} />
              </button>
              <button onClick={() => changeLang("en")} title="English" style={langBtnStyle(lang === "en")}>
                <img src="https://flagcdn.com/w20/gb.png" srcSet="https://flagcdn.com/w40/gb.png 2x" width="20" height="14" alt="English" style={{ display: "block", borderRadius: "2px" }} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "4px" }}>
              {loadingProfile ? null : profile ? (
                <>
                  <span
                    onClick={() => { router.push("/hub"); setOpenMenu(false); }}
                    style={{ color: "#fff", fontSize: "15px", fontWeight: 600, cursor: "pointer" }}
                  >
                    👤 {profile.prenom} {profile.nom}
                  </span>
                  <button
                    onClick={() => { router.push("/hub"); setOpenMenu(false); }}
                    style={{ background: "transparent", color: "#fff", border: "0.5px solid rgba(255,255,255,0.35)", padding: "11px", borderRadius: "8px", fontSize: "14px", cursor: "pointer" }}
                  >
                    {t.webVersion}
                  </button>
                  <button
                    onClick={() => { handleLogout(); setOpenMenu(false); }}
                    style={{ background: "transparent", color: "#fbbf24", border: "0.5px solid rgba(255,255,255,0.35)", padding: "11px", borderRadius: "8px", fontSize: "14px", cursor: "pointer" }}
                  >
                    {t.logout}
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => { router.push("/login"); setOpenMenu(false); }}
                    style={{ background: "transparent", color: "#fff", border: "0.5px solid rgba(255,255,255,0.35)", padding: "11px", borderRadius: "8px", fontSize: "14px", cursor: "pointer" }}
                  >
                    {t.login}
                  </button>
                  <button
                    onClick={() => { router.push("/site/pricing"); setOpenMenu(false); }}
                    style={{ background: "#fff", color: "#333699", border: "none", padding: "11px", borderRadius: "8px", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}
                  >
                    {t.signup}
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* ───── CORPS : thème "manuscrit illuminé" ───── */}
      <div
        style={{
          background:
            "radial-gradient(ellipse 900px 500px at 50% 0%, rgba(216,180,91,0.10), transparent 60%), linear-gradient(180deg, #1B1D3A 0%, #181A38 100%)",
          position: "relative",
        }}
      >
        {/* ───── HERO ───── */}
        <section style={{ textAlign: "center", padding: "72px 24px 56px", position: "relative", zIndex: 1 }}>
          <div
            style={{
              display: "inline-block",
              color: "#D8B45B",
              fontSize: "12px",
              fontWeight: 600,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              marginBottom: "20px",
              fontFamily: inter.style.fontFamily,
            }}
          >
            {t.eyebrow}
          </div>

          <h2
            style={{
              color: "#EDE7D8",
              fontStyle: "italic",
              fontWeight: 600,
              fontSize: "clamp(1.8rem, 5vw, 3rem)",
              lineHeight: 1.15,
              margin: "0 auto 28px",
              fontFamily: cormorant.style.fontFamily,
            }}
          >
            {lang === "fr" ? (
              <>{t.heroTitle} <span style={{ color: "#fbbf24", fontStyle: "normal" }}>SoulTrack</span></>
            ) : (
              <>{t.heroTitle} <span style={{ color: "#fbbf24", fontStyle: "normal" }}>SoulTrack</span> {t.heroTitleSuffix}</>
            )}
          </h2>

          {/* Ornement vigne */}
          <svg width="140" height="20" viewBox="0 0 140 20" style={{ margin: "0 auto 32px", display: "block" }}>
            <path d="M5 10 Q35 -2 70 10 T135 10" stroke="rgba(216,180,91,0.55)" strokeWidth="1.2" fill="none" />
            <circle cx="70" cy="10" r="3" fill="#D8B45B" />
            <circle cx="30" cy="6" r="1.6" fill="rgba(157,194,164,0.8)" />
            <circle cx="110" cy="6" r="1.6" fill="rgba(157,194,164,0.8)" />
          </svg>

          <p
            style={{
              color: "rgba(237,231,216,0.75)",
              fontSize: "clamp(0.92rem, 1.6vw, 1.05rem)",
              lineHeight: 1.85,
              maxWidth: "660px",
              margin: "0 auto",
              fontWeight: 400,
            }}
          >
            {t.heroPara}
            <br />
            <br />
            <span style={{ fontStyle: "italic", color: "rgba(237,231,216,0.9)" }}>{t.heroPara2}</span>
          </p>
        </section>

        {/* ───── CHAPITRES / MODULES ───── */}
        <div style={{ maxWidth: "900px", margin: "0 auto", padding: "0 0 40px", position: "relative", zIndex: 1 }}>
          {t.modules.map((module, mIndex) => (
            <section
              key={mIndex}
              className="chapter-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "84px 1fr",
                gap: "28px",
                padding: "0 24px 56px",
                position: "relative",
              }}
            >
              {/* Colonne vigne + médaillon */}
              <div style={{ position: "relative", display: "flex", justifyContent: "center" }}>
                <div
                  className="vine"
                  style={{
                    position: "absolute",
                    top: 0,
                    bottom: "-56px",
                    left: "50%",
                    width: "1.5px",
                    background: `linear-gradient(180deg, transparent, ${module.accent}, transparent)`,
                    transform: "translateX(-50%)",
                  }}
                />
                <div
                  className="medallion"
                  style={{
                    position: "relative",
                    zIndex: 2,
                    width: "62px",
                    height: "62px",
                    borderRadius: "50%",
                    background: `radial-gradient(circle at 30% 30%, ${module.accentSoft}, rgba(21,23,58,0.95))`,
                    border: `1px solid ${module.accent}`,
                    boxShadow: `0 0 22px 1px ${module.accentSoft}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: cormorant.style.fontFamily,
                    fontSize: "20px",
                    fontWeight: 600,
                    color: "#EDE7D8",
                  }}
                >
                  {numerals[mIndex]}
                  <span style={{ position: "absolute", bottom: "-4px", right: "-4px", fontSize: "13px" }}>🌿</span>
                </div>
              </div>

              {/* Colonne contenu */}
              <div>
                <div style={{ display: "flex", alignItems: "baseline", gap: "10px", marginBottom: "8px", flexWrap: "wrap" }}>
                  <span style={{ fontSize: "20px" }}>{module.emoji}</span>
                  <h3
                    style={{
                      fontFamily: cormorant.style.fontFamily,
                      fontStyle: "italic",
                      fontWeight: 600,
                      fontSize: "clamp(1.25rem, 3vw, 1.6rem)",
                      color: module.accentText,
                      margin: 0,
                    }}
                  >
                    {module.title}
                  </h3>
                </div>

                <p
                  style={{
                    color: "rgba(237,231,216,0.6)",
                    fontSize: "13.5px",
                    lineHeight: 1.75,
                    margin: "0 0 22px",
                    maxWidth: "540px",
                    fontStyle: "italic",
                  }}
                >
                  {module.desc}
                </p>

                <div style={{ display: "flex", flexDirection: "column" }}>
                  {module.steps.map((step, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        gap: "14px",
                        alignItems: "flex-start",
                        padding: "13px 0",
                        borderBottom:
                          i < module.steps.length - 1 ? "1px solid rgba(255,255,255,0.07)" : "none",
                      }}
                    >
                      <span
                        style={{
                          flexShrink: 0,
                          width: "24px",
                          height: "24px",
                          borderRadius: "50%",
                          border: `1px solid ${module.accent}`,
                          color: module.accentText,
                          fontSize: "10.5px",
                          fontWeight: 700,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          marginTop: "1px",
                        }}
                      >
                        {i + 1}
                      </span>
                      <span style={{ fontSize: "16px", flexShrink: 0 }}>{step.icon}</span>
                      <div>
                        <div style={{ color: "#EDE7D8", fontWeight: 600, fontSize: "13.5px", marginBottom: "2px" }}>
                          {step.title}
                        </div>
                        <div style={{ color: "rgba(237,231,216,0.5)", fontSize: "12.5px", lineHeight: 1.6 }}>
                          {step.desc}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          ))}
        </div>
      </div>

      {/* ───── FOOTER (inchangé) ───── */}
      <footer
        style={{
          borderTop: "0.5px solid rgba(255,255,255,0.1)",
          padding: "20px 24px",
          boxSizing: "border-box",
          width: "100%",
          background: "#181A38",
        }}
      >
        <div
          style={{
            maxWidth: "1100px",
            margin: "0 auto",
            textAlign: "center",
            color: "rgba(255,255,255,0.35)",
            fontSize: "14px",
          }}
        >
          <div>© {new Date().getFullYear()} SoulTrack. {t.footer}</div>

          <div style={{ marginTop: "10px", display: "flex", justifyContent: "center", gap: "16px", flexWrap: "wrap" }}>
            <span onClick={() => router.push("/site/terms")} style={{ cursor: "pointer", textDecoration: "underline" }}>Terms</span>
            <span onClick={() => router.push("/site/privacy")} style={{ cursor: "pointer", textDecoration: "underline" }}>Privacy</span>
            <span onClick={() => router.push("/site/refund")} style={{ cursor: "pointer", textDecoration: "underline" }}>Refund</span>
          </div>
        </div>
      </footer>

      <style>{`
        body { overflow-x: hidden; }

        @media (max-width: 768px) {
          .nav-hide { display: none !important; }
          .nav-show { display: flex !important; }
        }

        @media (max-width: 640px) {
          .chapter-grid {
            grid-template-columns: 52px 1fr !important;
            gap: 16px !important;
            padding-left: 16px !important;
            padding-right: 16px !important;
          }
          .medallion {
            width: 42px !important;
            height: 42px !important;
            font-size: 15px !important;
          }
        }
      `}</style>
    </div>
  );
}
