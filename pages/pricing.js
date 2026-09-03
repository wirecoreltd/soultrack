import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import Head from "next/head";
import { useLang } from "../hooks/useLang";
import supabase from "../lib/supabaseClient";
import HeaderSite from "../components/HeaderSite";

import { Great_Vibes } from "next/font/google";
const greatVibes = Great_Vibes({ subsets: ["latin"], weight: "400" });

const translations = {
  fr: {
    login: "Connexion",
    signup: "Créer mon église",
    webVersion: "Version web",
    logout: "Déconnexion",
    nav: [
      { label: "Accueil",        path: "/" },
      { label: "Fonctionnement", path: "/site/Fonctionnement" },
      { label: "À propos",       path: "/site/about" },
      { label: "Pricing",        path: "/pricing" },
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
      { label: "Home",         path: "/" },
      { label: "How it works", path: "/site/Fonctionnement" },
      { label: "About",        path: "/site/about" },
      { label: "Pricing",      path: "/pricing" },
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
  const { lang, changeLang } = useLang();

  const [openMenu, setOpenMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // ── Profil connecté ─────────────────────────────────────────────────────
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
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
      <Head>
        <title>SoulTrack Pricing</title>
        <meta name="description" content="Simple, transparent pricing that grows with your church — from small congregations to multi-church networks." />

        <meta property="og:title" content="SoulTrack Pricing" />
        <meta property="og:description" content="Simple, transparent pricing that grows with your church — from small congregations to multi-church networks." />
        <meta property="og:image" content="https://soultrack.org/logo.png" />
        <meta property="og:url" content="https://soultrack.org/pricing" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="SoulTrack" />

        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="SoulTrack Pricing" />
        <meta name="twitter:description" content="Simple, transparent pricing that grows with your church — from small congregations to multi-church networks." />
        <meta name="twitter:image" content="https://soultrack.org/logo.png" />
      </Head>

      {/* GLOW */}
      <div style={{ position: "fixed", width: "800px", height: "800px", borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,0.13) 0%, rgba(255,255,255,0.04) 40%, transparent 65%)", top: "80px", left: "50%", transform: "translateX(-50%)", pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "fixed", width: "600px", height: "600px", borderRadius: "50%", background: "radial-gradient(circle, rgba(251,191,36,0.07) 0%, rgba(255,255,255,0.02) 40%, transparent 65%)", top: "600px", left: "50%", transform: "translateX(-50%)", pointerEvents: "none", zIndex: 0 }} />

      {/* ───── HEADER ───── */}     
      <HeaderSite />

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
            <span onClick={() => router.push("/terms")}   style={{ cursor: "pointer", textDecoration: "underline" }}>Terms</span>
            <span onClick={() => router.push("/privacy")} style={{ cursor: "pointer", textDecoration: "underline" }}>Privacy</span>
            <span onClick={() => router.push("/refund")}  style={{ cursor: "pointer", textDecoration: "underline" }}>Refund</span>
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
