import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { useLang } from "../hooks/useLang";
import HeaderSite from "../components/HeaderSite";

const translations = {
  fr: {
    title: "Centre d'aide — SoulTrack",
    metaDescription:
      "Retrouvez tous les tutoriels SoulTrack pour créer votre église, gérer vos membres, vos cellules, votre évangélisation et bien plus.",
    heroLabel: "Centre d'aide",
    heroTitle: "Comment pouvons-nous vous aider ?",
    searchPlaceholder: "Rechercher un tutoriel...",
    noResults: "Aucun tutoriel ne correspond à votre recherche.",
    tutoLabel: (n) => `${n} tutoriel${n > 1 ? "s" : ""}`,
    footer: "Tous droits réservés.",
    categories: [
      {
        slug: "mise-en-route",
        emoji: "🚀",
        title: "Mise en route",
        description: "Créer votre église, se connecter, télécharger l'app",
        count: 5,
      },
      {
        slug: "membres",
        emoji: "🧭",
        title: "Membres",
        description: "Suivi des membres",
        count: 6,
      },
      {
        slug: "evangelisation",
        emoji: "✝️",
        title: "Évangélisation",
        description: "Suivre les nouvelles âmes et leur parcours",
        count: 4,
      },
      {
        slug: "cellules",
        emoji: "🏠",
        title: "Cellules",
        description: "Créer et gérer vos cellules et responsables",
        count: 6,
      },
      {
        slug: "conseiller",
        emoji: "🤝",
        title: "Conseiller",
        description: "Accompagner les membres dans leur parcours",
        count: 4,
      },
      {
        slug: "familles",
        emoji: "👑",
        title: "Familles",
        description: "Organiser et suivre les familles",
        count: 4,
      },
      {
        slug: "espace-enfants",
        emoji: "🦁",
        title: "Espace enfants",
        description: "Gérer le ministère enfants",
        count: 3,
      },
      {
        slug: "presences",
        emoji: "✍🏻",
        title: "Registre de présences",
        description: "Check-in et suivi des présences",
        count: 3,
      },
      {
        slug: "rapports",
        emoji: "📊",
        title: "Rapports",
        description: "Statistiques, exports et vision globale",
        count: 5,
      },
      {
        slug: "baptemes",
        emoji: "💧",
        title: "Baptêmes",
        description: "Suivre les baptêmes et leur préparation",
        count: 2,
      },
      {
        slug: "espace-administrateur",
        emoji: "⚙️",
        title: "Espace administrateur",
        description: "Paramètres et gestion de l'église",
        count: 4,
      },
    ],
  },
  en: {
    title: "Help Center — SoulTrack",
    metaDescription:
      "Find every SoulTrack tutorial to create your church, manage your members, cell groups, evangelism and more.",
    heroLabel: "Help center",
    heroTitle: "How can we help?",
    searchPlaceholder: "Search a tutorial...",
    noResults: "No tutorial matches your search.",
    tutoLabel: (n) => `${n} tutorial${n > 1 ? "s" : ""}`,
    footer: "All rights reserved.",
    categories: [
      {
        slug: "mise-en-route",
        emoji: "🚀",
        title: "Getting started",
        description: "Create your church, log in, download the app",
        count: 5,
      },
      {
        slug: "membres",
        emoji: "🧭",
        title: "Members",
        description: "Member tracking",
        count: 6,
      },
      {
        slug: "evangelisation",
        emoji: "✝️",
        title: "Evangelism",
        description: "Follow up new souls and their journey",
        count: 4,
      },
      {
        slug: "cellules",
        emoji: "🏠",
        title: "Cell groups",
        description: "Create and manage cell groups and leaders",
        count: 6,
      },
      {
        slug: "conseiller",
        emoji: "🤝",
        title: "Counsellor",
        description: "Accompany members through their journey",
        count: 4,
      },
      {
        slug: "familles",
        emoji: "👑",
        title: "Families",
        description: "Organise and follow up families",
        count: 4,
      },
      {
        slug: "espace-enfants",
        emoji: "🦁",
        title: "Children's space",
        description: "Manage the children's ministry",
        count: 3,
      },
      {
        slug: "presences",
        emoji: "✍🏻",
        title: "Attendance register",
        description: "Check-in and attendance tracking",
        count: 3,
      },
      {
        slug: "rapports",
        emoji: "📊",
        title: "Reports",
        description: "Statistics, exports and overview",
        count: 5,
      },
      {
        slug: "baptemes",
        emoji: "💧",
        title: "Baptisms",
        description: "Track baptisms and their preparation",
        count: 2,
      },
      {
        slug: "espace-administrateur",
        emoji: "⚙️",
        title: "Admin space",
        description: "Church settings and administration",
        count: 4,
      },
    ],
  },
};

export default function AidePage() {
  const router = useRouter();
  const { lang } = useLang();
  const [query, setQuery] = useState("");

  const t = translations[lang];

  const filteredCategories = t.categories.filter((c) =>
    (c.title + " " + c.description)
      .toLowerCase()
      .includes(query.trim().toLowerCase())
  );

  return (
    <div style={{ background: "#333699", minHeight: "100vh", position: "relative", overflowX: "hidden" }}>
      <Head>
        <title>{t.title}</title>
        <meta name="description" content={t.metaDescription} />
        <link rel="canonical" href="https://soultrack.org/aide" />

        <meta property="og:title" content={t.title} />
        <meta property="og:description" content={t.metaDescription} />
        <meta property="og:url" content="https://soultrack.org/aide" />
        <meta property="og:type" content="website" />
      </Head>

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
        top: "700px", left: "20%",
        pointerEvents: "none", zIndex: 0,
      }} />

      <HeaderSite />

      {/* ───── HERO + RECHERCHE ───── */}
      <section style={{ textAlign: "center", padding: "70px max(16px, 4vw) 50px", position: "relative", zIndex: 1 }}>
        <SectionLabel centered>{t.heroLabel}</SectionLabel>
        <h1 style={{ color: "#fff", fontSize: "clamp(2rem, 5vw, 2.8rem)", fontWeight: 500, lineHeight: 1.15, marginBottom: "28px" }}>
          {t.heroTitle}
        </h1>

        <div style={{ maxWidth: "440px", margin: "0 auto", position: "relative" }}>
          <span style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.4)", fontSize: "16px" }}>
            🔍
          </span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            style={{
              width: "100%",
              background: "rgba(255,255,255,0.08)",
              border: "0.5px solid rgba(255,255,255,0.15)",
              borderRadius: "12px",
              padding: "13px 16px 13px 42px",
              color: "#fff",
              fontSize: "15px",
              outline: "none",
            }}
          />
        </div>
      </section>

      {/* ───── CATÉGORIES ───── */}
      <section style={{ padding: "0 max(16px, 4vw) 100px", position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
          {filteredCategories.length === 0 ? (
            <p style={{ ...bodyText, textAlign: "center", color: "rgba(255,255,255,0.5)" }}>{t.noResults}</p>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(260px,100%), 1fr))", gap: "18px" }}>
              {filteredCategories.map((c) => (
                <div
                  key={c.slug}
                  onClick={() => router.push(`/aide/${c.slug}`)}
                  style={{ ...card, cursor: "pointer" }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(251,191,36,0.35)")}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)")}
                >
                  <div style={{ fontSize: "26px", marginBottom: "14px" }}>{c.emoji}</div>
                  <h3 style={{ color: "#fff", fontSize: "16px", fontWeight: 500, marginBottom: "8px" }}>{c.title}</h3>
                  <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "14px", lineHeight: 1.6, marginBottom: "14px" }}>
                    {c.description}
                  </p>
                  <span style={{ color: "#fbbf24", fontSize: "13px" }}>{t.tutoLabel(c.count)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ───── FOOTER ───── */}
      <footer style={{ borderTop: "0.5px solid rgba(255,255,255,0.1)", padding: "20px 24px", boxSizing: "border-box", width: "100%" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", textAlign: "center", color: "rgba(255,255,255,0.35)", fontSize: "14px" }}>
          <div>© {new Date().getFullYear()} SoulTrack. {t.footer}</div>
          <div style={{ marginTop: "10px", display: "flex", justifyContent: "center", gap: "16px", flexWrap: "wrap" }}>
            <span onClick={() => router.push("/terms")} style={{ cursor: "pointer", textDecoration: "underline" }}>Terms</span>
            <span onClick={() => router.push("/privacy")} style={{ cursor: "pointer", textDecoration: "underline" }}>Privacy</span>
            <span onClick={() => router.push("/refund")} style={{ cursor: "pointer", textDecoration: "underline" }}>Refund</span>
          </div>
        </div>
      </footer>

      <style>{`
        html, body { width: 100%; overflow-x: hidden; }
        * { box-sizing: border-box; }
        img { max-width: 100%; height: auto; }
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
  transition: "border-color 0.2s",
};
