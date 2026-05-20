"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { useLang } from "../../hooks/useLang";

import { Great_Vibes } from "next/font/google";
const greatVibes = Great_Vibes({ subsets: ["latin"], weight: "400" });

// ─── DICTIONNAIRE ────────────────────────────────────────────────────────────
const translations = {
  fr: {
    login: "Connexion",
    signup: "Créer mon église",
    nav: [
      { label: "Accueil", path: "/site/HomePage" },
      { label: "Fonctionnement", path: "/site/Fonctionnement" },
      { label: "À propos", path: "/site/about" },
      { label: "Pricing", path: "/site/pricing" },
      { label: "Contact", path: "/site/contact" },
    ],
    heroPara: `Chaque module sert un même chemin : suivre la présence, former les membres, accompagner les baptisés, engager chacun dans le service, répondre aux besoins et veiller d'abord sur la croissance personnelle de chaque vie, puis sur celle de l'église dans son ensemble. Rien ici n'est de simples données, mais des vies confiées à notre soin.`,
    heroPara2: `Que chaque âme soit gagnée, restaurée, bien entourée, enracinée dans la Parole et transformée en un disciple fidèle et accompli dans la maison de Dieu.`,
    heroTitle: "Comment fonctionne",
    footer: "Tous droits réservés.",
    modules: [
      {
        title: "Espace Membres",
        emoji: "🧭",
        accent: "rgba(55,138,221,0.6)",
        accentSolid: "rgba(55,138,221,0.25)",
        steps: [
          { icon: "➕", title: "Nouveau Membre", desc: "Créer ou importer un nouveau membre avec ses informations essentielles pour l'intégrer dans la base." },
          { icon: "🏛️", title: "Liste des Membres", desc: "Accéder instantanément à tous les membres enregistrés, chacun disposant d'une carte dédiée avec ses informations, pour une vue claire, structurée et facile à exploiter." },
          { icon: "👤", title: "Affectation", desc: "Associer un membre à un conseiller ou une cellule pour faciliter un suivi plus structuré et personnalisé, selon l'organisation de votre église." },
          { icon: "💌", title: "Suivis", desc: "Enregistrer les interactions, commentaires et l'évolution du membre dans le temps." },
          { icon: "📊", title: "Rapport", desc: "Analyser les données pour suivre la croissance, l'activité et l'efficacité du suivi." },
        ],
      },
      {
        title: "Espace Évangélisation",
        emoji: "✝️",
        accent: "rgba(29,158,117,0.6)",
        accentSolid: "rgba(29,158,117,0.25)",
        steps: [
          { icon: "➕", title: "Nouveau contact", desc: "Créer et centraliser toutes les nouvelles données afin de constituer une base structurée et exploitable." },
          { icon: "🌿", title: "Liste des Évangélisées", desc: "Accéder à une vue claire et structurée de toutes les informations avec une classification automatique." },
          { icon: "💗", title: "Suivis", desc: "Enregistrer les échanges, commentaires et évolutions pour garantir un accompagnement continu et un historique complet." },
          { icon: "💧", title: "Baptême", desc: "Enregistrer les étapes spirituelles." },
          { icon: "📊", title: "Rapport", desc: "Suivre les performances globales à travers des indicateurs et rapports pour mesurer l'impact et optimiser les actions." },
        ],
      },
      {
        title: "Espace Cellules",
        emoji: "🏠",
        accent: "rgba(93,202,165,0.6)",
        accentSolid: "rgba(93,202,165,0.25)",
        steps: [
          { icon: "🏠", title: "Liste des Cellules", desc: "Créer, organiser et suivre les cellules afin d'assurer une structure claire, une croissance équilibrée et un encadrement efficace des membres." },
          { icon: "💌", title: "Suivi des Âmes", desc: "Suivre l'évolution des personnes depuis leur premier contact jusqu'à leur intégration dans l'église." },
          { icon: "👤", title: "Responsable", desc: "Gérer les responsables de cellules et d'équipes afin d'assurer une répartition claire des rôles et un leadership efficace." },
          { icon: "🌱", title: "Intégration", desc: "Accompagner les nouveaux venus dans leur parcours d'intégration à l'église jusqu'à leur enracinement dans une cellule active." },
          { icon: "📊", title: "Croissance", desc: "Analyser l'évolution globale des membres, des cellules et des conversions pour orienter les décisions stratégiques." },
        ],
      },
      {
        title: "Espace Conseiller",
        emoji: "🤝",
        accent: "rgba(239,159,39,0.55)",
        accentSolid: "rgba(239,159,39,0.22)",
        steps: [
          { icon: "🏛️", title: "Mes membres", desc: "Centraliser tous les membres de l'église avec leurs informations complètes afin d'avoir une vue globale et structurée de la communauté." },
          { icon: "💗", title: "Suivis", desc: "Assurer un accompagnement régulier des membres pour renforcer la proximité, identifier les besoins et favoriser leur croissance spirituelle." },
          { icon: "🌱", title: "Évolution des Âmes", desc: "Analyser la progression des personnes accompagnées afin de suivre leur croissance spirituelle." },
          { icon: "🎯", title: "Parcours Spirituel", desc: "Définir et structurer les étapes de croissance des personnes, depuis leur premier contact jusqu'à leur maturité spirituelle." },
          { icon: "📊", title: "Rapports", desc: "Suivre et analyser les données globales des personnes accompagnées afin d'évaluer l'impact du suivi pastoral." },
        ],
      },
      {
        title: "Espace Rapports",
        emoji: "📉",
        accent: "rgba(127,119,221,0.6)",
        accentSolid: "rgba(127,119,221,0.25)",
        steps: [
          { icon: "⛪", title: "Affluence", desc: "Suivi des présences aux cultes : hommes, femmes, jeunes, enfants, connectés et nouveaux venus." },
          { icon: "✒️", title: "Formations", desc: "Analyse des formations organisées : participation et évolution de la croissance spirituelle." },
          { icon: "💧", title: "Baptême", desc: "Suivi des baptêmes réalisés. Mesure les décisions publiques de foi et la croissance des nouveaux disciples." },
          { icon: "💢", title: "Ministère", desc: "État des serviteurs engagés par ministère. Permet de voir la répartition, l'implication et la dynamique du service." },
          { icon: "❓", title: "Besoins", desc: "Identification des besoins spirituels et personnels des membres de l'église pour apporter un accompagnement adapté." },
          { icon: "📊", title: "Vue d'ensemble", desc: "Vue d'ensemble complète de l'église : croissance, engagement, structures et impact spirituel." },
        ],
      },
    ],
  },
  en: {
    login: "Log in",
    signup: "Create my church",
    nav: [
      { label: "Home", path: "/site/HomePage" },
      { label: "How it works", path: "/site/Fonctionnement" },
      { label: "About", path: "/site/about" },
      { label: "Pricing", path: "/site/pricing" },
      { label: "Contact", path: "/site/contact" },
    ],
    heroPara: `Every module serves the same journey: tracking attendance, training members, accompanying the baptised, engaging each person in service, responding to needs and watching first over the personal growth of each life, then over the church as a whole. Nothing here is mere data — these are lives entrusted to our care.`,
    heroPara2: `May every soul be won, restored, well surrounded, rooted in the Word and transformed into a faithful and fulfilled disciple in the house of God.`,
    heroTitle: "How",
    heroTitleSuffix: "works",
    footer: "All rights reserved.",
    modules: [
      {
        title: "Members Space",
        emoji: "🧭",
        accent: "rgba(55,138,221,0.6)",
        accentSolid: "rgba(55,138,221,0.25)",
        steps: [
          { icon: "➕", title: "New Member", desc: "Create or import a new member with their essential information to integrate them into the database." },
          { icon: "🏛️", title: "Members List", desc: "Instantly access all registered members, each with a dedicated card containing their information, for a clear and structured view." },
          { icon: "👤", title: "Assignment", desc: "Associate a member with a counselor or cell group to facilitate more structured and personalised follow-up." },
          { icon: "💌", title: "Follow-ups", desc: "Record interactions, comments and the member's progress over time." },
          { icon: "📊", title: "Report", desc: "Analyse data to track growth, activity and the effectiveness of follow-up." },
        ],
      },
      {
        title: "Evangelism Space",
        emoji: "✝️",
        accent: "rgba(29,158,117,0.6)",
        accentSolid: "rgba(29,158,117,0.25)",
        steps: [
          { icon: "➕", title: "New Contact", desc: "Create and centralise all new data to build a structured and usable database." },
          { icon: "🌿", title: "Evangelised List", desc: "Access a clear and structured view of all information with automatic classification." },
          { icon: "💗", title: "Follow-ups", desc: "Record exchanges, comments and progress to ensure continuous support and a complete history." },
          { icon: "💧", title: "Baptism", desc: "Record spiritual milestones." },
          { icon: "📊", title: "Report", desc: "Track overall performance through indicators and reports to measure impact and optimise actions." },
        ],
      },
      {
        title: "Cell Groups Space",
        emoji: "🏠",
        accent: "rgba(93,202,165,0.6)",
        accentSolid: "rgba(93,202,165,0.25)",
        steps: [
          { icon: "🏠", title: "Cell Groups List", desc: "Create, organise and track cell groups to ensure a clear structure, balanced growth and effective member oversight." },
          { icon: "💌", title: "Soul Follow-up", desc: "Track people's journey from their first contact through to full integration into the church." },
          { icon: "👤", title: "Leader", desc: "Manage cell and team leaders to ensure clear role distribution and effective on-the-ground leadership." },
          { icon: "🌱", title: "Integration", desc: "Guide newcomers through their integration journey until they are rooted in an active cell group." },
          { icon: "📊", title: "Growth", desc: "Analyse the overall evolution of members, cells and conversions to guide strategic decisions." },
        ],
      },
      {
        title: "Counselor Space",
        emoji: "🤝",
        accent: "rgba(239,159,39,0.55)",
        accentSolid: "rgba(239,159,39,0.22)",
        steps: [
          { icon: "🏛️", title: "My Members", desc: "Centralise all church members with their complete information for a global and structured view of the community." },
          { icon: "💗", title: "Follow-ups", desc: "Provide regular support to members to strengthen connection, identify needs and foster their spiritual growth." },
          { icon: "🌱", title: "Soul Progress", desc: "Analyse the progression of those being accompanied to track their spiritual growth." },
          { icon: "🎯", title: "Spiritual Journey", desc: "Define and structure growth stages for individuals, from first contact to spiritual maturity." },
          { icon: "📊", title: "Reports", desc: "Track and analyse overall data on those being accompanied to evaluate the impact of pastoral care." },
        ],
      },
      {
        title: "Reports Space",
        emoji: "📉",
        accent: "rgba(127,119,221,0.6)",
        accentSolid: "rgba(127,119,221,0.25)",
        steps: [
          { icon: "⛪", title: "Attendance", desc: "Track service attendance: men, women, youth, children, online and newcomers." },
          { icon: "✒️", title: "Training", desc: "Analysis of organised training: participation and spiritual growth through teaching and equipping members." },
          { icon: "💧", title: "Baptism", desc: "Track baptisms performed. Measures public decisions of faith and the growth of new disciples." },
          { icon: "💢", title: "Ministry", desc: "Status of servants engaged by ministry. Shows distribution, involvement and service dynamics." },
          { icon: "❓", title: "Needs", desc: "Identify spiritual and personal needs of church members to provide tailored support." },
          { icon: "📊", title: "Overview", desc: "Complete church overview: growth, engagement, structures and spiritual impact. A central dashboard for the whole vision." },
        ],
      },
    ],
  },
};

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
  const [active, setActive] = useState(null);
  const { lang, changeLang } = useLang();

  const t = translations[lang];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div style={{ background: "#333699", minHeight: "100vh", position: "relative",overflowX: "hidden" }}>

      {/* GLOW 1 */}
      <div style={{
        position: "absolute", width: "800px", height: "800px", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(255,255,255,0.13) 0%, rgba(255,255,255,0.04) 40%, transparent 65%)",
        top: "80px", left: "50%", transform: "translateX(-50%)",
        pointerEvents: "none", zIndex: 0,
      }} />

      {/* GLOW 2 */}
      <div style={{
        position: "absolute", width: "600px", height: "600px", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(251,191,36,0.07) 0%, transparent 65%)",
        top: "900px", left: "50%", transform: "translateX(-50%)",
        pointerEvents: "none", zIndex: 0,
      }} />

      {/* ───── HEADER ───── */}
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
            maxWidth: "1100px",
            margin: "0 auto",
            padding: "22px 24px",
            height: "88px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
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
            <Image src="/logo.png" alt="SoulTrack" width={50} height={50} />
            <span
              style={{
                color: "#fff",
                fontSize: "22px",
                fontWeight: 500,
                fontFamily: "'Great Vibes', cursive",
              }}
            >
              SoulTrack
            </span>
          </div>

          {/* NAV */}
          <nav
            style={{
              display: "flex",
              alignItems: "center",
              gap: "32px",
              zIndex: 1,
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
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = "#fff")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color =
                    pathname === item.path ? "#fbbf24" : "#fff")
                }
                className="nav-hide"
              >
                {item.label}
              </span>
            ))}
          </nav>

          {/* BOUTONS + SWITCHER LANGUE */}
          <div
            style={{
              display: "flex",
              gap: "10px",
              alignItems: "center",
              zIndex: 1,
              flexShrink: 0,
            }}
            className="nav-hide"
          >
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
              }}
            >
              {t.signup}
            </button>
          </div>

          {/* Switcher langue */}
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <button onClick={() => changeLang("fr")} title="Français" style={{ background: "none", border: "none", cursor: "pointer", padding: 0, opacity: lang === "fr" ? 1 : 0.45, transition: "opacity 0.2s" }}>
              <img src="https://flagcdn.com/w40/fr.png" srcSet="https://flagcdn.com/w80/fr.png 2x" width="32" height="22" alt="Français" style={{ display: "block", borderRadius: "3px" }} />
            </button>
            <button onClick={() => changeLang("en")} title="English" style={{ background: "none", border: "none", cursor: "pointer", padding: 0, opacity: lang === "en" ? 1 : 0.45, transition: "opacity 0.2s" }}>
              <img src="https://flagcdn.com/w40/gb.png" srcSet="https://flagcdn.com/w80/gb.png 2x" width="32" height="22" alt="English" style={{ display: "block", borderRadius: "3px" }} />
            </button>
          </div>

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

            {/* Switcher langue dans le menu mobile */}
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <button onClick={() => setLang("fr")} title="Français" style={langBtnStyle(lang === "fr")}>
                <img src="https://flagcdn.com/w20/fr.png" srcSet="https://flagcdn.com/w40/fr.png 2x" width="20" height="14" alt="Français" style={{ display: "block", borderRadius: "2px" }} />
              </button>
              <button onClick={() => setLang("en")} title="English" style={langBtnStyle(lang === "en")}>
                <img src="https://flagcdn.com/w20/gb.png" srcSet="https://flagcdn.com/w40/gb.png 2x" width="20" height="14" alt="English" style={{ display: "block", borderRadius: "2px" }} />
              </button>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                marginTop: "4px",
              }}
            >
              <button
                onClick={() => router.push("/login")}
                style={{
                  background: "transparent",
                  color: "#fff",
                  border: "0.5px solid rgba(255,255,255,0.35)",
                  padding: "11px",
                  borderRadius: "8px",
                  fontSize: "14px",
                  cursor: "pointer",
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
                  padding: "11px",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {t.signup}
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ───── HERO ───── */}
      <section style={{ textAlign: "center", padding: "60px 24px 40px",  zIndex: 1 }}>
        <p style={{
          color: "rgba(255,255,255,0.85)", fontSize: "clamp(0.9rem, 1.8vw, 1.05rem)",
          lineHeight: 1.8, maxWidth: "680px", margin: "0 auto 28px", fontWeight: 400,
        }}>
          {t.heroPara}
          <br /><br />
          {t.heroPara2}
        </p>

        <h2 style={{ color: "#fff", fontSize: "clamp(1.4rem, 3.5vw, 2.2rem)", fontWeight: 500, lineHeight: 1.2, margin: "0 auto" }}>
          {lang === "fr" ? (
            <>Comment fonctionne <span style={{ color: "#fbbf24" }}>SoulTrack</span></>
          ) : (
            <>How <span style={{ color: "#fbbf24" }}>SoulTrack</span> works</>
          )}
        </h2>
      </section>

      {/* ───── MODULES ───── */}
      {t.modules.map((module, mIndex) => (
        <section key={mIndex} style={{ padding: "24px 24px 36px", position: "relative", zIndex: 1 }}>

          {/* MODULE TITLE */}
          <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: "16px", marginBottom: "40px" }}>
            <div style={{
              width: "55px", height: "55px", fontSize: "29px", borderRadius: "50%",
              background: module.accentSolid,
              boxShadow: `0 0 32px 8px ${module.accent}`,
              border: `0.5px solid ${module.accent}`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {module.emoji}
            </div>
            <h2 style={{ color: "#fff", fontSize: "clamp(1.2rem, 3vw, 1.6rem)", fontWeight: 500, lineHeight: 1.2, margin: 0 }}>
              {module.title}
            </h2>
          </div>

          {/* STEPS */}
          <div style={{ position: "relative", maxWidth: "1050px", margin: "0 auto" }}>
            <div className="connector-line" style={{
              position: "absolute", top: "36px", left: "10%", right: "10%", height: "1.5px",
              background: `linear-gradient(90deg, transparent, ${module.accent}, transparent)`,
              zIndex: 0,
            }} />

            {/* Grid: sur desktop N colonnes égales, sur mobile 2 colonnes */}
            <div
              className="steps-grid"
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${module.steps.length}, 1fr)`,
                gap: "8px",
              }}
            >
              {module.steps.map((step, i) => {
                const isActive = active === `${mIndex}-${i}`;
                return (
                  <div
                    key={i}
                    onMouseEnter={() => setActive(`${mIndex}-${i}`)}
                    onMouseLeave={() => setActive(null)}
                    style={{
                      display: "flex", flexDirection: "column", alignItems: "center",
                      textAlign: "center",
                      transition: "transform 0.25s",
                      transform: isActive ? "translateY(-6px)" : "translateY(0)",
                    }}
                  >
                    <div style={{
                      width: isActive ? "72px" : "62px", height: isActive ? "72px" : "62px",
                      borderRadius: "50%",
                      background: isActive ? module.accentSolid : "rgba(255,255,255,0.08)",
                      border: `1.5px solid ${isActive ? module.accent : "rgba(255,255,255,0.2)"}`,
                      boxShadow: isActive ? `0 0 20px 4px ${module.accent}` : "none",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "22px", marginBottom: "12px", transition: "all 0.25s",
                      position: "relative", zIndex: 2, backdropFilter: "blur(8px)",
                    }}>
                      {step.icon}
                    </div>

                    <div style={{
                      color: module.accent.replace("0.6", "1").replace("0.55", "1"),
                      fontSize: "13px", fontWeight: 600, marginBottom: "6px",
                    }}>
                      {step.title}
                    </div>

                    <div style={{ color: "#fff", fontSize: "12px", lineHeight: 1.5 }}>
                      {step.desc}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      ))}

      "use client";
import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import supabase from "../../lib/supabaseClient";
import { useLang } from "../../hooks/useLang";

import { Great_Vibes } from "next/font/google";
const greatVibes = Great_Vibes({
  subsets: ["latin"],
  weight: "400",
});

const translations = {
  fr: {
    tagline:
      "Prendre soin d'une église, c'est veiller sur chaque âme avec attention, discernement et fidélité, afin qu'aucune ne se perde en chemin.",
    heroTitle: "Pilotez votre église avec",
    heroHighlight: "clarté",
    heroTitleEnd: "et précision",
    heroSub:
      "Connecte toutes les dimensions de votre ministère pour transformer des données dispersées en une vision claire et actionnable.",
    howItWorks: "Voir comment ça marche",
    modulesLabel:
      "Chaque espace a été conçu pour aider le berger à voir, comprendre et accompagner son troupeau avec sagesse, amour et vision.",
    modulesTitle: "Une structure complète pour accompagner chaque âme",
    testimonialsTitle: "Ce que disent les responsables",
    ctaTitle: "Commencez dès aujourd'hui",
    ctaSub:
      "SoulTrack vous donne une vision vivante et stratégique pour guider votre église avec précision.",
    ctaBtn: "Démarrer SoulTrack →",
    login: "Connexion",
    signup: "Créer mon église",
    nav: [
      { label: "Accueil", path: "/site/HomePage" },
      { label: "Fonctionnement", path: "/site/Fonctionnement" },
      { label: "À propos", path: "/site/about" },
      { label: "Pricing", path: "/site/pricing" },
      { label: "Contact", path: "/site/contact" },
    ],
    features: [
      {
        icon: "🧭",
        title: "Membres Hub",
        desc: "Une vue centralisée de chaque membre pour suivre son parcours, son engagement et son évolution. Toutes les informations essentielles sont regroupées pour garder une vision claire du troupeau et agir au bon moment.",
        accent: "rgba(55,138,221,0.5)",
      },
      {
        icon: "✝️",
        title: "Évangélisation Hub",
        desc: "Regroupe les nouvelles âmes, les décisions, les suivis et les baptêmes. Permet de ne laisser aucun contact sans accompagnement et d'assurer une progression spirituelle structurée.",
        accent: "rgba(127,119,221,0.5)",
      },
      {
        icon: "🏠",
        title: "Cellules Hub",
        desc: "Organise les groupes, les responsables et les présences hebdomadaires. Donne une vision vivante de la dynamique des cellules et aide à maintenir la connexion et la croissance.",
        accent: "rgba(29,158,117,0.45)",
      },
      {
        icon: "🤝",
        title: "Conseillers Hub",
        desc: "Offre un suivi personnalisé par responsable. Chaque conseiller peut accompagner, noter, discerner les besoins et intervenir de manière ciblée sur les membres qui lui sont confiés.",
        accent: "rgba(239,159,39,0.4)",
      },
      {
        icon: "📊",
        title: "Rapports Hub",
        desc: "Analyse toutes les données du ministère pour en ressortir des indicateurs clairs. Aide à prendre des décisions stratégiques basées sur des faits concrets et mesurables.",
        accent: "rgba(93,202,165,0.45)",
      },
      {
        icon: "⚙️",
        title: "Admin Hub",
        desc: "Pilote l'ensemble de la structure : gestion des accès, organisation interne et configuration de l'église. Assure une base solide, cohérente et alignée pour tout le système.",
        accent: "rgba(212,83,126,0.4)",
      },
    ],
    footer: "Tous droits réservés.",
  },
  en: {
    tagline:
      "Caring for a church means watching over every soul with attention, discernment and faithfulness, so that none is ever lost along the way.",
    heroTitle: "Lead your church with",
    heroHighlight: "clarity",
    heroTitleEnd: "and precision",
    heroSub:
      "Connects every dimension of your ministry to turn scattered data into a clear, actionable vision.",
    howItWorks: "See how it works",
    modulesLabel:
      "Every space was designed to help the shepherd see, understand and guide their flock with wisdom, love and vision.",
    modulesTitle: "A complete structure to accompany every soul",
    testimonialsTitle: "What leaders are saying",
    ctaTitle: "Get started today",
    ctaSub:
      "SoulTrack gives you a living, strategic vision to lead your church with precision.",
    ctaBtn: "Start SoulTrack →",
    login: "Log in",
    signup: "Create my church",
    nav: [
      { label: "Home", path: "/site/HomePage" },
      { label: "How it works", path: "/site/Fonctionnement" },
      { label: "About", path: "/site/about" },
      { label: "Pricing", path: "/site/pricing" },
      { label: "Contact", path: "/site/contact" },
    ],
    features: [
      {
        icon: "🧭",
        title: "Members Hub",
        desc: "A centralized view of every member to track their journey, engagement and growth. All key information is gathered in one place to keep a clear vision of the flock and act at the right moment.",
        accent: "rgba(55,138,221,0.5)",
      },
      {
        icon: "✝️",
        title: "Evangelism Hub",
        desc: "Brings together new souls, decisions, follow-ups and baptisms. Ensures no contact goes without support and provides a structured path for spiritual growth.",
        accent: "rgba(127,119,221,0.5)",
      },
      {
        icon: "🏠",
        title: "Cell Groups Hub",
        desc: "Organises groups, leaders and weekly attendance. Provides a living picture of cell dynamics and helps maintain connection and growth.",
        accent: "rgba(29,158,117,0.45)",
      },
      {
        icon: "🤝",
        title: "Counselors Hub",
        desc: "Offers personalised follow-up per leader. Each counselor can accompany, note, discern needs and intervene in a targeted way with the members entrusted to them.",
        accent: "rgba(239,159,39,0.4)",
      },
      {
        icon: "📊",
        title: "Reports Hub",
        desc: "Analyses all ministry data to surface clear indicators. Helps make strategic decisions based on concrete, measurable facts.",
        accent: "rgba(93,202,165,0.45)",
      },
      {
        icon: "⚙️",
        title: "Admin Hub",
        desc: "Drives the entire structure: access management, internal organisation and church configuration. Provides a solid, coherent and aligned foundation for the whole system.",
        accent: "rgba(212,83,126,0.4)",
      },
    ],
    footer: "All rights reserved.",
  },
};

export default function HomePage() {
  const router = useRouter();
  const [openMenu, setOpenMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const fadeRefs = useRef([]);
  const pathname = usePathname();
  const { lang, changeLang } = useLang();
  const [testimonials, setTestimonials] = useState([]);

  const t = translations[lang];

  // ── Carousel ──────────────────────────────────────────────────────────────
  const CARD_WIDTH = 280;
  const GAP = 16;
  const STEP = CARD_WIDTH + GAP;

  // On triple le tableau pour avoir assez de marge des deux côtés
  const looped = testimonials.length
    ? [...testimonials, ...testimonials, ...testimonials]
    : [];

  // On démarre au milieu de la copie centrale
  const startIndex = testimonials.length; // index de la première carte de la copie du milieu
  const [tIndex, setTIndex] = useState(startIndex);
  const trackRef = useRef(null);
  const isJumping = useRef(false);
  const intervalRef = useRef(null);

  // ── Scroll + fade ─────────────────────────────────────────────────────────
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    fadeRefs.current.forEach((el) => {
      if (!el) return;
      el.style.opacity = "0";
      el.style.transform = "translateY(24px)";
      el.style.transition = "opacity 0.55s ease, transform 0.55s ease";
    });
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.style.opacity = "1";
            e.target.style.transform = "translateY(0)";
          }
        });
      },
      { threshold: 0.1 }
    );
    fadeRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // ── Témoignages fetch ─────────────────────────────────────────────────────
  useEffect(() => {
    const fetchTestimonials = async () => {
      const { data, error } = await supabase
        .from("contact")
        .select("*")
        .eq("type", "temoignage")
        .eq("status", "approved")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Erreur témoignages:", error);
        return;
      }

      const formatted = data.map((item) => ({
        id: item.id,
        title: item.titre || "",
        name: item.nom,
        church: item.nom_eglise,
        message: item.message,
        note: item.note || 5,
      }));

      setTestimonials(formatted);
    };

    fetchTestimonials();
  }, []);

  // Recentre l'index quand les témoignages sont chargés
  useEffect(() => {
    if (testimonials.length > 0) {
      setTIndex(testimonials.length);
    }
  }, [testimonials.length]);

  // ── Auto-défilement infini sans saut visible ──────────────────────────────
  useEffect(() => {
    if (testimonials.length === 0) return;

    intervalRef.current = setInterval(() => {
      if (isJumping.current) return;
      setTIndex((prev) => prev + 1);
    }, 3000);

    return () => clearInterval(intervalRef.current);
  }, [testimonials.length]);

  // Quand on atteint la fin de la 3e copie → jump invisible vers la copie du milieu
  useEffect(() => {
    if (testimonials.length === 0) return;
    const total = looped.length; // testimonials.length * 3

    if (tIndex >= total - testimonials.length) {
      // On attend la fin de la transition CSS (700ms) puis on saute sans animation
      isJumping.current = true;
      setTimeout(() => {
        if (trackRef.current) {
          trackRef.current.style.transition = "none";
        }
        setTIndex(testimonials.length); // retour silencieux au début de la copie centrale
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            if (trackRef.current) {
              trackRef.current.style.transition = "transform 700ms ease-in-out";
            }
            isJumping.current = false;
          });
        });
      }, 700);
    }
  }, [tIndex, testimonials.length, looped.length]);

  const addRef = (el) => {
    if (el && !fadeRefs.current.includes(el)) fadeRefs.current.push(el);
  };

  const renderStars = (note = 5) => "⭐".repeat(note);

  // index réel dans le tableau original (pour les dots)
  const realIndex = testimonials.length > 0 ? tIndex % testimonials.length : 0;

  return (
    <div
      style={{
        background: "#333699",
        minHeight: "100vh",
        position: "relative",
        overflowX: "hidden",
      }}
    >
      {/* GLOW 1 */}
      <div
        style={{
          position: "absolute",
          width: "min(800px, 100vw)",
          height: "min(800px, 100vw)",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(255,255,255,0.13) 0%, rgba(255,255,255,0.04) 40%, transparent 65%)",
          top: "80px",
          left: "50%",
          transform: "translateX(-50%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* GLOW 2 */}
      <div
        style={{
          position: "absolute",
          width: "min(700px, 100vw)",
          height: "min(700px, 100vw)",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(251,191,36,0.08) 0%, rgba(255,255,255,0.03) 40%, transparent 65%)",
          top: "900px",
          left: "50%",
          transform: "translateX(-50%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* ───── HEADER ───── */}
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
          width: "100%",
        }}
      >
        <div
          style={{
            maxWidth: "1100px",
            margin: "0 auto",
            padding: "22px 24px",
            height: "88px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "10px",
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
            <Image src="/logo.png" alt="SoulTrack" width={50} height={50} />
            <span
              style={{
                color: "#fff",
                fontSize: "22px",
                fontWeight: 500,
                fontFamily: "'Great Vibes', cursive",
              }}
            >
              SoulTrack
            </span>
          </div>

          {/* NAV desktop */}
          <nav
            style={{
              display: "flex",
              alignItems: "center",
              gap: "32px",
              zIndex: 1,
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
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color =
                    pathname === item.path ? "#fbbf24" : "#fff")
                }
                className="nav-hide"
              >
                {item.label}
              </span>
            ))}
          </nav>

          {/* BOUTONS + LANGUE desktop */}
          <div
            style={{
              display: "flex",
              gap: "10px",
              alignItems: "center",
              zIndex: 1,
              flexShrink: 0,
            }}
            className="nav-hide"
          >
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
              }}
            >
              {t.signup}
            </button>
          </div>

          {/* Switcher langue desktop */}
          <div
            style={{
              display: "flex",
              gap: "8px",
              alignItems: "center",
              marginLeft: "8px",
            }}
          >
            <button
              onClick={() => changeLang("fr")}
              title="Français"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
                opacity: lang === "fr" ? 1 : 0.45,
                transition: "opacity 0.2s",
              }}
            >
              <img
                src="https://flagcdn.com/w40/fr.png"
                srcSet="https://flagcdn.com/w80/fr.png 2x"
                width="32"
                height="22"
                alt="Français"
                style={{ display: "block", borderRadius: "3px" }}
              />
            </button>
            <button
              onClick={() => changeLang("en")}
              title="English"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
                opacity: lang === "en" ? 1 : 0.45,
                transition: "opacity 0.2s",
              }}
            >
              <img
                src="https://flagcdn.com/w40/gb.png"
                srcSet="https://flagcdn.com/w80/gb.png 2x"
                width="32"
                height="22"
                alt="English"
                style={{ display: "block", borderRadius: "3px" }}
              />
            </button>
          </div>

          {/* HAMBURGER mobile */}
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

            {/* Switcher langue mobile */}
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <button
                onClick={() => changeLang("fr")}
                title="Français"
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  opacity: lang === "fr" ? 1 : 0.45,
                }}
              >
                <img
                  src="https://flagcdn.com/w20/fr.png"
                  srcSet="https://flagcdn.com/w40/fr.png 2x"
                  width="20"
                  height="14"
                  alt="Français"
                  style={{ display: "block", borderRadius: "2px" }}
                />
              </button>
              <button
                onClick={() => changeLang("en")}
                title="English"
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  opacity: lang === "en" ? 1 : 0.45,
                }}
              >
                <img
                  src="https://flagcdn.com/w20/gb.png"
                  srcSet="https://flagcdn.com/w40/gb.png 2x"
                  width="20"
                  height="14"
                  alt="English"
                  style={{ display: "block", borderRadius: "2px" }}
                />
              </button>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                marginTop: "4px",
              }}
            >
              <button
                onClick={() => { router.push("/login"); setOpenMenu(false); }}
                style={{
                  background: "transparent",
                  color: "#fff",
                  border: "0.5px solid rgba(255,255,255,0.35)",
                  padding: "11px",
                  borderRadius: "8px",
                  fontSize: "14px",
                  cursor: "pointer",
                }}
              >
                {t.login}
              </button>
              <button
                onClick={() => { router.push("/site/pricing"); setOpenMenu(false); }}
                style={{
                  background: "#fff",
                  color: "#333699",
                  border: "none",
                  padding: "11px",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {t.signup}
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ───── HERO ───── */}
      <section
        style={{
          minHeight: "460px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "80px max(16px, 4vw) 40px",
          position: "relative",
          zIndex: 1,
          boxSizing: "border-box",
          width: "100%",
        }}
      >
        <p
          style={{
            position: "relative",
            zIndex: 1,
            color: "#fff",
            fontSize: "16px",
            maxWidth: "500px",
            lineHeight: 1.7,
            marginBottom: "50px",
          }}
        >
          {t.tagline}
        </p>

        <h1
          style={{
            position: "relative",
            zIndex: 1,
            fontSize: "clamp(1.6rem, 5vw, 3.2rem)",
            fontWeight: 500,
            color: "#fff",
            lineHeight: 1.15,
            maxWidth: "680px",
            marginBottom: "50px",
          }}
        >
          {t.heroTitle}{" "}
          <span style={{ color: "#fbbf24" }}>{t.heroHighlight}</span>{" "}
          {t.heroTitleEnd}
        </h1>

        <p
          style={{
            position: "relative",
            zIndex: 1,
            color: "#fff",
            fontSize: "16px",
            maxWidth: "500px",
            lineHeight: 1.7,
            marginBottom: "50px",
          }}
        >
          {t.heroSub}
        </p>

        <div style={{ position: "relative", zIndex: 1, marginBottom: "5px" }}>
          <button
            onClick={() => router.push("/site/Fonctionnement")}
            style={{
              background: "transparent",
              color: "#fbbf24",
              border: "0.5px solid rgba(255,255,255,0.35)",
              padding: "2px 14px",
              borderRadius: "10px",
              fontSize: "15px",
              cursor: "pointer",
            }}
          >
            {t.howItWorks}
          </button>
        </div>
      </section>

      {/* ───── LABEL MODULES ───── */}
      <div
        ref={addRef}
        style={{
          textAlign: "center",
          padding: "20px 24px 20px",
          position: "relative",
          zIndex: 1,
          boxSizing: "border-box",
          width: "100%",
        }}
      >
        <p
          style={{
            color: "#fff",
            fontSize: "16px",
            padding: "50px 24px 20px",
            letterSpacing: "0.08em",
            maxWidth: "560px",
            margin: "0 auto 14px",
            lineHeight: 1.6,
          }}
        >
          {t.modulesLabel}
        </p>
        <h2
          style={{
            color: "#fbbf24",
            fontSize: "clamp(1.2rem, 3vw, 1.9rem)",
            fontWeight: 500,
            maxWidth: "500px",
            margin: "0 auto",
            lineHeight: 1.3,
          }}
        >
          {t.modulesTitle}
        </h2>
      </div>

      {/* ───── CARDS MODULES ───── */}
      <section
        style={{
          padding: "24px 24px 48px",
          position: "relative",
          zIndex: 1,
          boxSizing: "border-box",
          width: "100%",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(280px, 100%), 1fr))",
            gap: "16px",
            maxWidth: "1050px",
            margin: "0 auto",
          }}
        >
          {t.features.map((f, i) => (
            <div
              key={i}
              ref={addRef}
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "0.5px solid rgba(255,255,255,0.12)",
                borderRadius: "18px",
                padding: "28px 24px",
                position: "relative",
                overflow: "hidden",
                backdropFilter: "blur(8px)",
                cursor: "default",
                transition: "transform 0.25s, border-color 0.25s, background 0.25s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-5px)";
                e.currentTarget.style.background = "rgba(255,255,255,0.13)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: "-40px",
                  left: "-40px",
                  width: "180px",
                  height: "180px",
                  borderRadius: "50%",
                  background: `radial-gradient(circle, ${f.accent} 0%, transparent 70%)`,
                  pointerEvents: "none",
                  zIndex: 0,
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: "24px",
                  right: "24px",
                  height: "1px",
                  background: `linear-gradient(90deg, transparent, ${f.accent}, transparent)`,
                }}
              />
              <div style={{ position: "relative", zIndex: 1 }}>
                <span
                  style={{
                    fontSize: "24px",
                    display: "block",
                    marginBottom: "16px",
                  }}
                >
                  {f.icon}
                </span>
                <h3
                  style={{
                    color: "#fff",
                    fontSize: "15px",
                    fontWeight: 500,
                    marginBottom: "10px",
                  }}
                >
                  {f.title}
                </h3>
                <p
                  style={{
                    color: "rgba(255,255,255,0.6)",
                    fontSize: "13.5px",
                    lineHeight: 1.7,
                  }}
                >
                  {f.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ───── TÉMOIGNAGES ───── */}
      <section
        style={{
          padding: "40px 0 80px",
          position: "relative",
          zIndex: 1,
          width: "100%",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: "min(700px, 100vw)",
            height: "min(700px, 100vw)",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 65%)",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />

        <div
          ref={addRef}
          style={{
            textAlign: "center",
            marginBottom: "40px",
            position: "relative",
            zIndex: 1,
            padding: "0 24px",
          }}
        >
          <h2
            style={{
              color: "#fbbf24",
              fontSize: "clamp(1.3rem, 3vw, 2rem)",
              fontWeight: 500,
              maxWidth: "480px",
              margin: "0 auto",
              lineHeight: 1.3,
            }}
          >
            {t.testimonialsTitle}
          </h2>
        </div>

        {/* CAROUSEL */}
        <div
          style={{
            position: "relative",
            width: "100%",
            overflow: "hidden",
            zIndex: 1,
          }}
        >
          {/* Fade gauche */}
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: "80px",
              background: "linear-gradient(90deg, #333699, transparent)",
              zIndex: 2,
              pointerEvents: "none",
            }}
          />
          {/* Fade droite */}
          <div
            style={{
              position: "absolute",
              right: 0,
              top: 0,
              bottom: 0,
              width: "80px",
              background: "linear-gradient(270deg, #333699, transparent)",
              zIndex: 2,
              pointerEvents: "none",
            }}
          />

          <div
            ref={trackRef}
            style={{
              display: "flex",
              gap: `${GAP}px`,
              // Centre la carte active au milieu de l'écran
              transform: `translateX(calc(50vw - ${tIndex * STEP + CARD_WIDTH / 2}px))`,
              transition: "transform 700ms ease-in-out",
              alignItems: "center",
              padding: "24px 0",
              willChange: "transform",
            }}
          >
            {looped.map((item, i) => {
              const isCenter = i === tIndex;
              return (
                <div
                  key={i}
                  style={{
                    flexShrink: 0,
                    width: `${CARD_WIDTH}px`,
                    transition: "transform 0.5s ease, opacity 0.5s ease",
                    transform: isCenter ? "scale(1.05)" : "scale(0.9)",
                    opacity: isCenter ? 1 : 0.45,
                  }}
                >
                  <div
                    style={{
                      background: isCenter
                        ? "rgba(255,255,255,0.15)"
                        : "rgba(255,255,255,0.06)",
                      border: isCenter
                        ? "0.5px solid rgba(255,255,255,0.35)"
                        : "0.5px solid rgba(255,255,255,0.1)",
                      borderRadius: "18px",
                      padding: "28px 24px",
                      position: "relative",
                      overflow: "hidden",
                      backdropFilter: "blur(8px)",
                    }}
                  >
                    {isCenter && (
                      <div
                        style={{
                          position: "absolute",
                          top: 0,
                          left: "24px",
                          right: "24px",
                          height: "1px",
                          background:
                            "linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)",
                        }}
                      />
                    )}
                    {isCenter && (
                      <div
                        style={{
                          position: "absolute",
                          top: "-30px",
                          left: "-30px",
                          width: "140px",
                          height: "140px",
                          borderRadius: "50%",
                          background:
                            "radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)",
                          pointerEvents: "none",
                        }}
                      />
                    )}

                    <p
                      style={{
                        color: isCenter
                          ? "rgba(255,255,255,0.9)"
                          : "rgba(255,255,255,0.4)",
                        fontSize: "13px",
                        lineHeight: 1.7,
                        fontStyle: "italic",
                        textAlign: "center",
                        marginBottom: "18px",
                      }}
                    >
                      "{item.message}"
                    </p>

                    <div style={{ textAlign: "center", marginBottom: "6px" }}>
                      <div
                        style={{
                          color: "#fff",
                          fontSize: "14px",
                          fontWeight: 600,
                        }}
                      >
                        {item.title ? `${item.title} ${item.name}` : item.name}
                      </div>
                    </div>

                    <div style={{ textAlign: "center", marginBottom: "10px" }}>
                      <div style={{ color: "#FFFFFF", fontSize: "14px" }}>
                        {item.church}
                      </div>
                    </div>

                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: "14px" }}>
                        {renderStars(item.note)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* DOTS */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "8px",
            marginTop: "36px",
            position: "relative",
            zIndex: 1,
          }}
        >
          {testimonials.map((_, i) => (
            <div
              key={i}
              onClick={() => setTIndex(testimonials.length + i)}
              style={{
                width: realIndex === i ? "20px" : "6px",
                height: "6px",
                borderRadius: "3px",
                background:
                  realIndex === i ? "#fff" : "rgba(255,255,255,0.25)",
                transition: "width 0.3s ease, background 0.3s ease",
                cursor: "pointer",
              }}
            />
          ))}
        </div>
      </section>

      {/* ───── CTA ───── */}
      <section
        ref={addRef}
        style={{
          borderTop: "0.5px solid rgba(255,255,255,0.15)",
          padding: "60px 24px",
          textAlign: "center",
          position: "relative",
          zIndex: 1,
          boxSizing: "border-box",
          width: "100%",
        }}
      >
        <h2
          style={{
            color: "#fff",
            fontSize: "clamp(1.4rem, 3vw, 2.2rem)",
            fontWeight: 500,
            marginBottom: "12px",
          }}
        >
          {t.ctaTitle}
        </h2>
        <p
          style={{
            color: "rgba(255,255,255,0.6)",
            maxWidth: "400px",
            margin: "0 auto 28px",
            lineHeight: 1.7,
            fontSize: "15px",
          }}
        >
          {t.ctaSub}
        </p>
        <button
          onClick={() => router.push("/site/pricing")}
          style={{
            background: "#fff",
            color: "#fbbf24",
            border: "none",
            padding: "14px 36px",
            borderRadius: "10px",
            fontSize: "16px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          {t.ctaBtn}
        </button>
      </section>

       {/* ───── FOOTER ───── */}
      <footer style={{ borderTop: "0.5px solid rgba(255,255,255,0.1)", padding: "20px 24px" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", textAlign: "center", color: "rgba(255,255,255,0.35)", fontSize: "14px" }}>
          <div>© {new Date().getFullYear()} SoulTrack. {t.footer}</div>
          <div style={{ marginTop: "10px", display: "flex", justifyContent: "center", gap: "18px", fontSize: "13px" }}>
            <span onClick={() => router.push("/site/terms")} style={{ cursor: "pointer", textDecoration: "underline" }}>Terms</span>
            <span onClick={() => router.push("/site/privacy")} style={{ cursor: "pointer", textDecoration: "underline" }}>Privacy</span>
            <span onClick={() => router.push("/site/refund")} style={{ cursor: "pointer", textDecoration: "underline" }}>Refund</span>
          </div>
        </div>
      </footer>

      <style>{`
        html, body {
          width: 100%;
          overflow-x: hidden;
        }
        * { box-sizing: border-box; }
        img { max-width: 100%; height: auto; }
        @media (max-width: 768px) {
          .nav-hide { display: none !important; }
          .nav-show { display: flex !important; }
          header > div {
            padding: 14px 12px !important;
            height: auto !important;
          }
          header div { min-width: 0; }
        }
      `}</style>
    </div>
  );
}

      <style>{`
        body { overflow-x: hidden; }

        @media (max-width: 768px) {
          .nav-hide { display: none !important; }
          .nav-show { display: flex !important; }
          .connector-line { display: none !important; }

          /* 2 colonnes sur mobile : les 5 steps → 2+2+1 centré */
          .steps-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 24px 16px !important;
          }

          /* Dernier item seul → centré sur toute la largeur */
          .steps-grid > div:last-child:nth-child(odd) {
            grid-column: 1 / -1;
            max-width: 160px;
            margin: 0 auto;
          }
        }

        @media (max-width: 400px) {
          .steps-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 20px 10px !important;
          }
        }
      `}</style>
    </div>
  );
}
