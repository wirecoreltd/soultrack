"use client";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";

import { Great_Vibes } from "next/font/google";
const greatVibes = Great_Vibes({ subsets: ["latin"], weight: "400" });

// ─── TRANSLATIONS ─────────────────────────────────────────────
const translations = {
  fr: {
    login: "Connexion",
    signup: "Créer mon église",
    cta: "Commencer maintenant",
    nav: [
      { label: "Accueil", path: "/site/HomePage" },
      { label: "Fonctionnement", path: "/site/Fonctionnement" },
      { label: "À propos", path: "/site/about" },
      { label: "Pricing", path: "/site/pricing" },
      { label: "Contact", path: "/site/contact" },
    ],
    about: {
      heroLabel: "À propos",
      heroTitle: "Chaque âme compte.",
      heroHighlight: "Aucune ne doit être perdue",
      heroText:
        "SoulTrack est né d’un constat simple mais profond : beaucoup d’églises grandissent, mais le suivi des âmes devient difficile.",

      blocks: [
        {
          title: "🌱 Le constat",
          text:
            "Les membres arrivent, mais certains ne sont pas suivis. Les nouveaux se perdent, les évangélisés disparaissent. Non par manque de cœur, mais par manque de structure.",
        },
        {
          title: "🔥 La vision",
          text:
            "Aider les églises à grandir sans perdre personne. Donner de la visibilité, structurer le suivi, organiser les responsables.",
        },
        {
          title: "✝️ La mission",
          text:
            "Chaque personne doit être connue, suivie et accompagnée. Peu importe la taille de l’église.",
        },
      ],

      conclusion:
        "SoulTrack n’est pas juste un logiciel. C’est un outil pour ne perdre aucune âme.",
    },
    footer: "Tous droits réservés.",
  },

  en: {
    login: "Log in",
    signup: "Create my church",
    cta: "Get started",
    nav: [
      { label: "Home", path: "/site/HomePage" },
      { label: "How it works", path: "/site/Fonctionnement" },
      { label: "About", path: "/site/about" },
      { label: "Pricing", path: "/site/pricing" },
      { label: "Contact", path: "/site/contact" },
    ],
    about: {
      heroLabel: "About",
      heroTitle: "Every soul matters.",
      heroHighlight: "No one should be lost",
      heroText:
        "SoulTrack was born from a simple observation: churches grow, but people tracking becomes harder.",

      blocks: [
        {
          title: "🌱 The problem",
          text:
            "People come, but are not always followed. Some get lost. Not because of lack of care, but lack of structure.",
        },
        {
          title: "🔥 The vision",
          text:
            "Help churches grow without losing people. Bring clarity, structure and organization.",
        },
        {
          title: "✝️ The mission",
          text:
            "Every person should be known, followed and cared for, regardless of church size.",
        },
      ],

      conclusion:
        "SoulTrack is not just software. It’s a tool to make sure no soul is lost.",
    },
    footer: "All rights reserved.",
  },
};

export default function AboutPage() {
  const router = useRouter();
  const pathname = usePathname();

  const [openMenu, setOpenMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [lang, setLang] = useState("fr");

  const t = translations[lang];
  const a = t.about;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div style={{ background: "#333699", minHeight: "100vh" }}>

      {/* HEADER IDENTIQUE */}
      <header style={{
        background: scrolled ? "rgba(51,54,153,0.92)" : "transparent",
        borderBottom: "0.5px solid rgba(255,255,255,0.1)",
        position: "sticky", top: 0, zIndex: 100,
      }}>
        <div style={{
          maxWidth: "1100px", margin: "0 auto",
          padding: "22px 24px", display: "flex",
          justifyContent: "space-between", alignItems: "center",
        }}>
          <div onClick={() => router.push("/site/HomePage")} style={{ display: "flex", gap: "6px", cursor: "pointer" }}>
            <Image src="/logo.png" alt="SoulTrack" width={50} height={50} />
            <span style={{ color: "#fff", fontSize: "22px", fontFamily: "'Great Vibes', cursive" }}>SoulTrack</span>
          </div>

          <nav style={{ display: "flex", gap: "24px" }}>
            {t.nav.map((item) => (
              <span key={item.path}
                onClick={() => router.push(item.path)}
                style={{ color: pathname === item.path ? "#fbbf24" : "#fff", cursor: "pointer" }}>
                {item.label}
              </span>
            ))}
          </nav>

          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={() => router.push("/login")}>{t.login}</button>
            <button onClick={() => router.push("/SignupEglise")}>{t.signup}</button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section style={{ textAlign: "center", padding: "80px 24px 40px" }}>
        <p style={{ color: "rgba(255,255,255,0.5)" }}>{a.heroLabel}</p>

        <h1 style={{ color: "#fff", fontSize: "40px" }}>
          {a.heroTitle} <span style={{ color: "#fbbf24" }}>{a.heroHighlight}</span>
        </h1>

        <p style={{ color: "rgba(255,255,255,0.7)", maxWidth: "600px", margin: "20px auto" }}>
          {a.heroText}
        </p>

        {/* CTA */}
        <button
          onClick={() => router.push("/SignupEglise")}
          style={{
            background: "#fff",
            color: "#333699",
            padding: "12px 26px",
            borderRadius: "10px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          {t.cta} →
        </button>
      </section>

      {/* BLOCS */}
      <section style={{ padding: "40px 24px" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "20px" }}>
          {a.blocks.map((b, i) => (
            <div key={i} style={{
              background: "rgba(255,255,255,0.08)",
              padding: "24px",
              borderRadius: "16px"
            }}>
              <h3 style={{ color: "#fff" }}>{b.title}</h3>
              <p style={{ color: "rgba(255,255,255,0.7)" }}>{b.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CONCLUSION */}
      <section style={{ textAlign: "center", padding: "40px 24px 80px" }}>
        <p style={{ color: "rgba(255,255,255,0.6)" }}>{a.conclusion}</p>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: "0.5px solid rgba(255,255,255,0.1)", padding: "20px", textAlign: "center", color: "rgba(255,255,255,0.4)" }}>
        © {new Date().getFullYear()} SoulTrack. {t.footer}
      </footer>

    </div>
  );
}
