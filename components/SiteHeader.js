"use client";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import supabase from "../lib/supabaseClient";
import { useLang } from "../hooks/useLang";

import { Great_Vibes } from "next/font/google";
const greatVibes = Great_Vibes({ subsets: ["latin"], weight: "400" });

// Tagline is intentionally always in English — it's the brand's fixed slogan.
const SLOGAN = "Every Soul is Precious";

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
    flexShrink: 0,
  };
}

export default function SiteHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const { lang, changeLang } = useLang();

  const [openMenu, setOpenMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const t = translations[lang];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
    <header
      style={{
        background: scrolled ? "rgba(51,54,153,0.92)" : "transparent",
        borderBottom: scrolled ? "0.5px solid rgba(255,255,255,0.15)" : "0.5px solid transparent",
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
          maxWidth: "1240px",
          margin: "0 auto",
          padding: "14px 24px",
          minHeight: "88px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "24px",
          boxSizing: "border-box",
        }}
      >
        {/* LOGO + SLOGAN */}
        <div
          onClick={() => router.push("/site/HomePage")}
          style={{
            display: "flex",
            flexDirection: "column",
            cursor: "pointer",
            zIndex: 1,
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Image src="/logo.png" alt="SoulTrack" width={38} height={38} />
            <span
              className={greatVibes.className}
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
          <span
            style={{
              color: "#fbbf24",
              fontSize: "10.5px",
              fontStyle: "italic",
              letterSpacing: "0.05em",
              whiteSpace: "nowrap",
              marginLeft: "46px",
              marginTop: "-3px",
              opacity: 0.9,
            }}
          >
            {SLOGAN}
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
                  (e.currentTarget.style.color = pathname === item.path ? "#fbbf24" : "#fff")
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
          <div
            style={{
              display: "flex",
              gap: "10px",
              alignItems: "center",
              flexShrink: 0,
            }}
          >
            <button onClick={() => changeLang("fr")} title="Français" style={langBtnStyle(lang === "fr")}>
              <img
                src="https://flagcdn.com/w40/fr.png"
                srcSet="https://flagcdn.com/w80/fr.png 2x"
                width="30"
                height="21"
                alt="Français"
                style={{ display: "block", borderRadius: "3px", flexShrink: 0 }}
              />
            </button>
            <button onClick={() => changeLang("en")} title="English" style={langBtnStyle(lang === "en")}>
              <img
                src="https://flagcdn.com/w40/gb.png"
                srcSet="https://flagcdn.com/w80/gb.png 2x"
                width="30"
                height="21"
                alt="English"
                style={{ display: "block", borderRadius: "3px", flexShrink: 0 }}
              />
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
              <img
                src="https://flagcdn.com/w20/fr.png"
                srcSet="https://flagcdn.com/w40/fr.png 2x"
                width="20"
                height="14"
                alt="Français"
                style={{ display: "block", borderRadius: "2px" }}
              />
            </button>
            <button onClick={() => changeLang("en")} title="English" style={langBtnStyle(lang === "en")}>
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

          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "4px" }}>
            {loadingProfile ? null : profile ? (
              <>
                <span
                  onClick={() => {
                    router.push("/hub");
                    setOpenMenu(false);
                  }}
                  style={{ color: "#fff", fontSize: "15px", fontWeight: 600, cursor: "pointer" }}
                >
                  👤 {profile.prenom} {profile.nom}
                </span>
                <button
                  onClick={() => {
                    router.push("/hub");
                    setOpenMenu(false);
                  }}
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
                  {t.webVersion}
                </button>
                <button
                  onClick={() => {
                    handleLogout();
                    setOpenMenu(false);
                  }}
                  style={{
                    background: "transparent",
                    color: "#fbbf24",
                    border: "0.5px solid rgba(255,255,255,0.35)",
                    padding: "11px",
                    borderRadius: "8px",
                    fontSize: "14px",
                    cursor: "pointer",
                  }}
                >
                  {t.logout}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    router.push("/login");
                    setOpenMenu(false);
                  }}
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
                  onClick={() => {
                    router.push("/site/pricing");
                    setOpenMenu(false);
                  }}
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
              </>
            )}
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .nav-hide { display: none !important; }
          .nav-show { display: flex !important; }
        }
      `}</style>
    </header>
  );
}
