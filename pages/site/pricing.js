"use client";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { useLang } from "../../hooks/useLang";
import supabase from "../../lib/supabaseClient";

import { Great_Vibes } from "next/font/google";
const greatVibes = Great_Vibes({ subsets: ["latin"], weight: "400" });

const translations = {
  fr: {
    login: "Connexion",
    signup: "Créer mon église",
    webVersion: "Version web",
    logout: "Déconnexion",
    nav: [
      { label: "Accueil",        path: "/site/HomePage" },
      { label: "Fonctionnement", path: "/site/Fonctionnement" },
      { label: "À propos",       path: "/site/about" },
      { label: "Pricing",        path: "/site/pricing" },
      { label: "Contact",        path: "/site/contact" },
    ],
    heroTitle:     "Une structure adaptée à votre",
    heroHighlight: "croissance",
    heroSub:       "Choisissez votre plan et on commence.",
    heroPara:      "Chaque étape du ministère nécessite un niveau de structure différent. SoulTrack évolue avec votre église.",
    btnStart:      "Commencer →",
    btnContact:    "Nous contacter →",
    perMonth:      "/mois",
    save:          "Économie",
    billedEvery6:  "Facturé tous les 6 mois",
    billedYearly:  "Facturé annuellement",
    footer:        "Tous droits réservés.",
    forever:       "Pour toujours",
    contactUs:     "Contactez-nous",
    plans: [
      {
        id: "free", name: "Départ", emoji: "🌱",
        range: "0 – 50 membres", price: "Gratuit",
        accent: "rgba(29,158,117,0.45)", color: "#10b981",
        durees: null,
      },
      {
        id: "starter", name: "Croissance", emoji: "📈",
        range: "51 – 200 membres", price: "$19", color: "#3b82f6",
        accent: "rgba(55,138,221,0.5)", popular: true,
        durees: [
          { id: "6m", label: "6 mois", total: 99,  save: 15  },
          { id: "1a", label: "1 an",   total: 179, save: 49  },
        ],
      },
      {
        id: "vision", name: "Vision", emoji: "🔥",
        range: "201 – 500 membres", price: "$39", color: "#f59e0b",
        accent: "rgba(251,191,36,0.4)",
        durees: [
          { id: "6m", label: "6 mois", total: 199, save: 35  },
          { id: "1a", label: "1 an",   total: 359, save: 109 },
        ],
      },
      {
        id: "expansion", name: "Expansion", emoji: "🌍",
        range: "501 – 1500 membres", price: "$79", color: "#8b5cf6",
        accent: "rgba(212,83,126,0.4)",
        durees: [
          { id: "6m", label: "6 mois", total: 399, save: 75  },
          { id: "1a", label: "1 an",   total: 719, save: 229 },
        ],
      },
      {
        id: "enterprise", name: "Réseaux", emoji: "🔗",
        range: "1500+ • Multi-églises", price: "Sur mesure",
        accent: "rgba(139,92,246,0.45)", color: "#ec4899",
        durees: null,
      },
    ],
  },
  en: {
    login:    "Log in",
    signup:   "Create my church",
    webVersion: "Web version",
    logout: "Log out",
    nav: [
      { label: "Home",         path: "/site/HomePage" },
      { label: "How it works", path: "/site/Fonctionnement" },
      { label: "About",        path: "/site/about" },
      { label: "Pricing",      path: "/site/pricing" },
      { label: "Contact",      path: "/site/contact" },
    ],
    heroTitle:     "A structure adapted to your",
    heroHighlight: "growth",
    heroSub:       "Choose your plan and let's get started.",
    heroPara:      "Every stage of ministry requires a different level of structure. SoulTrack grows with your church.",
    btnStart:      "Get started →",
    btnContact:    "Contact us →",
    perMonth:      "/mo",
    save:          "Save",
    billedEvery6:  "Billed every 6 months",
    billedYearly:  "Billed annually",
    footer:        "All rights reserved.",
    forever:       "Forever free",
    contactUs:     "Contact us",
    plans: [
      {
        id: "free", name: "Starter", emoji: "🌱",
        range: "0 – 50 members", price: "Free",
        accent: "rgba(29,158,117,0.45)", color: "#10b981",
        durees: null,
      },
      {
        id: "starter", name: "Growth", emoji: "📈",
        range: "51 – 200 members", price: "$19", color: "#3b82f6",
        accent: "rgba(55,138,221,0.5)", popular: true,
        durees: [
          { id: "6m", label: "6 months", total: 99,  save: 15  },
          { id: "1a", label: "1 year",   total: 179, save: 49  },
        ],
      },
      {
        id: "vision", name: "Vision", emoji: "🔥",
        range: "201 – 500 members", price: "$39", color: "#f59e0b",
        accent: "rgba(251,191,36,0.4)",
        durees: [
          { id: "6m", label: "6 months", total: 199, save: 35  },
          { id: "1a", label: "1 year",   total: 359, save: 109 },
        ],
      },
      {
        id: "expansion", name: "Expansion", emoji: "🌍",
        range: "501 – 1500 members", price: "$79", color: "#8b5cf6",
        accent: "rgba(212,83,126,0.4)",
        durees: [
          { id: "6m", label: "6 months", total: 399, save: 75  },
          { id: "1a", label: "1 year",   total: 719, save: 229 },
        ],
      },
      {
        id: "enterprise", name: "Networks", emoji: "🔗",
        range: "1500+ • Multi-church", price: "Custom",
        accent: "rgba(139,92,246,0.45)", color: "#ec4899",
        durees: null,
      },
    ],
  },
};

export default function PricingPage() {
  const router   = useRouter();
  const pathname = usePathname();
  const { lang, changeLang } = useLang();

  const [openMenu, setOpenMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // ── Profil connecté ─────────────────────────────────────────────────────
  const [profile, setProfile] = useState(null);

  const t = translations[lang];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ── Profil : chargement + écoute des changements de session ────────────
  useEffect(() => {
    const loadProfile = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session) {
        setProfile(null);
        return;
      }

      const { data: profileData, error } = await supabase
        .from("profiles")
        .select("id, prenom, nom, role, roles")
        .eq("id", sessionData.session.user.id)
        .single();

      if (!error) setProfile(profileData);
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

  async function handleChoosePlan(planId, dureeId) {
    if (planId === "enterprise") {
      router.push("/site/contact?type=reseaux");
      return;
    }
    const { data: { user } } = await supabase.auth.getUser();
    const suffix = dureeId ? `&duree=${dureeId}` : "";
    if (user) {
      router.push(`/administrateur/subscription?plan=${planId}${suffix}`);
    } else {
      router.push(`/SignupEglise?plan=${planId}${suffix}`);
    }
  }

  return (
    <div style={{ background: "#333699", minHeight: "100vh", overflowX: "hidden" }}>

      {/* GLOW */}
      <div style={{ position: "fixed", width: "800px", height: "800px", borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,0.13) 0%, rgba(255,255,255,0.04) 40%, transparent 65%)", top: "80px", left: "50%", transform: "translateX(-50%)", pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "fixed", width: "600px", height: "600px", borderRadius: "50%", background: "radial-gradient(circle, rgba(251,191,36,0.07) 0%, rgba(255,255,255,0.02) 40%, transparent 65%)", top: "600px", left: "50%", transform: "translateX(-50%)", pointerEvents: "none", zIndex: 0 }} />

      {/* ───── HEADER ───── */}
      <header style={{ background: scrolled ? "rgba(51,54,153,0.92)" : "transparent", borderBottom: scrolled ? "0.5px solid rgba(255,255,255,0.15)" : "0.5px solid transparent", position: "relativey", zIndex: 100, backdropFilter: scrolled ? "blur(16px)" : "none", transition: "background 0.3s, border-color 0.3s", width: "100%" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "22px 24px", height: "88px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px", boxSizing: "border-box" }}>

          <div onClick={() => router.push("/site/HomePage")} style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", zIndex: 1, flexShrink: 0 }}>
            <Image src="/logo.png" alt="SoulTrack" width={50} height={50} />
            <span style={{ color: "#fff", fontSize: "22px", fontWeight: 500, fontFamily: "'Great Vibes', cursive" }}>SoulTrack</span>
          </div>

          <nav style={{ display: "flex", alignItems: "center", gap: "32px", zIndex: 1 }}>
            {t.nav.map((item) => (
              <span key={item.path} onClick={() => router.push(item.path)}
                style={{ color: pathname === item.path ? "#fbbf24" : "#fff", fontSize: "14px", fontWeight: 600, cursor: "pointer", transition: "color 0.2s" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
                onMouseLeave={(e) => (e.currentTarget.style.color = pathname === item.path ? "#fbbf24" : "#fff")}
                className="nav-hide"
              >{item.label}</span>
            ))}
          </nav>

          <div style={{ display: "flex", gap: "10px", alignItems: "center", zIndex: 1, flexShrink: 0 }} className="nav-hide">
            {profile ? (
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
                    padding: "7px 14px",
                    borderRadius: "8px",
                    fontSize: "14px",
                    cursor: "pointer",
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
                    padding: "7px 14px",
                    borderRadius: "8px",
                    fontSize: "14px",
                    cursor: "pointer",
                  }}
                >
                  {t.logout}
                </button>
              </>
            ) : (
              <button onClick={() => router.push("/login")} style={{ background: "transparent", color: "#fbbf24", border: "0.5px solid rgba(255,255,255,0.35)", padding: "7px 18px", borderRadius: "8px", fontSize: "14px", cursor: "pointer" }}>
                {t.login}
              </button>
            )}
          </div>

          <div style={{ display: "flex", gap: "8px", alignItems: "center", marginLeft: "8px" }}>
            <button onClick={() => changeLang("fr")} title="Français" style={{ background: "none", border: "none", cursor: "pointer", padding: 0, opacity: lang === "fr" ? 1 : 0.45, transition: "opacity 0.2s" }}>
              <img src="https://flagcdn.com/w40/fr.png" srcSet="https://flagcdn.com/w80/fr.png 2x" width="32" height="22" alt="Français" style={{ display: "block", borderRadius: "3px" }} />
            </button>
            <button onClick={() => changeLang("en")} title="English" style={{ background: "none", border: "none", cursor: "pointer", padding: 0, opacity: lang === "en" ? 1 : 0.45, transition: "opacity 0.2s" }}>
              <img src="https://flagcdn.com/w40/gb.png" srcSet="https://flagcdn.com/w80/gb.png 2x" width="32" height="22" alt="English" style={{ display: "block", borderRadius: "3px" }} />
            </button>
          </div>

          <button onClick={() => setOpenMenu(!openMenu)} className="nav-show" style={{ background: "none", border: "none", cursor: "pointer", display: "none", flexDirection: "column", gap: "5px", padding: "4px", zIndex: 1 }}>
            {[0, 1, 2].map((i) => (
              <span key={i} style={{ display: "block", width: "22px", height: "1.5px", background: "rgba(255,255,255,0.85)", borderRadius: "2px", transition: "transform 0.2s, opacity 0.2s", transform: openMenu ? i === 0 ? "rotate(45deg) translate(5px, 5px)" : i === 2 ? "rotate(-45deg) translate(5px, -5px)" : "scaleX(0)" : "none", opacity: openMenu && i === 1 ? 0 : 1 }} />
            ))}
          </button>
        </div>

        {openMenu && (
          <div style={{ background: "#333699", borderTop: "0.5px solid rgba(255,255,255,0.15)", padding: "20px 24px 28px", display: "flex", flexDirection: "column", gap: "20px" }}>
            {t.nav.map((item) => (
              <span key={item.path} onClick={() => { router.push(item.path); setOpenMenu(false); }} style={{ color: pathname === item.path ? "#fbbf24" : "#fff", fontSize: "15px", fontWeight: 600, cursor: "pointer" }}>{item.label}</span>
            ))}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "4px" }}>
              {profile ? (
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
                  <button onClick={() => { router.push("/login"); setOpenMenu(false); }} style={{ background: "transparent", color: "#fff", border: "0.5px solid rgba(255,255,255,0.35)", padding: "11px", borderRadius: "8px", fontSize: "14px", cursor: "pointer" }}>{t.login}</button>
                  <button onClick={() => { router.push("/site/pricing"); setOpenMenu(false); }} style={{ background: "#fff", color: "#333699", border: "none", padding: "11px", borderRadius: "8px", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}>{t.signup}</button>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* ───── HERO ───── */}
      <section style={{ textAlign: "center", padding: "60px max(16px, 4vw) 40px", width: "100%", boxSizing: "border-box", position: "relative", zIndex: 1 }}>
        <h1 style={{ color: "#fff", fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 500, marginBottom: "10px" }}>
          {t.heroTitle} <span style={{ color: "#fbbf24" }}>{t.heroHighlight}</span>
        </h1>
        <p style={{ color: "#fff", fontSize: "clamp(1rem, 2.5vw, 1.25rem)", fontWeight: 600, marginBottom: "12px", letterSpacing: "0.01em" }}>{t.heroSub}</p>
        <p style={{ color: "rgba(255,255,255,0.6)", maxWidth: "500px", margin: "0 auto", lineHeight: 1.7 }}>{t.heroPara}</p>
      </section>

      {/* ───── PLANS ───── */}
      <section style={{ padding: "40px 24px 100px", position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(200px, 100%), 1fr))", gap: "20px", width: "100%", alignItems: "start" }}>
          {t.plans.map((plan, i) => (
            <div key={i} style={{ background: "rgba(255,255,255,0.08)", border: plan.popular ? `2px solid ${plan.color}` : "0.5px solid rgba(255,255,255,0.12)", borderRadius: "20px", padding: plan.popular ? "42px 24px 28px" : "32px 24px 28px", position: "relative", backdropFilter: "blur(8px)", display: "flex", flexDirection: "column" }}>

              {/* GLOW accent */}
              <div style={{ position: "absolute", top: "-40px", left: "-40px", width: "160px", height: "160px", borderRadius: "50%", background: `radial-gradient(circle, ${plan.accent} 0%, transparent 70%)`, pointerEvents: "none" }} />

              {/* Badge populaire */}
              {plan.popular && (
                <div style={{ position: "absolute", top: "-12px", left: "50%", transform: "translateX(-50%)", background: plan.color, color: "#fff", fontSize: "11px", fontWeight: 600, padding: "3px 12px", borderRadius: "99px", whiteSpace: "nowrap" }}>
                  Populaire
                </div>
              )}

              {/* Emoji + Nom + Range */}
              <div style={{ fontSize: "24px", marginBottom: "8px" }}>{plan.emoji}</div>
              <h3 style={{ color: "#fff", fontSize: "18px", fontWeight: 600, margin: "0 0 4px" }}>{plan.name}</h3>
              <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "13px", margin: "0 0 16px" }}>{plan.range}</p>

              {/* Prix mensuel */}
              {plan.id === "free" || plan.id === "enterprise" ? (
                <div style={{ marginBottom: "20px" }}>
                  <p style={{ color: "#fbbf24", fontWeight: 600, fontSize: "24px", margin: "0 0 4px" }}>{plan.price}</p>
                  <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "12px", margin: 0 }}>
                    {plan.id === "free" ? t.forever : t.contactUs}
                  </p>
                </div>
              ) : (
                <div style={{ marginBottom: "14px" }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "4px", marginBottom: "12px" }}>
                    <span style={{ color: "#fbbf24", fontWeight: 600, fontSize: "24px" }}>{plan.price}</span>
                    <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px" }}>{t.perMonth}</span>
                  </div>

                  {/* Lignes durées */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {plan.durees.map((d) => (
                      <div
                        key={d.id}
                        onClick={() => handleChoosePlan(plan.id, d.id)}
                        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", borderRadius: "10px", border: `0.5px solid ${plan.color}55`, background: `${plan.color}15`, cursor: "pointer", transition: "background 0.15s" }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = `${plan.color}28`)}
                        onMouseLeave={(e) => (e.currentTarget.style.background = `${plan.color}15`)}
                      >
                        <span style={{ color: "rgba(255,255,255,0.85)", fontSize: "13px", fontWeight: 500 }}>{d.label}</span>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ color: "#fff", fontSize: "13px", fontWeight: 600 }}>${d.total}</span>
                          <span style={{ background: "rgba(16,185,129,0.2)", color: "#6ee7b7", fontSize: "11px", fontWeight: 600, padding: "2px 7px", borderRadius: "99px" }}>-${d.save}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Bouton principal */}
              <button
                onClick={() => handleChoosePlan(plan.id, null)}
                style={{ background: plan.id === "free" ? "rgba(255,255,255,0.15)" : "#fff", color: plan.id === "free" ? "#fff" : "#333699", border: plan.id === "free" ? "0.5px solid rgba(255,255,255,0.3)" : "none", padding: "10px 20px", borderRadius: "10px", fontWeight: 600, cursor: "pointer", marginTop: "auto", width: "100%", fontSize: "14px", transition: "opacity 0.2s" }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              >
                {plan.id === "enterprise" ? t.btnContact : t.btnStart}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ───── FOOTER ───── */}
      <footer style={{ borderTop: "0.5px solid rgba(255,255,255,0.1)", padding: "20px 24px", boxSizing: "border-box", width: "100%" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", textAlign: "center", color: "rgba(255,255,255,0.35)", fontSize: "14px" }}>
          <div>© {new Date().getFullYear()} SoulTrack. {t.footer}</div>
          <div style={{ marginTop: "10px", display: "flex", justifyContent: "center", gap: "16px", flexWrap: "wrap" }}>
            <span onClick={() => router.push("/site/terms")}   style={{ cursor: "pointer", textDecoration: "underline" }}>Terms</span>
            <span onClick={() => router.push("/site/privacy")} style={{ cursor: "pointer", textDecoration: "underline" }}>Privacy</span>
            <span onClick={() => router.push("/site/refund")}  style={{ cursor: "pointer", textDecoration: "underline" }}>Refund</span>
          </div>
        </div>
      </footer>

      <style>{`
        html { overflow-x: hidden; }
        body { width: 100%; }
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
