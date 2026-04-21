"use client";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import supabase from "../../lib/supabaseClient";

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
    heroLabel: "Contact",
    heroTitle: "Une question ?",
    heroHighlight: "Écrivez-nous",
    heroPara: "Vous avez une question sur SoulTrack, une suggestion pour l'améliorer, ou simplement un témoignage à partager ? Chaque message compte. Nous lisons tout avec attention et vous répondons avec soin.",
    heroSub: "Votre retour nous aide à bâtir un outil toujours plus proche de vos besoins.",
    fieldName: "Nom complet",
    fieldNamePlaceholder: "Jean Dupont",
    fieldEmail: "Email",
    fieldEmailPlaceholder: "jean@exemple.com",
    fieldType: "Type de message",
    fieldTypePlaceholder: "Sélectionnez un type",
    typeAmelioration: "💡 Amélioration",
    typeQuestion: "❓ Question",
    typeTemoignage: "✝️ Témoignage",
    fieldTitre: "Titre",
    fieldTitrePlaceholder: "Ex : Apôtre, Pasteur, Bishop...",
    fieldEglise: "Nom de l'église",
    fieldEglisePlaceholder: "Ex : Église Grâce et Vérité",
    fieldNote: "Note",
    fieldMessage: "Message",
    placeholderAmelioration: "Partagez votre suggestion pour améliorer SoulTrack...",
    placeholderQuestion: "Posez votre question, nous vous répondrons avec soin...",
    placeholderTemoignage: "Partagez ce que Dieu a accompli à travers SoulTrack dans votre église...",
    placeholderDefault: "Écrivez votre message ici...",
    errorRequired: "Veuillez remplir tous les champs.",
    errorTemoignage: "Veuillez remplir tous les champs du témoignage.",
    errorServer: "Une erreur est survenue. Veuillez réessayer.",
    btnSend: "Envoyer le message",
    btnSending: "Envoi en cours...",
    btnSendAnother: "Envoyer un autre message",
    successMessages: {
      amelioration: {
        icon: "💡",
        title: "Suggestion reçue !",
        text: "Merci pour votre retour. Chaque idée compte et nous aide à améliorer SoulTrack pour mieux servir vos besoins.",
      },
      question: {
        icon: "❓",
        title: "Question bien reçue !",
        text: "Nous avons bien reçu votre question. Notre équipe vous répondra dans les plus brefs délais avec toute l'attention que vous méritez.",
      },
      temoignage: {
        icon: "✝️",
        title: "Témoignage reçu, merci !",
        text: "Votre témoignage nous touche profondément. Que Dieu soit glorifié à travers chaque vie transformée. Merci de partager ce que Dieu accomplit.",
      },
    },
    footer: "Tous droits réservés.",
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
    heroLabel: "Contact",
    heroTitle: "A question?",
    heroHighlight: "Write to us",
    heroPara: "Do you have a question about SoulTrack, a suggestion to improve it, or simply a testimony to share? Every message matters. We read everything carefully and respond with care.",
    heroSub: "Your feedback helps us build a tool that is always closer to your needs.",
    fieldName: "Full name",
    fieldNamePlaceholder: "John Smith",
    fieldEmail: "Email",
    fieldEmailPlaceholder: "john@example.com",
    fieldType: "Message type",
    fieldTypePlaceholder: "Select a type",
    typeAmelioration: "💡 Suggestion",
    typeQuestion: "❓ Question",
    typeTemoignage: "✝️ Testimony",
    fieldTitre: "Title",
    fieldTitrePlaceholder: "e.g. Apostle, Pastor, Bishop...",
    fieldEglise: "Church name",
    fieldEglisePlaceholder: "e.g. Grace & Truth Church",
    fieldNote: "Rating",
    fieldMessage: "Message",
    placeholderAmelioration: "Share your suggestion to improve SoulTrack...",
    placeholderQuestion: "Ask your question, we will reply with care...",
    placeholderTemoignage: "Share what God has accomplished through SoulTrack in your church...",
    placeholderDefault: "Write your message here...",
    errorRequired: "Please fill in all required fields.",
    errorTemoignage: "Please fill in all testimony fields.",
    errorServer: "An error occurred. Please try again.",
    btnSend: "Send message",
    btnSending: "Sending...",
    btnSendAnother: "Send another message",
    successMessages: {
      amelioration: {
        icon: "💡",
        title: "Suggestion received!",
        text: "Thank you for your feedback. Every idea counts and helps us improve SoulTrack to better serve your needs.",
      },
      question: {
        icon: "❓",
        title: "Question received!",
        text: "We have received your question. Our team will get back to you as soon as possible with all the attention you deserve.",
      },
      temoignage: {
        icon: "✝️",
        title: "Testimony received, thank you!",
        text: "Your testimony touches us deeply. May God be glorified through every transformed life. Thank you for sharing what God is doing.",
      },
    },
    footer: "All rights reserved.",
  },
};

export default function ContactPage() {
  const router = useRouter();
  const [openMenu, setOpenMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [form, setForm] = useState({ nom: "", email: "", type: "", message: "", titre: "", nom_eglise: "", note: 0 });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hoveredStar, setHoveredStar] = useState(0);
  const [lang, setLang] = useState("fr");
  const pathname = usePathname();

  const t = translations[lang];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleSubmit = async () => {
    if (!form.nom || !form.email || !form.type || !form.message) {
      setError(t.errorRequired);
      return;
    }
    if (form.type === "temoignage" && (!form.titre || !form.nom_eglise || !form.note)) {
      setError(t.errorTemoignage);
      return;
    }
    setError("");
    setLoading(true);
    try {
      const payload = {
        nom: form.nom,
        email: form.email,
        type: form.type,
        message: form.message,
        titre: form.type === "temoignage" ? form.titre : null,
        nom_eglise: form.type === "temoignage" ? form.nom_eglise : null,
        note: form.type === "temoignage" ? form.note : null,
      };
      const { error: insertError } = await supabase.from("contact").insert([payload]);
      if (insertError) throw insertError;
      setSent(true);
    } catch (err) {
      setError(t.errorServer);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%", background: "rgba(255,255,255,0.07)", border: "0.5px solid rgba(255,255,255,0.18)",
    borderRadius: "10px", padding: "10px 14px", color: "#fff", fontSize: "14px", outline: "none", boxSizing: "border-box",
  };

  const labelStyle = {
    display: "block", color: "rgba(255,255,255,0.5)", fontSize: "12px",
    letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "7px",
  };

  const socialLinks = [
    {
      label: "Email", href: "mailto:support@soultrack.org",
      icon: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="M2 7l10 7 10-7" /></svg>),
    },
    {
      label: "WhatsApp", href: "https://wa.me/2305973188",
      icon: (<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>),
    },
    {
      label: "TikTok", href: "https://tiktok.com/@soultrack",
      icon: (<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z"/></svg>),
    },
    {
      label: "Facebook", href: "https://facebook.com/soultrack",
      icon: (<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>),
    },
    {
      label: "LinkedIn", href: "https://linkedin.com/company/soultrack",
      icon: (<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>),
    },
  ];

  const successInfo = t.successMessages[form.type] || t.successMessages.question;

  return (
    <div style={{ background: "#333699", minHeight: "100vh", position: "relative" }}>

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

          
                      {/* Switcher langue */}
<div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
  <button onClick={() => setLang("fr")} title="Français" style={{ background: "none", border: "none", cursor: "pointer", padding: 0, opacity: lang === "fr" ? 1 : 0.45, transition: "opacity 0.2s" }}>
    <img src="https://flagcdn.com/w40/fr.png" srcSet="https://flagcdn.com/w80/fr.png 2x" width="32" height="22" alt="Français" style={{ display: "block", borderRadius: "3px" }} />
  </button>
  <button onClick={() => setLang("en")} title="English" style={{ background: "none", border: "none", cursor: "pointer", padding: 0, opacity: lang === "en" ? 1 : 0.45, transition: "opacity 0.2s" }}>
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
      <section style={{ textAlign: "center", padding: "70px 24px 40px", position: "relative", zIndex: 1 }}>
        <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "14px" }}>{t.heroLabel}</p>
        <h1 style={{ color: "#fff", fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 500, lineHeight: 1.15, maxWidth: "600px", margin: "0 auto 20px" }}>
          {t.heroTitle} <span style={{ color: "#fbbf24" }}>{t.heroHighlight}</span>
        </h1>
        <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "clamp(0.9rem, 1.8vw, 1rem)", maxWidth: "560px", margin: "0 auto", lineHeight: 1.8 }}>
          {t.heroPara}
          <br />
          <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.92em" }}>{t.heroSub}</span>
        </p>
      </section>

      {/* ───── FORMULAIRE ───── */}
      <section style={{ padding: "20px 24px 20px", position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: "600px", margin: "0 auto" }}>
          <div style={{
            background: "rgba(255,255,255,0.08)", border: "0.5px solid rgba(255,255,255,0.12)",
            borderRadius: "20px", padding: "36px 32px", position: "relative", overflow: "hidden", backdropFilter: "blur(8px)",
          }}>
            <div style={{ position: "absolute", top: 0, left: "32px", right: "32px", height: "1px", background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)" }} />

            {sent ? (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <div style={{ fontSize: "48px", marginBottom: "16px" }}>{successInfo.icon}</div>
                <h3 style={{ color: "#fff", fontSize: "20px", fontWeight: 600, marginBottom: "12px" }}>{successInfo.title}</h3>
                <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "14px", lineHeight: 1.8, maxWidth: "380px", margin: "0 auto" }}>{successInfo.text}</p>
                <button onClick={() => { setSent(false); setForm({ nom: "", email: "", type: "", message: "", titre: "", nom_eglise: "", note: 0 }); setHoveredStar(0); }}
                  style={{ marginTop: "28px", background: "transparent", color: "rgba(255,255,255,0.7)", border: "0.5px solid rgba(255,255,255,0.25)", padding: "8px 20px", borderRadius: "8px", fontSize: "13px", cursor: "pointer" }}>
                  {t.btnSendAnother}
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "18px", position: "relative", zIndex: 1 }}>

                {/* Nom + Email */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }} className="form-row">
                  {[
                    { key: "nom", label: t.fieldName, placeholder: t.fieldNamePlaceholder, type: "text" },
                    { key: "email", label: t.fieldEmail, placeholder: t.fieldEmailPlaceholder, type: "email" },
                  ].map((f) => (
                    <div key={f.key}>
                      <label style={labelStyle}>{f.label}</label>
                      <input
                        type={f.type} placeholder={f.placeholder} value={form[f.key]}
                        onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                        style={inputStyle}
                        onFocus={e => e.target.style.borderColor = "rgba(255,255,255,0.45)"}
                        onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.18)"}
                      />
                    </div>
                  ))}
                </div>

                {/* Type de message */}
                <div>
                  <label style={labelStyle}>{t.fieldType}</label>
                  <select
                    value={form.type}
                    onChange={e => setForm({ ...form, type: e.target.value, titre: "", nom_eglise: "", note: 0 })}
                    style={{
                      width: "100%", background: "rgba(30,35,100,0.85)", border: "0.5px solid rgba(255,255,255,0.18)",
                      borderRadius: "10px", padding: "10px 14px", color: form.type ? "#fff" : "rgba(255,255,255,0.3)",
                      fontSize: "14px", outline: "none", cursor: "pointer", appearance: "none",
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='rgba(255,255,255,0.4)' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
                      backgroundRepeat: "no-repeat", backgroundPosition: "right 14px center",
                    }}
                    onFocus={e => e.target.style.borderColor = "rgba(255,255,255,0.45)"}
                    onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.18)"}
                  >
                    <option value="" disabled style={{ background: "#333699" }}>{t.fieldTypePlaceholder}</option>
                    <option value="amelioration" style={{ background: "#333699", color: "#fff" }}>{t.typeAmelioration}</option>
                    <option value="question" style={{ background: "#333699", color: "#fff" }}>{t.typeQuestion}</option>
                    <option value="temoignage" style={{ background: "#333699", color: "#fff" }}>{t.typeTemoignage}</option>
                  </select>
                </div>

                {/* Champs supplémentaires Témoignage */}
                {form.type === "temoignage" && (
                  <>
                    <div>
                      <label style={labelStyle}>{t.fieldTitre}</label>
                      <input type="text" placeholder={t.fieldTitrePlaceholder} value={form.titre}
                        onChange={e => setForm({ ...form, titre: e.target.value })} style={inputStyle}
                        onFocus={e => e.target.style.borderColor = "rgba(255,255,255,0.45)"}
                        onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.18)"}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>{t.fieldEglise}</label>
                      <input type="text" placeholder={t.fieldEglisePlaceholder} value={form.nom_eglise}
                        onChange={e => setForm({ ...form, nom_eglise: e.target.value })} style={inputStyle}
                        onFocus={e => e.target.style.borderColor = "rgba(255,255,255,0.45)"}
                        onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.18)"}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>{t.fieldNote}</label>
                      <div style={{ display: "flex", gap: "8px" }}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span key={star} onClick={() => setForm({ ...form, note: star })}
                            onMouseEnter={() => setHoveredStar(star)} onMouseLeave={() => setHoveredStar(0)}
                            style={{
                              fontSize: "32px", cursor: "pointer", transition: "transform 0.15s",
                              transform: (hoveredStar || form.note) >= star ? "scale(1.2)" : "scale(1)",
                              color: (hoveredStar || form.note) >= star ? "#fbbf24" : "rgba(255,255,255,0.2)",
                              userSelect: "none",
                            }}>★</span>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Message */}
                <div>
                  <label style={labelStyle}>{t.fieldMessage}</label>
                  <textarea
                    maxLength={form.type === "temoignage" ? 120 : undefined}
                    placeholder={
                      form.type === "amelioration" ? t.placeholderAmelioration :
                      form.type === "question" ? t.placeholderQuestion :
                      form.type === "temoignage" ? t.placeholderTemoignage :
                      t.placeholderDefault
                    }
                    rows={5} value={form.message}
                    onChange={e => setForm({ ...form, message: e.target.value })}
                    style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }}
                    onFocus={e => e.target.style.borderColor = "rgba(255,255,255,0.45)"}
                    onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.18)"}
                  />
                  {form.type === "temoignage" && (
                    <div style={{ textAlign: "right", fontSize: "12px", color: "rgba(255,255,255,0.5)" }}>
                      {form.message.length}/120
                    </div>
                  )}
                </div>

                {error && <p style={{ color: "#fca5a5", fontSize: "13px", textAlign: "center", margin: 0 }}>{error}</p>}

                <div style={{ display: "flex", justifyContent: "center" }}>
                  <button onClick={handleSubmit} disabled={loading}
                    style={{
                      background: loading ? "rgba(255,255,255,0.5)" : "#fff", color: "#333699", border: "none",
                      padding: "13px 36px", borderRadius: "10px", fontSize: "15px",
                      fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", transition: "opacity 0.2s",
                    }}
                    onMouseEnter={e => { if (!loading) e.currentTarget.style.opacity = "0.9"; }}
                    onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}
                  >
                    {loading ? t.btnSending : t.btnSend}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ───── RÉSEAUX SOCIAUX ───── */}
      <section style={{ padding: "32px 24px 80px", position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "40px", flexWrap: "wrap" }}>
          {socialLinks.map((s) => (
            <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" title={s.label}
              style={{ color: "#fff", display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", textDecoration: "none", transition: "opacity 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.opacity = "0.6"}
              onMouseLeave={e => e.currentTarget.style.opacity = "1"}
            >
              {s.icon}
              <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", letterSpacing: "0.06em" }}>{s.label}</span>
            </a>
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
        body { overflow-x: hidden; }
        input::placeholder, textarea::placeholder { color: rgba(255,255,255,0.25); }
        @media (max-width: 768px) {
          .nav-hide { display: none !important; }
          .nav-show { display: flex !important; }
        }
        @media (max-width: 480px) {
          .form-row { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
