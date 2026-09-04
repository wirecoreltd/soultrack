"use client";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { Great_Vibes } from "next/font/google";
import supabase from "../lib/supabaseClient"; // ⚠️ adapte le chemin selon l'emplacement de ce fichier
import { useLang } from "../hooks/useLang"; // ⚠️ adapte le chemin selon l'emplacement de ce fichier

// ── Police du logo ────────────────────────────────────────────────────────
// C'était importée dans HomePage.js mais jamais appliquée, et absente ici :
// le fallback CSS "cursive" du navigateur s'affichait à la place de Great Vibes.
const greatVibes = Great_Vibes({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

// Traductions spécifiques au header uniquement.
// (les traductions propres à chaque page restent dans chaque page)
const headerTranslations = {
  fr: {
    login: "Connexion",
    signup: "Créer mon église",
    webVersion: "Version web",
    logout: "Déconnexion",
    nav: [
      { label: "Accueil", path: "/" },
      { label: "Fonctionnement", path: "/fonctionnement" },
      { label: "À propos", path: "/about" },
      { label: "Pricing", path: "/pricing" },
      { label: "Contact", path: "/contact" },
    ],
  },
  en: {
    login: "Log in",
    signup: "Create my church",
    webVersion: "Web version",
    logout: "Log out",
    nav: [
      { label: "Home", path: "/" },
      { label: "How it works", path: "/fonctionnement" },
      { label: "About", path: "/about" },
      { label: "Pricing", path: "/pricing" },
      { label: "Contact", path: "/contact" },
    ],
  },
};

export default function HeaderSite({ showSignup = true }) {
  const router = useRouter();
  const pathname = usePathname();
  const { lang, changeLang } = useLang();
  const t = headerTranslations[lang];

  const [openMenu, setOpenMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // ── Scroll ─────────────────────────────────────────────
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ── Profil : chargement + écoute des changements de session ──
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
          <Image src="/logo.png" alt="SoulTrack" width={30} height={30} />
          <span
            className={greatVibes.className}
            style={{
              color: "#fff",
              fontSize: "20px",
              lineHeight: 1,
              whiteSpace: "nowrap",
              position: "relative",
              top: "3px",
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
          {/* NAV desktop */}
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

          {/* BOUTONS profil / login+signup desktop */}
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
                {showSignup && (
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
                )}
              </>
            )}
          </div>

          {/* Switcher langue desktop */}
          <div
            style={{
              display: "flex",
              gap: "10px",
              alignItems: "center",
              flexShrink: 0,
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
                flexShrink: 0,
              }}
            >
              <img
                src="https://flagcdn.com/w40/fr.png"
                srcSet="https://flagcdn.com/w80/fr.png 2x"
                width="30"
                height="21"
                alt="Français"
                style={{ display: "block", borderRadius: "3px", flexShrink: 0 }}
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
                flexShrink: 0,
              }}
            >
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
        {/* ───── FIN GROUPE DROITE desktop ───── */}

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
            {loadingProfile ? null : profile ? (
              <>
                <span
                  onClick={() => {
                    router.push("/hub");
                    setOpenMenu(false);
                  }}
                  style={{
                    color: "#fff",
                    fontSize: "15px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
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
                {showSignup && (
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
                )}
              </>
            )}
          </div>
        </div>
      )}

      <style>{`
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
    </header>
  );
}
