"use client";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { useLang } from "../../hooks/useLang";

import { Great_Vibes } from "next/font/google";
const greatVibes = Great_Vibes({ subsets: ["latin"], weight: "400" });

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
    footer: "Tous droits réservés.",

    heroLabel: "À propos",
    heroTitle: "À propos de",
    heroHighlight: "SoulTrack",
    heroSub: "Parce que chaque âme a de la valeur, nous aidons les églises à structurer leur suivi pour ne laisser personne de côté.",

    introTitle: "Le constat",
    introP1: "SoulTrack est né d'un constat clair : chaque âme a de la valeur et ne doit pas être perdue.",
    introP2: "Mais à mesure que l'église grandit, le suivi devient plus complexe. Les informations se dispersent, les responsabilités se multiplient, et il devient difficile de garder une vision précise de chaque personne.",
    introP3: "C'est dans ce contexte que SoulTrack a été conçu.",

    missionTitle: "Notre mission",
    missionText: "Notre mission est d'aider les églises à structurer leur organisation afin de suivre chaque membre avec clarté, constance et fidélité.",
    missionQuote: "Nous croyons qu'un bon système ne remplace pas le cœur du berger, mais lui donne les moyens d'agir avec précision.",

    problemTitle: "Le problème",
    problemIntro: "Dans beaucoup d'églises aujourd'hui :",
    problems: [
      "Les membres ne sont pas suivis de manière régulière",
      "Les nouvelles âmes ne sont pas toujours accompagnées",
      "Les responsables manquent de visibilité",
      "Les décisions sont prises sans données claires",
    ],
    problemResult: "Résultat : certaines personnes passent inaperçues.",

    solutionTitle: "La solution",
    solutionIntro: "SoulTrack apporte une structure simple et centralisée pour :",
    solutions: [
      "Gérer les membres et leur évolution",
      "Organiser les cellules et les responsables",
      "Suivre l'évangélisation et les nouvelles âmes",
      "Donner une vision claire grâce aux rapports",
    ],
    solutionClose: "Tout est connecté pour transformer des informations dispersées en une vision claire et actionnable.",

    approachTitle: "Notre approche",
    approachSub: "SoulTrack a été pensé avec une double approche :",
    approachSpiritual: "Spirituelle",
    approachSpiritualText: "Aider le berger à connaître son troupeau et à prendre soin de chaque personne avec attention",
    approachStrategic: "Stratégique",
    approachStrategicText: "Apporter des données fiables pour guider les décisions et accompagner la croissance de manière structurée",

    valuesTitle: "Nos valeurs",
    values: [
      { emoji: "❤️", title: "Chaque personne compte", text: "Aucune âme n'est insignifiante" },
      { emoji: "🧭", title: "Clarté", text: "Voir clairement pour mieux accompagner" },
      { emoji: "🤝", title: "Responsabilité", text: "Prendre soin avec intention et suivi" },
      { emoji: "📈", title: "Croissance saine", text: "Grandir sans perdre la qualité du suivi" },
    ],

    visionTitle: "Notre vision",
    visionP1: "Nous voulons voir des églises capables de grandir sans perdre la capacité de connaître et accompagner chaque membre.",
    visionP2: "Une église où personne n'est oublié. Une église où chaque vie est suivie avec intention.",

    ctaTitle: "Prêt à structurer votre église ?",
    ctaText: "Commencez dès aujourd'hui à structurer votre église et à suivre chaque âme avec précision.",
    ctaBtn: "Créer mon église →",
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
    footer: "All rights reserved.",

    heroLabel: "About",
    heroTitle: "About",
    heroHighlight: "SoulTrack",
    heroSub: "Because every soul matters, we help churches structure their follow-up so no one is left behind.",

    introTitle: "The observation",
    introP1: "SoulTrack was born from a clear observation: every soul has value and must not be lost.",
    introP2: "But as the church grows, follow-up becomes more complex. Information scatters, responsibilities multiply, and it becomes difficult to maintain a clear picture of each person.",
    introP3: "It is in this context that SoulTrack was designed.",

    missionTitle: "Our mission",
    missionText: "Our mission is to help churches structure their organisation in order to follow each member with clarity, consistency and faithfulness.",
    missionQuote: "We believe a good system does not replace the heart of the shepherd, but gives them the means to act with precision.",

    problemTitle: "The problem",
    problemIntro: "In many churches today:",
    problems: [
      "Members are not followed up on a regular basis",
      "New souls are not always accompanied",
      "Leaders lack visibility",
      "Decisions are made without clear data",
    ],
    problemResult: "As a result: some people go unnoticed.",

    solutionTitle: "The solution",
    solutionIntro: "SoulTrack provides a simple, centralised structure to:",
    solutions: [
      "Manage members and their progress",
      "Organise cells and leaders",
      "Track evangelism and new souls",
      "Provide a clear vision through reports",
    ],
    solutionClose: "Everything is connected to transform scattered information into a clear and actionable vision.",

    approachTitle: "Our approach",
    approachSub: "SoulTrack was designed with a dual approach:",
    approachSpiritual: "Spiritual",
    approachSpiritualText: "Helping the shepherd know their flock and care for each person with attention",
    approachStrategic: "Strategic",
    approachStrategicText: "Providing reliable data to guide decisions and support growth in a structured way",

    valuesTitle: "Our values",
    values: [
      { emoji: "❤️", title: "Every person matters", text: "No soul is insignificant" },
      { emoji: "🧭", title: "Clarity", text: "See clearly to better accompany" },
      { emoji: "🤝", title: "Responsibility", text: "Care with intention and follow-through" },
      { emoji: "📈", title: "Healthy growth", text: "Grow without losing the quality of follow-up" },
    ],

    visionTitle: "Our vision",
    visionP1: "We want to see churches capable of growing without losing the ability to know and accompany each member.",
    visionP2: "A church where no one is forgotten. A church where every life is followed with intention.",

    ctaTitle: "Ready to structure your church?",
    ctaText: "Start today to structure your church and follow every soul with precision.",
    ctaBtn: "Create my church →",
  },
};

const langBtnStyle = (active) => ({
  background: "none",
  border: "none",
  cursor: "pointer",
  padding: 0,
  opacity: active ? 1 : 0.45,
  transition: "opacity 0.2s",
});

export default function AboutPage() {
  const router = useRouter();
  const [openMenu, setOpenMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { lang, changeLang } = useLang();
  const pathname = usePathname();

  const t = translations[lang];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div style={{ background: "#333699", minHeight: "100vh", position: "relative", overflowX: "hidden" }}>

      {/* GLOWS */}
      <div style={{
        position: "absolute", width: "800px", height: "800px", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(255,255,255,0.11) 0%, rgba(255,255,255,0.03) 40%, transparent 65%)",
        top: "60px", left: "50%", transform: "translateX(-50%)",
        pointerEvents: "none", zIndex: 0,
      }} />
      <div style={{
        position: "absolute", width: "600px", height: "600px", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(251,191,36,0.06) 0%, transparent 65%)",
        top: "900px", left: "20%",
        pointerEvents: "none", zIndex: 0,
      }} />
      <div style={{
        position: "absolute", width: "500px", height: "500px", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(55,138,221,0.07) 0%, transparent 65%)",
        top: "1800px", right: "10%",
        pointerEvents: "none", zIndex: 0,
      }} />

      {/* ───── HEADER ───── */}
      <header style={{
        background: scrolled ? "rgba(51,54,153,0.92)" : "transparent",
        borderBottom: scrolled ? "0.5px solid rgba(255,255,255,0.15)" : "0.5px solid transparent",
        position: "sticky", top: 0, zIndex: 100,
        backdropFilter: scrolled ? "blur(16px)" : "none",
        transition: "background 0.3s, border-color 0.3s",
      }}>
        <div style={{
          maxWidth: "1100px", margin: "0 auto", padding: "22px 24px",
          height: "88px", display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>

          {/* LOGO */}
          <div onClick={() => router.push("/site/HomePage")} style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", zIndex: 1, flexShrink: 0 }}>
            <Image src="/logo.png" alt="SoulTrack" width={50} height={50} />
            <span style={{ color: "#fff", fontSize: "22px", fontWeight: 500, fontFamily: "'Great Vibes', cursive" }}>
              SoulTrack
            </span>
          </div>

          {/* NAV desktop */}
          <nav style={{ display: "flex", alignItems: "center", gap: "32px", zIndex: 1 }}>
            {t.nav.map((item) => (
              <span key={item.path} onClick={() => router.push(item.path)}
                style={{ color: pathname === item.path ? "#fbbf24" : "#fff", fontSize: "14px", fontWeight: 600, cursor: "pointer", transition: "color 0.2s" }}
                className="nav-hide">
                {item.label}
              </span>
            ))}
          </nav>

          {/* BOUTONS desktop */}
          <div style={{ display: "flex", gap: "10px", alignItems: "center", zIndex: 1, flexShrink: 0 }} className="nav-hide">
            <button onClick={() => router.push("/login")} style={{ background: "transparent", color: "#fbbf24", border: "0.5px solid rgba(255,255,255,0.35)", padding: "7px 18px", borderRadius: "8px", fontSize: "14px", cursor: "pointer" }}>
              {t.login}
            </button>
            <button onClick={() => router.push("/site/pricing")} style={{ background: "#fff", color: "#333699", border: "none", padding: "7px 18px", borderRadius: "8px", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}>
              {t.signup}
            </button>
          </div>

          {/* Switcher langue desktop */}
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }} className="nav-hide">
            <button onClick={() => changeLang("fr")} title="Français" style={langBtnStyle(lang === "fr")}>
              <img src="https://flagcdn.com/w40/fr.png" srcSet="https://flagcdn.com/w80/fr.png 2x" width="32" height="22" alt="Français" style={{ display: "block", borderRadius: "3px" }} />
            </button>
            <button onClick={() => changeLang("en")} title="English" style={langBtnStyle(lang === "en")}>
              <img src="https://flagcdn.com/w40/gb.png" srcSet="https://flagcdn.com/w80/gb.png 2x" width="32" height="22" alt="English" style={{ display: "block", borderRadius: "3px" }} />
            </button>
          </div>

          {/* HAMBURGER */}
          <button onClick={() => setOpenMenu(!openMenu)} className="nav-show"
            style={{ background: "none", border: "none", cursor: "pointer", display: "none", flexDirection: "column", gap: "5px", padding: "4px", zIndex: 1 }}>
            {[0, 1, 2].map((i) => (
              <span key={i} style={{
                display: "block", width: "22px", height: "1.5px",
                background: "rgba(255,255,255,0.85)", borderRadius: "2px",
                transition: "transform 0.2s, opacity 0.2s",
                transform: openMenu
                  ? i === 0 ? "rotate(45deg) translate(5px, 5px)"
                  : i === 2 ? "rotate(-45deg) translate(5px, -5px)"
                  : "scaleX(0)" : "none",
                opacity: openMenu && i === 1 ? 0 : 1,
              }} />
            ))}
          </button>
        </div>

        {/* MENU MOBILE */}
        {openMenu && (
          <div style={{ background: "#333699", borderTop: "0.5px solid rgba(255,255,255,0.15)", padding: "20px 24px 28px", display: "flex", flexDirection: "column", gap: "20px" }}>
            {t.nav.map((item) => (
              <span key={item.path} onClick={() => { router.push(item.path); setOpenMenu(false); }}
                style={{ color: pathname === item.path ? "#fbbf24" : "#fff", fontSize: "15px", fontWeight: 600, cursor: "pointer" }}>
                {item.label}
              </span>
            ))}
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <button onClick={() => setLang("fr")} title="Français" style={langBtnStyle(lang === "fr")}>
                <img src="https://flagcdn.com/w20/fr.png" srcSet="https://flagcdn.com/w40/fr.png 2x" width="20" height="14" alt="Français" style={{ display: "block", borderRadius: "2px" }} />
              </button>
              <button onClick={() => setLang("en")} title="English" style={langBtnStyle(lang === "en")}>
                <img src="https://flagcdn.com/w20/gb.png" srcSet="https://flagcdn.com/w40/gb.png 2x" width="20" height="14" alt="English" style={{ display: "block", borderRadius: "2px" }} />
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "4px" }}>
              <button onClick={() => router.push("/login")} style={{ background: "transparent", color: "#fff", border: "0.5px solid rgba(255,255,255,0.35)", padding: "11px", borderRadius: "8px", fontSize: "14px", cursor: "pointer" }}>
                {t.login}
              </button>
              <button onClick={() => router.push("/site/pricing")} style={{ background: "#fff", color: "#333699", border: "none", padding: "11px", borderRadius: "8px", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}>
                {t.signup}
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ───── HERO ───── */}
      <section style={{ textAlign: "center", padding: "70px max(16px, 4vw) 60px", position: "relative", zIndex: 1 }}>       
        <h1 style={{ color: "#fff", fontSize: "clamp(2.2rem, 5vw, 3.2rem)", fontWeight: 500, lineHeight: 1.15, marginBottom: "20px" }}>
          {t.heroTitle} <span style={{ color: "#fbbf24" }}>{t.heroHighlight}</span>
        </h1>
        <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "clamp(0.95rem, 2vw, 1.05rem)", maxWidth: "560px", margin: "0 auto", lineHeight: 1.8 }}>
          {t.heroSub}
        </p>
        <div style={{ width: "40px", height: "2px", background: "#fbbf24", margin: "32px auto 0", borderRadius: "2px" }} />
      </section>

      {/* ───── INTRO ───── */}
      <section style={{ padding: "20px max(16px, 4vw) 60px", position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: "700px", margin: "0 auto" }}>
          <SectionLabel>{t.introTitle}</SectionLabel>
          <p style={bodyText}>{t.introP1}</p>
          <p style={{ ...bodyText, marginTop: "14px" }}>{t.introP2}</p>
          <p style={{ ...bodyText, marginTop: "14px", color: "#FFFFFF", fontStyle: "italic" }}>{t.introP3}</p>
        </div>
      </section>

      {/* ───── MISSION ───── */}
      <section style={{ padding: "0 max(16px, 4vw) 60px", position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: "700px", margin: "0 auto" }}>
          <SectionLabel>{t.missionTitle}</SectionLabel>
          <p style={bodyText}>{t.missionText}</p>
          <blockquote style={{
            margin: "28px 0 0",
            padding: "20px 24px",
            borderLeft: "3px solid #fbbf24",
            background: "rgba(251,191,36,0.07)",
            borderRadius: "12px",
          }}>
            <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "16px", lineHeight: 1.8, margin: 0, fontStyle: "italic" }}>
              {t.missionQuote}
            </p>
          </blockquote>
        </div>
      </section>

      {/* ───── PROBLÈME + SOLUTION (2 colonnes) ───── */}
      <section style={{ padding: "0 max(16px, 4vw) 60px", position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(300px,100%), 1fr))", gap: "24px" }}>

          {/* Problème */}
          <div style={card}>
            <div style={{ position: "absolute", top: "-30px", left: "-30px", width: "120px", height: "120px", borderRadius: "50%", background: "radial-gradient(circle, rgba(239,68,68,0.18) 0%, transparent 70%)" }} />
            <SectionLabel color="rgba(239,68,68,0.8)">{t.problemTitle}</SectionLabel>
            <p style={{ ...bodyText, marginBottom: "16px" }}>{t.problemIntro}</p>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
              {t.problems.map((p, i) => (
                <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: "10px", color: "rgba(255,255,255,0.75)", fontSize: "16px", lineHeight: 1.6 }}>
                  <span style={{ color: "rgba(239,68,68,0.7)", marginTop: "2px", flexShrink: 0 }}>✕</span>
                  {p}
                </li>
              ))}
            </ul>
            <p style={{ ...bodyText, marginTop: "20px", color: "#fbbf24", fontStyle: "italic" }}>{t.problemResult}</p>
          </div>

          {/* Solution */}
          <div style={card}>
            <div style={{ position: "absolute", top: "-30px", left: "-30px", width: "120px", height: "120px", borderRadius: "50%", background: "radial-gradient(circle, rgba(29,158,117,0.2) 0%, transparent 70%)" }} />
            <SectionLabel color="rgba(29,158,117,0.9)">{t.solutionTitle}</SectionLabel>
            <p style={{ ...bodyText, marginBottom: "16px" }}>{t.solutionIntro}</p>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
              {t.solutions.map((s, i) => (
                <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: "10px", color: "rgba(255,255,255,0.75)", fontSize: "16px", lineHeight: 1.6 }}>
                  <span style={{ color: "rgba(29,158,117,0.9)", marginTop: "2px", flexShrink: 0 }}>✓</span>
                  {s}
                </li>
              ))}
            </ul>
            <p style={{ ...bodyText, marginTop: "20px", color: "#fbbf24", fontStyle: "italic" }}>{t.solutionClose}</p>
          </div>
        </div>
      </section>

      {/* ───── APPROCHE ───── */}
      <section style={{ padding: "0 max(16px, 4vw) 60px", position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: "700px", margin: "0 auto" }}>
          <SectionLabel>{t.approachTitle}</SectionLabel>
          <p style={{ ...bodyText, marginBottom: "28px" }}>{t.approachSub}</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(240px,100%), 1fr))", gap: "16px" }}>
            {/* Spirituelle */}
            <div style={{ ...card, background: "rgba(251,191,36,0.07)", border: "0.5px solid rgba(251,191,36,0.2)" }}>
              <div style={{ fontSize: "28px", marginBottom: "10px" }}>🧭</div>
              <h3 style={{ color: "#fbbf24", fontSize: "16px", fontWeight: 600, marginBottom: "10px" }}>{t.approachSpiritual}</h3>
              <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "14px", lineHeight: 1.7, margin: 0 }}>{t.approachSpiritualText}</p>
            </div>
            {/* Stratégique */}
            <div style={{ ...card, background: "rgba(55,138,221,0.07)", border: "0.5px solid rgba(55,138,221,0.2)" }}>
              <div style={{ fontSize: "28px", marginBottom: "10px" }}>📊</div>
              <h3 style={{ color: "rgba(55,138,221,0.95)", fontSize: "16px", fontWeight: 600, marginBottom: "10px" }}>{t.approachStrategic}</h3>
              <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "14px", lineHeight: 1.7, margin: 0 }}>{t.approachStrategicText}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ───── VALEURS ───── */}
      <section style={{ padding: "0 max(16px, 4vw) 60px", position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <SectionLabel centered>{t.valuesTitle}</SectionLabel>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(200px,100%), 1fr))", gap: "16px", marginTop: "8px" }}>
            {t.values.map((v, i) => (
              <div key={i} style={{ ...card, textAlign: "center", alignItems: "center" }}>
                <div style={{ fontSize: "32px", marginBottom: "12px" }}>{v.emoji}</div>
                <h4 style={{ color: "#fff", fontSize: "15px", fontWeight: 600, marginBottom: "8px" }}>{v.title}</h4>
                <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "13.5px", lineHeight: 1.6, margin: 0 }}>{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── VISION ───── */}
      <section style={{ padding: "0 max(16px, 4vw) 60px", position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: "700px", margin: "0 auto" }}>
          <SectionLabel>{t.visionTitle}</SectionLabel>
          <p style={bodyText}>{t.visionP1}</p>
          <p style={{ ...bodyText, marginTop: "14px", color: "#fbbf24", fontWeight: 500 }}>{t.visionP2}</p>
        </div>
      </section>

      {/* ───── CTA ───── */}
      <section style={{ padding: "0 max(16px, 4vw) 100px", position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: "680px", margin: "0 auto" }}>
          <div style={{
            background: "rgba(255,255,255,0.07)",
            border: "0.5px solid rgba(255,255,255,0.15)",
            borderRadius: "20px",
            padding: "48px 40px",
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
            backdropFilter: "blur(8px)",
          }}>
            <div style={{ position: "absolute", top: 0, left: "40px", right: "40px", height: "1px", background: "linear-gradient(90deg, transparent, rgba(251,191,36,0.4), transparent)" }} />
            <div style={{ fontSize: "36px", marginBottom: "16px" }}>✝️</div>
            <h2 style={{ color: "#fff", fontSize: "clamp(1.4rem, 3vw, 1.9rem)", fontWeight: 500, marginBottom: "14px" }}>
              {t.ctaTitle}
            </h2>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "15px", lineHeight: 1.8, maxWidth: "420px", margin: "0 auto 28px" }}>
              {t.ctaText}
            </p>
            <button onClick={() => router.push("/site/pricing")} style={{
              background: "#fff", color: "#333699", border: "none",
              padding: "14px 36px", borderRadius: "10px", fontSize: "15px",
              fontWeight: 700, cursor: "pointer", transition: "opacity 0.2s",
            }}
              onMouseEnter={e => e.currentTarget.style.opacity = "0.9"}
              onMouseLeave={e => e.currentTarget.style.opacity = "1"}
            >
              {t.ctaBtn}
            </button>
          </div>
        </div>
      </section>

      {/* ───── FOOTER ───── */}
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
        <footer
          style={{
            borderTop: "0.5px solid rgba(255,255,255,0.1)",
            padding: "20px 24px",
            boxSizing: "border-box",
            width: "100%",
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
            {/* COPYRIGHT */}
            <div>
              © {new Date().getFullYear()} SoulTrack. {t.footer}
            </div>
    
            {/* LINKS PADDLE */}
            <div
              style={{
                marginTop: "10px",
                display: "flex",
                justifyContent: "center",
                gap: "16px",
                flexWrap: "wrap",
              }}
            >
              <span
                style={{ color: "#60a5fa", cursor: "pointer" }}
                onClick={() => router.push("/site/terms")}
              >
                Terms of Service
              </span>
    
              <span
                style={{ color: "#60a5fa", cursor: "pointer" }}
                onClick={() => router.push("/site/privacy")}
              >
                Privacy Policy
              </span>
    
              <span
                style={{ color: "#60a5fa", cursor: "pointer" }}
                onClick={() => router.push("/site/refund")}
              >
                Refund Policy
              </span>
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
        html, body { width: 100%; overflow-x: hidden; }
        * { box-sizing: border-box; }
        img { max-width: 100%; height: auto; }
        @media (max-width: 768px) {
          .nav-hide { display: none !important; }
          .nav-show { display: flex !important; }
        }
      `}</style>
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function SectionLabel({ children, color, centered }) {
  return (
    <p style={{
      color: color || "rgba(251,191,36,0.85)",
      fontSize: "13px",
      letterSpacing: "0.13em",
      textTransform: "uppercase",
      fontWeight: 600,
      marginBottom: "14px",
      textAlign: centered ? "center" : "left",
    }}>
      {children}
    </p>
  );
}

const bodyText = {
  color: "#FFFFFF",
  fontSize: "16px",
  lineHeight: 1.85,
  margin: 0,
};

const card = {
  background: "rgba(255,255,255,0.07)",
  border: "0.5px solid rgba(255,255,255,0.12)",
  borderRadius: "18px",
  padding: "28px 24px",
  position: "relative",
  overflow: "hidden",
  backdropFilter: "blur(8px)",
  display: "flex",
  flexDirection: "column",
};
