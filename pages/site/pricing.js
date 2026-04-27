"use client";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";

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
    heroTitle: "Une structure adaptée à votre",
    heroHighlight: "croissance",
    heroPara: "Chaque étape du ministère nécessite un niveau de structure différent. SoulTrack évolue avec votre église.",
    btnStart: "Commencer →",
    footer: "Tous droits réservés.",
    plans: [
      {
        name: "Départ",
        emoji: "🌱",
        range: "0 – 50 membres",
        price: "Gratuit",
        accent: "rgba(29,158,117,0.45)",
        
      },
      {
        name: "Croissance",
        emoji: "📈",
        range: "51 – 150 membres",
        price: "$39/mois",
        accent: "rgba(55,138,221,0.5)",
        
      },
      {
        name: "Vision",
        emoji: "🔥",
        range: "151 – 500 membres",
        price: "$79/mois",
        accent: "rgba(251,191,36,0.4)",
        
      },
      {
        name: "Expansion",
        emoji: "🌍",
        range: "501 - 1500 membres",
        price: "$149/mois",
        accent: "rgba(212,83,126,0.4)",
        
      },
      {
        name: "Réseaux",
        emoji: "🔗",
        range: "501 - 1500 membres",
        price: "sur mesure",
        accent: "rgba(212,83,126,0.4)",
        
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
    heroTitle: "A structure adapted to your",
    heroHighlight: "growth",
    heroPara: "Every stage of ministry requires a different level of structure. SoulTrack grows with your church.",
    btnStart: "Get started →",
    footer: "All rights reserved.",
    plans: [
      {
        name: "Starter",
        emoji: "🌱",
        range: "0 – 50 members",
        price: "Free",
        accent: "rgba(29,158,117,0.45)",
       
      },
      {
        name: "Growth",
        emoji: "📈",
        range: "51 – 300 members",
        price: "$29/month",
        accent: "rgba(55,138,221,0.5)",
       
      },
      {
        name: "Vision",
        emoji: "🔥",
        range: "301 – 1000 members",
        price: "$59/month",
        accent: "rgba(251,191,36,0.4)",
        
      },
      {
        name: "Expansion",
        emoji: "🌍",
        range: "1000+ members",
        price: "Custom",
        accent: "rgba(212,83,126,0.4)",
        
      },
    ],
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

export default function PricingPage() {
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

      {/* GLOW */}
      <div style={{
        position: "absolute", width: "800px", height: "800px", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(255,255,255,0.13) 0%, rgba(255,255,255,0.04) 40%, transparent 65%)",
        top: "80px", left: "50%", transform: "translateX(-50%)",
        pointerEvents: "none", zIndex: 0,
      }} />
      <div style={{
        position: "absolute", width: "600px", height: "600px", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(251,191,36,0.07) 0%, rgba(255,255,255,0.02) 40%, transparent 65%)",
        top: "600px", left: "50%", transform: "translateX(-50%)",
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
                className="nav-hide"
              >
                {item.label}
              </span>
            ))}
          </nav>

          {/* BOUTONS desktop */}
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
              onClick={() => router.push("/SignupEglise")}
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
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }} className="nav-hide">
            <button onClick={() => setLang("fr")} title="Français" style={langBtnStyle(lang === "fr")}>
              <img src="https://flagcdn.com/w40/fr.png" srcSet="https://flagcdn.com/w80/fr.png 2x" width="32" height="22" alt="Français" style={{ display: "block", borderRadius: "3px" }} />
            </button>
            <button onClick={() => setLang("en")} title="English" style={langBtnStyle(lang === "en")}>
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

            {/* Switcher langue mobile */}
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <button onClick={() => setLang("fr")} title="Français" style={langBtnStyle(lang === "fr")}>
                <img src="https://flagcdn.com/w20/fr.png" srcSet="https://flagcdn.com/w40/fr.png 2x" width="20" height="14" alt="Français" style={{ display: "block", borderRadius: "2px" }} />
              </button>
              <button onClick={() => setLang("en")} title="English" style={langBtnStyle(lang === "en")}>
                <img src="https://flagcdn.com/w20/gb.png" srcSet="https://flagcdn.com/w40/gb.png 2x" width="20" height="14" alt="English" style={{ display: "block", borderRadius: "2px" }} />
              </button>
            </div>

            {/* Boutons mobile */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "4px" }}>
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
                onClick={() => router.push("/SignupEglise")}
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
      <section style={{
        textAlign: "center",
        padding: "60px max(16px, 4vw) 40px",
        width: "100%",
        boxSizing: "border-box",
        position: "relative",
        zIndex: 1,
      }}>
        <h1 style={{ color: "#fff", fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 500, marginBottom: "10px" }}>
          {t.heroTitle} <span style={{ color: "#fbbf24" }}>{t.heroHighlight}</span>
        </h1>
        <p style={{ color: "rgba(255,255,255,0.6)", maxWidth: "500px", margin: "0 auto", lineHeight: 1.7 }}>
          {t.heroPara}
        </p>
      </section>

      {/* ───── PLANS ───── */}
      <section style={{ padding: "40px 24px 100px", position: "relative", zIndex: 1 }}>
        <div style={{
          maxWidth: "1100px",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(260px, 100%), 1fr))",
          width: "100%",
          gap: "20px",
        }}>
          {t.plans.map((plan, i) => (
            <div key={i} style={{
              background: "rgba(255,255,255,0.08)",
              border: "0.5px solid rgba(255,255,255,0.12)",
              borderRadius: "20px",
              padding: "28px 24px",
              position: "relative",
              backdropFilter: "blur(8px)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
            }}>
              <div style={{
                position: "absolute", top: "-40px", left: "-40px",
                width: "160px", height: "160px", borderRadius: "50%",
                background: `radial-gradient(circle, ${plan.accent} 0%, transparent 70%)`,
              }} />

              <h3 style={{ color: "#FFFFFF", fontSize: "18px", marginBottom: "6px", alignSelf: "flex-start", textAlign: "left" }}>
                {plan.emoji} {plan.name}
              </h3>
              <p style={{ color: "#FFFFFF", fontSize: "13px", marginBottom: "14px", opacity: 0.85, alignSelf: "flex-start", textAlign: "left" }}>
                {plan.range}
              </p>
              <div style={{ color: "#fbbf24", fontWeight: 600, fontSize: "22px", marginBottom: "20px", textAlign: "center", width: "100%" }}>
                {plan.price}
              </div>

              <ul style={{ listStyle: "none", padding: 0, marginBottom: "22px", width: "100%" }}>
                {plan.features.map((f, idx) => (
                  <li key={idx} style={{
                    color: "#fff", fontSize: "14.5px", lineHeight: 1.8,
                    padding: "10px 0", textAlign: "center",
                    borderBottom: idx !== plan.features.length - 1 ? "1px solid rgba(255,255,255,0.12)" : "none",
                  }}>
                    {f}
                  </li>
                ))}
              </ul>

              <button onClick={() => router.push("/SignupEglise")} style={{
                background: "#fff", color: "#333699", border: "none",
                padding: "10px 20px", borderRadius: "10px", fontWeight: 600, cursor: "pointer",
              }}>
                {t.btnStart}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ───── FOOTER ───── */}
      <footer style={{ borderTop: "0.5px solid rgba(255,255,255,0.1)", padding: "20px 24px" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", textAlign: "center", color: "rgba(255,255,255,0.35)", fontSize: "14px" }}>
          © {new Date().getFullYear()} SoulTrack. {t.footer}
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
        }
      `}</style>
    </div>
  );
}
