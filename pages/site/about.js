"use client";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";

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
  const [lang, setLang] = useState("fr");
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
            <button onClick={() => router.push("/SignupEglise")} style={{ background: "#fff", color: "#333699", border: "none", padding: "7px 18px", borderRadius: "8px", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}>
              {t.signup}
            </button>
          </div>

          {/* Switcher langue desktop */}
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }} className="nav-hide">
            <button onClick={() => setLang("fr")} title="Français" style={langBtnStyle(lang === "fr")}>
              <img src="https://flagcdn.com/w40/fr.png" srcSet="https://flagcdn.com/w80/fr.png 2x" width="32" height="22" alt="Français" style={{ display: "block", borderRadius: "3px" }} />
            </button>
            <button onClick={() => setLang("en")} title="English" style={langBtnStyle(lang === "en")}>
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
              <button onClick={() => router.push("/SignupEglise")} style={{ background: "#fff", color: "#333699", border: "none", padding: "11px", borderRadius: "8px", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}>
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
            borderRadius: "0 12px 12px 0",
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
            <button onClick={() => router.push("/SignupEglise")} style={{
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
      <footer style={{ borderTop: "0.5px solid rgba(255,255,255,0.1)", padding: "20px 24px" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", textAlign: "center", color: "rgba(255,255,255,0.35)", fontSize: "14px" }}>
          © {new Date().getFullYear()} SoulTrack. {t.footer}
        </div>
      </footer>

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
