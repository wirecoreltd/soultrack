import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Image from "next/image";
import supabase from "../lib/supabaseClient";
import { useLang } from "../hooks/useLang";
import HeaderSite from "../components/HeaderSite";

import { Great_Vibes } from "next/font/google";
const greatVibes = Great_Vibes({ subsets: ["latin"], weight: "400" });

// ─── DICTIONNAIRE ────────────────────────────────────────────────────────────
const translations = {
  fr: {
    login: "Connexion",
    signup: "Créer mon église",
    webVersion: "Version web",
    logout: "Déconnexion",
    title: "Fonctionnement de SoulTrack — Suivi évangélisation, cellules et soin des âmes",
    metaDescription:
      "Découvrez comment fonctionne SoulTrack : suivi des membres, de l'évangélisation, des cellules, du soin des âmes, des enfants, des conseillers et des rapports — dans une seule application de gestion d'église.",
    nav: [
      { label: "Accueil", path: "/" },
      { label: "Fonctionnement", path: "/fonctionnement" },
      { label: "À propos", path: "/about" },
      { label: "Pricing", path: "/pricing" },
      { label: "Contact", path: "/contact" },
    ],
    eyebrow: "Comment ça marche",
    heroPara: `Chaque module sert un même chemin : suivre la présence, former les membres, accompagner les baptisés, engager chacun dans le service, répondre aux besoins et veiller d'abord sur la croissance personnelle de chaque vie, puis sur celle de l'église dans son ensemble. Rien ici n'est de simples données, mais des vies confiées à notre soin.`,
    heroPara2: `Que chaque âme soit gagnée, restaurée, bien entourée, enracinée dans la Parole et transformée en un disciple fidèle et accompli dans la maison de Dieu.`,
    heroTitle: "Comment fonctionne",
    footer: "Tous droits réservés.",
    moreFeatures:
      "✨ Et ce n'est qu'un aperçu ! De nombreuses autres fonctionnalités vous attendent dans l'application pour accompagner chaque aspect de la vie de votre église.",
    modules: [
      {
        title: "Espace Membres",        
        desc: "Le registre vivant de l'église : chaque membre y est accueilli, situé et accompagné dans la durée.",
        accentText: "#9DC2A4",
        accent: "rgba(157,194,164,0.6)",
        accentSoft: "rgba(157,194,164,0.15)",
        steps: [
          { icon: "➕", title: "Nouveau Membre", desc: "Créer ou importer un nouveau membre avec ses informations essentielles pour l'intégrer dans la base." },
          { icon: "🏛️", title: "Liste des Membres", desc: "Accéder instantanément à tous les membres enregistrés, chacun disposant d'une carte dédiée, pour une vue claire et facile à exploiter." },
          { icon: "👤", title: "Affectation", desc: "Associer un membre à un conseiller ou une cellule pour un suivi plus structuré et personnalisé." },
          { icon: "💌", title: "Suivis", desc: "Enregistrer les interactions, commentaires et l'évolution du membre dans le temps." },
          { icon: "✍🏻", title: "Registre des présences", desc: "Enregistrer la présence des membres aux cultes, réunions et événements afin de suivre leur participation au fil du temps." },          
        ],
      },
      {
        title: "Espace Évangélisation",       
        desc: "Le premier contact devient une histoire suivie, du témoignage jusqu'à la décision de foi.",
        accentText: "#D8B45B",
        accent: "rgba(216,180,91,0.6)",
        accentSoft: "rgba(216,180,91,0.15)",
        steps: [
          { icon: "➕", title: "Nouveau contact", desc: "Créer et centraliser toutes les nouvelles données afin de constituer une base structurée et exploitable." },
          { icon: "🙏", title: "Décision pour Christ", desc: "Enregistrer les personnes ayant accepté Jésus-Christ et suivre leur progression jusqu'au baptême et à leur intégration dans l'église." },
          { icon: "🌿", title: "Liste des Évangélisées", desc: "Accéder à une vue claire et structurée de toutes les informations avec une classification automatique." },
          { icon: "💗", title: "Suivis", desc: "Enregistrer les échanges, commentaires et évolutions pour garantir un accompagnement continu." },
          { icon: "💧", title: "Baptême", desc: "Enregistrer les étapes spirituelles." },     
        ],
      },
      {
        title: "Espace Cellules",       
        desc: "Le tissu de proximité : des groupes vivants où chacun est vu, encadré et enraciné.",
        accentText: "#79B8B5",
        accent: "rgba(121,184,181,0.6)",
        accentSoft: "rgba(121,184,181,0.15)",
        steps: [
          { icon: "🏠", title: "Liste des Cellules", desc: "Créer, organiser et suivre les cellules afin d'assurer une structure claire et un encadrement efficace." },
          { icon: "👥", title: "Membres", desc: "Consulter les membres de chaque cellule et assurer leur suivi au sein du groupe." },
          { icon: "🤝", title: "Intégration", desc: "Accompagner les nouveaux venus jusqu'à leur pleine intégration dans une cellule active." },
          { icon: "💌", title: "Suivi des Âmes", desc: "Enregistrer les échanges et accompagner chaque personne dans son cheminement spirituel." },
          { icon: "🗒️", title: "Présences", desc: "Saisir les présences des réunions et suivre la participation des membres au fil du temps." },     
        ],
      },
      {
        title: "Espace Enfant",        
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
        ],
      },
      {
        title: "Espace Conseiller",       
        desc: "Un accompagnement pastoral rapproché, du premier échange jusqu'à la maturité spirituelle.",
        accentText: "#E0A867",
        accent: "rgba(224,168,103,0.6)",
        accentSoft: "rgba(224,168,103,0.15)",
        steps: [
          { icon: "👥", title: "Mes Membres", desc: "Retrouver instantanément les personnes qui vous sont confiées afin de les accompagner personnellement." },
          { icon: "💬", title: "Accompagnement", desc: "Documenter chaque échange, visite et appel pour assurer un suivi régulier et personnalisé." },
          { icon: "❤️", title: "Besoins", desc: "Identifier les besoins spirituels, familiaux ou matériels afin d'apporter un accompagnement adapté." },
          { icon: "🌱", title: "Évolution", desc: "Observer les progrès de chaque personne et célébrer les étapes importantes de son cheminement." },
          { icon: "🤲", title: "Encouragement", desc: "Soutenir, conseiller et encourager chaque membre à persévérer et à grandir dans sa foi." },    
        ],
      },
      {
        title: "Espace Administrateur",      
        desc: "La structure qui tient l'ensemble : utilisateurs, rôles et liens entre églises.",
        accentText: "#A79BD9",
        accent: "rgba(167,155,217,0.6)",
        accentSoft: "rgba(167,155,217,0.15)",
        steps: [
          { icon: "👤", title: "Utilisateurs", desc: "Gérer les utilisateurs, leurs rôles et leurs niveaux d'accès au sein de l'église." },
          { icon: "🛡️", title: "Permissions", desc: "Attribuer les responsabilités et garantir un accès sécurisé à chaque espace." },
          { icon: "🔗", title: "Églises", desc: "Créer des liens entre églises et superviser les structures rattachées." },
          { icon: "⚙️", title: "Configuration", desc: "Personnaliser les informations, les paramètres et l'identité de l'église." },
          { icon: "💳", title: "Abonnement", desc: "Gérer le plan, la facturation et les services associés à votre église." },        
        ],
      },
      {
        title: "Espace Rapports",        
        desc: "Toutes les histoires se rassemblent ici, en une vue d'ensemble claire de la croissance.",
        accentText: "#8FB0D6",
        accent: "rgba(143,176,214,0.6)",
        accentSoft: "rgba(143,176,214,0.15)",
        steps: [
          { icon: "⛪", title: "Affluence", desc: "Suivi des présences aux cultes : hommes, femmes, jeunes, enfants, connectés et nouveaux venus." },
          { icon: "✝️", title: "Évangélisation", desc: "Mesurer les nouveaux contacts, les décisions pour Christ, les suivis et les baptêmes issus de l'évangélisation." },
          { icon: "✒️", title: "Formations", desc: "Analyse des formations organisées : participation et évolution de la croissance spirituelle." },
          { icon: "💧", title: "Baptême", desc: "Suivi des baptêmes réalisés. Mesure les décisions publiques de foi." },
          { icon: "💢", title: "Ministère", desc: "État des serviteurs engagés par ministère : répartition, implication et dynamique." },
          { icon: "❓", title: "Besoins", desc: "Identification des besoins spirituels et personnels des membres." },
          { icon: "🌱", title: "Etat", desc: "Piloter l'ensemble de l'Église grâce à des indicateurs consolidés : croissance, engagement, impact spirituel et progression par cellule, conseiller, ministère et département." },
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
    title: "How SoulTrack Works — Evangelism Tracking, Cell Groups & Soul Care Software",
    metaDescription:
      "See how SoulTrack works: member tracking, evangelism, cell groups, soul care, children's ministry, counselors and reports — all in one church management app.",
    nav: [
      { label: "Home", path: "/" },
      { label: "How it works", path: "/fonctionnement" },
      { label: "About", path: "/about" },
      { label: "Pricing", path: "/pricing" },
      { label: "Contact", path: "/contact" },
    ],
    eyebrow: "How it works",
    heroPara: `Every module serves the same journey: tracking attendance, training members, accompanying the baptised, engaging each person in service, responding to needs and watching first over the personal growth of each life, then over the church as a whole. Nothing here is mere data — these are lives entrusted to our care.`,
    heroPara2: `May every soul be won, restored, well surrounded, rooted in the Word and transformed into a faithful and fulfilled disciple in the house of God.`,
    heroTitle: "How",
    heroTitleSuffix: "works",
    footer: "All rights reserved.",
    moreFeatures:
      "✨ And this is just a glimpse! Many more features await you inside the app to support every aspect of your church's life.",
    modules: [
      {
        title: "Members Space",        
        desc: "The living register of the church: every member is welcomed, placed and accompanied over time.",
        accentText: "#9DC2A4",
        accent: "rgba(157,194,164,0.6)",
        accentSoft: "rgba(157,194,164,0.15)",
        steps: [
          { icon: "➕", title: "New Member", desc: "Create or import a new member with their essential information to integrate them into the database." },
          { icon: "🏛️", title: "Members List", desc: "Instantly access all registered members, each with a dedicated card, for a clear and structured view." },
          { icon: "👤", title: "Assignment", desc: "Associate a member with a counselor or cell group for more structured, personalised follow-up." },
          { icon: "💌", title: "Follow-ups", desc: "Record interactions, comments and the member's progress over time." },
          { icon: "✍🏻", title: "Individual Attendance Entry", desc: "Record members' attendance at services, meetings and events to monitor their participation over time." },       
        ],
      },
      {
        title: "Evangelism Space",        
        desc: "A first contact becomes a followed story, from the initial encounter to a decision of faith.",
        accentText: "#D8B45B",
        accent: "rgba(216,180,91,0.6)",
        accentSoft: "rgba(216,180,91,0.15)",
        steps: [
          { icon: "➕", title: "New Contact", desc: "Create and centralise all new data to build a structured and usable database." },
          { icon: "🙏", title: "Decision for Christ", desc: "Record those who have accepted Jesus Christ and follow their journey through baptism and integration into the church." },
          { icon: "🌿", title: "Evangelised List", desc: "Access a clear and structured view of all information with automatic classification." },
          { icon: "💗", title: "Follow-ups", desc: "Record exchanges, comments and progress to ensure continuous support." },
          { icon: "💧", title: "Baptism", desc: "Record spiritual milestones." },
        ],
      },
      {
        title: "Cell Groups Space",      
        desc: "The fabric of community: living groups where everyone is seen, guided and rooted.",
        accentText: "#79B8B5",
        accent: "rgba(121,184,181,0.6)",
        accentSoft: "rgba(121,184,181,0.15)",
        steps: [
          { icon: "🏠", title: "Cell Groups List", desc: "Create, organise and track cell groups to ensure a clear structure and effective oversight." },
          { icon: "💌", title: "Soul Follow-up", desc: "Track people's journey from their first contact through to full integration into the church." },
          { icon: "👤", title: "Leader", desc: "Manage cell and team leaders for effective on-the-ground leadership." },
          { icon: "🧩", title: "Integration", desc: "Guide newcomers until they are rooted in an active cell group." },
          { icon: "📊", title: "Growth", desc: "Analyse the overall evolution of members, cells and conversions." },
        ],
      },
      {
        title: "Children's Space",      
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
        ],
      },
      {
        title: "Counselor Space",       
        desc: "Close pastoral accompaniment, from the first conversation to spiritual maturity.",
        accentText: "#E0A867",
        accent: "rgba(224,168,103,0.6)",
        accentSoft: "rgba(224,168,103,0.15)",
        steps: [
          { icon: "👥", title: "My Members", desc: "Quickly access the people entrusted to your care and support them personally." },
          { icon: "💬", title: "Pastoral Care", desc: "Record conversations, visits and calls to provide consistent and personalised support." },
          { icon: "❤️", title: "Needs", desc: "Identify spiritual, family and practical needs to provide appropriate care and guidance." },
          { icon: "🌱", title: "Growth", desc: "Monitor each person's spiritual progress and celebrate key milestones in their journey." },
          { icon: "🤲", title: "Encouragement", desc: "Encourage, strengthen and guide every member to grow in faith and remain engaged." },
        ],
      },
      {
        title: "Administrator Space",     
        desc: "The structure holding it together: users, roles and links between churches.",
        accentText: "#A79BD9",
        accent: "rgba(167,155,217,0.6)",
        accentSoft: "rgba(167,155,217,0.15)",
        steps: [
          { icon: "👤", title: "Users", desc: "Manage users, their roles and access levels across the church." },
          { icon: "🛡️", title: "Permissions", desc: "Assign responsibilities and ensure secure access to every area of the platform." },
          { icon: "🔗", title: "Church Links", desc: "Connect churches and oversee linked organisations and structures." },
          { icon: "⚙️", title: "Configuration", desc: "Update your church's information, settings and organisational profile." },
          { icon: "💳", title: "Subscription", desc: "Manage your church's subscription, billing and related services." },
        ],
      },
      {
        title: "Reports Space",     
        desc: "Every story gathers here, into one clear view of the church's growth.",
        accentText: "#8FB0D6",
        accent: "rgba(143,176,214,0.6)",
        accentSoft: "rgba(143,176,214,0.15)",
        steps: [
          { icon: "⛪", title: "Attendance", desc: "Track service attendance: men, women, youth, children, online and newcomers." },
          { icon: "✝️", title: "Evangelism", desc: "Track new contacts, decisions for Christ, follow-ups and baptisms resulting from evangelism." },
          { icon: "✒️", title: "Training", desc: "Analysis of organised training: participation and spiritual growth." },
          { icon: "💧", title: "Baptism", desc: "Track baptisms performed. Measures public decisions of faith." },
          { icon: "💢", title: "Ministry", desc: "Status of servants engaged by ministry: distribution and involvement." },
          { icon: "❓", title: "Needs", desc: "Identify spiritual and personal needs of church members." },
          { icon: "🌱", title: "Condition", desc: "Monitor your entire church through consolidated insights, including growth, engagement, spiritual impact, and progress by cell group, counsellor, ministry and department." },
          { icon: "📊", title: "Overview", desc: "Complete church overview: growth, engagement, structures and spiritual impact." },
        ],
      },
    ],
  },
};

const numerals = ["🧭", "✝️", "🏠", "🦁", "🤝", "⚙️", "📉", "VIII", "IX", "X"];

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
      style={{ background: "#333699", minHeight: "100vh", position: "relative", overflowX: "hidden" }}
    >
      <Head>
        <title>{t.title}</title>
        <meta name="description" content={t.metaDescription} />
        <link rel="canonical" href="https://soultrack.org/fonctionnement" />
      
        <meta property="og:title" content={t.title} />
        <meta property="og:description" content={t.metaDescription} />
        <meta property="og:url" content="https://soultrack.org/fonctionnement" />
        <meta property="og:type" content="website" />
      </Head>

      <HeaderSite />

      {/* ───── CORPS ───── */}
      <div style={{ background: "#333699", position: "relative" }}>
        {/* ───── HERO ───── */}
        <section style={{ textAlign: "center", padding: "72px 24px 56px", position: "relative", zIndex: 1 }}>
          <h2
            style={{
              color: "#fff",
              fontWeight: 500,
              fontSize: "clamp(1.8rem, 5vw, 3rem)",
              lineHeight: 1.15,
              margin: "0 auto 28px",
            }}
          >
            {lang === "fr" ? (
              <>{t.heroTitle} <span style={{ color: "#fbbf24" }}>SoulTrack</span></>
            ) : (
              <>{t.heroTitle} <span style={{ color: "#fbbf24" }}>SoulTrack</span> {t.heroTitleSuffix}</>
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
              color: "rgba(255,255,255,0.85)",
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
            <span style={{ color: "rgba(255,255,255,0.95)" }}>{t.heroPara2}</span>
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
                    fontSize: "20px",
                    fontWeight: 600,
                    color: "#fff",
                  }}
                >
                  {numerals[mIndex]}
                  <span style={{ position: "absolute", bottom: "-4px", right: "-4px", fontSize: "13px" }}></span>
                </div>
              </div>

              {/* Colonne contenu */}
              <div>
                <div style={{ display: "flex", alignItems: "baseline", gap: "10px", marginBottom: "8px", flexWrap: "wrap" }}>
                  <span style={{ fontSize: "20px" }}>{module.emoji}</span>
                  <h3
                    style={{
                      fontWeight: 600,
                      fontSize: "clamp(1.25rem, 3vw, 1.6rem)",
                      color: "#fff",
                      margin: 0,
                    }}
                  >
                    {module.title}
                  </h3>
                </div>

                <p
                  style={{
                    color: "rgba(255,255,255,0.6)",
                    fontSize: "13.5px",
                    lineHeight: 1.75,
                    margin: "0 0 22px",
                    maxWidth: "540px",
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
                      <span style={{ fontSize: "18px", flexShrink: 0 }}>{step.icon}</span>
                        <div>
                          <div style={{ color: "#fff", fontWeight: 600, fontSize: "14.5px", marginBottom: "2px" }}>
                            {step.title}
                          </div>
                        <div style={{ color: "rgba(255,255,255,0.78)", fontSize: "12.5px", lineHeight: 1.6 }}>
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

        {/* ───── PLUS DE FONCTIONNALITÉS ───── */}
        <div
          style={{
            textAlign: "center",
            padding: "0px 24px 30px",
            position: "relative",
            zIndex: 1,
            marginTop: "-70px",
          }}
        >
          <p
            style={{
              color: "#fbbf24",
              fontSize: "15px",
              fontWeight: 500,
              fontStyle: "italic",
              maxWidth: "540px",
              margin: "0 auto",
              lineHeight: 1.7,
            }}
          >
            {t.moreFeatures}
          </p>
        </div>
      </div>

      {/* ───── FOOTER (inchangé) ───── */}
      <footer
        style={{
          borderTop: "0.5px solid rgba(255,255,255,0.1)",
          padding: "20px 24px",
          boxSizing: "border-box",
          width: "100%",
          background: "#333699",
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
            <span onClick={() => router.push("/terms")} style={{ cursor: "pointer", textDecoration: "underline" }}>Terms</span>
            <span onClick={() => router.push("/privacy")} style={{ cursor: "pointer", textDecoration: "underline" }}>Privacy</span>
            <span onClick={() => router.push("/refund")} style={{ cursor: "pointer", textDecoration: "underline" }}>Refund</span>
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
