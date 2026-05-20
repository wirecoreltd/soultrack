"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import supabase from "../../lib/supabaseClient";
import { useLang } from "../../hooks/useLang";

import { Great_Vibes } from "next/font/google";
const greatVibes = Great_Vibes({ subsets: ["latin"], weight: "400" });

/* =========================
   HEADER
========================= */
function Header({ t }) {
  const router = useRouter();
  const pathname = usePathname();
  const { lang, changeLang } = useLang();

  const [openMenu, setOpenMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const langBtnStyle = (active) => ({
    background: active ? "rgba(255,255,255,0.15)" : "none",
    border: active ? "0.5px solid rgba(255,255,255,0.3)" : "none",
    borderRadius: "4px",
    cursor: "pointer",
    padding: "3px 5px",
    opacity: active ? 1 : 0.45,
  });

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
      }}
    >
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "22px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {/* LOGO */}
        <div
          onClick={() => router.push("/site/HomePage")}
          style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}
        >
          <Image src="/logo.png" width={50} height={50} alt="logo" />
          <span style={{ color: "#fff", fontSize: "22px", fontFamily: "'Great Vibes', cursive" }}>
            SoulTrack
          </span>
        </div>

        {/* NAV */}
        <nav style={{ display: "flex", gap: "28px" }} className="nav-hide">
          {t.nav.map((item) => (
            <span
              key={item.path}
              onClick={() => router.push(item.path)}
              style={{
                color: pathname === item.path ? "#fbbf24" : "#fff",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: 600,
              }}
            >
              {item.label}
            </span>
          ))}
        </nav>

        {/* ACTIONS */}
        <div style={{ display: "flex", gap: "10px" }} className="nav-hide">
          <button
            onClick={() => router.push("/login")}
            style={{
              background: "transparent",
              color: "#fbbf24",
              border: "0.5px solid rgba(255,255,255,0.35)",
              padding: "7px 18px",
              borderRadius: "8px",
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
              fontWeight: 600,
            }}
          >
            {t.signup}
          </button>
        </div>

        {/* LANG */}
        <div style={{ display: "flex", gap: "8px" }}>
          <button onClick={() => changeLang("fr")} style={langBtnStyle(lang === "fr")}>🇫🇷</button>
          <button onClick={() => changeLang("en")} style={langBtnStyle(lang === "en")}>🇬🇧</button>
        </div>

        {/* MOBILE */}
        <button onClick={() => setOpenMenu(!openMenu)} className="nav-show">
          ☰
        </button>
      </div>

      {openMenu && (
        <div style={{ background: "#333699", padding: 20 }}>
          {t.nav.map((item) => (
            <div
              key={item.path}
              onClick={() => {
                router.push(item.path);
                setOpenMenu(false);
              }}
              style={{ color: "#fff", padding: "10px 0", cursor: "pointer" }}
            >
              {item.label}
            </div>
          ))}
        </div>
      )}
    </header>
  );
}

/* =========================
   FOOTER
========================= */
function Footer({ t }) {
  const router = useRouter();

  return (
    <footer
      style={{
        borderTop: "0.5px solid rgba(255,255,255,0.1)",
        padding: "20px 24px",
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

        <div
          style={{
            marginTop: "10px",
            display: "flex",
            justifyContent: "center",
            gap: "18px",
            fontSize: "13px",
          }}
        >
          <span onClick={() => router.push("/site/terms")} style={{ cursor: "pointer", textDecoration: "underline" }}>
            Terms
          </span>

          <span onClick={() => router.push("/site/privacy")} style={{ cursor: "pointer", textDecoration: "underline" }}>
            Privacy
          </span>

          <span onClick={() => router.push("/site/refund")} style={{ cursor: "pointer", textDecoration: "underline" }}>
            Refund
          </span>
        </div>
      </div>
    </footer>
  );
}

/* =========================
   PAGE
========================= */
export default function ContactPage() {
  const { lang } = useLang();

  const t = {
    fr: { footer: "Tous droits réservés.", nav: [] },
    en: { footer: "All rights reserved.", nav: [] },
  }[lang];

  return (
    <div style={{ background: "#333699", minHeight: "100vh" }}>

      {/* HEADER */}
      <Header t={t} />

      {/* BODY */}
      <main style={{ padding: "60px 24px", color: "#fff", textAlign: "center" }}>
        <h1>Contact Page</h1>
        <p>Ton contenu ici (formulaire, hero, etc.)</p>
      </main>

      {/* FOOTER */}
      <Footer t={t} />

    </div>
  );
}
