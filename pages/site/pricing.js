"use client";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";

import { Great_Vibes } from "next/font/google";
const greatVibes = Great_Vibes({
  subsets: ["latin"],
  weight: "400",
});

export default function PricingPage() {
  const router = useRouter();
  const [openMenu, setOpenMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navItems = [
    { label: "Accueil", path: "/site/HomePage" },
    { label: "Fonctionnement", path: "/site/Fonctionnement" },
    { label: "À propos", path: "/site/about" },
    { label: "Pricing", path: "/site/pricing" },
    { label: "Contact", path: "/site/contact" },
  ];

  const plans = [
    {
      name: "Départ",
      emoji: "🌱",
      range: "0 – 50 membres",
      price: "Gratuit",
      accent: "rgba(29,158,117,0.45)",
      features: [
        "Ajouter et gérer les membres",
        "Ajouter des personnes évangélisées",
        "Liste des évangélisés",
        "Rapports présence et Statistiques",        
        "Jusqu’à 3 utilisateurs en plus de l’admin",
            ],
          },

    
          {
      name: "Croissance",
      emoji: "📈",
      range: "51 – 300 membres",
      price: "$29/mois",
      accent: "rgba(55,138,221,0.5)",
      features: [
        "✔ Tout dans Départ",
        "📊 Rapports",
        "🧭 Conseillers",
      ],
    },
    {
      name: "Vision",
      emoji: "🔥",
      range: "301 – 1000 membres",
      price: "$59/mois",
      accent: "rgba(251,191,36,0.4)",
      features: [
        "✔ Tout dans Croissance",
        "📈 Statistiques avancées",
        "⚙️ Organisation complète",
      ],
    },
    {
      name: "Expansion",
      emoji: "🌍",
      range: "1000+ membres",
      price: "Sur mesure",
      accent: "rgba(212,83,126,0.4)",
      features: [
        "⚙ Plan personnalisé",
        "🤝 Support dédié",
        "🏢 Multi-branches",
      ],
    },
  ];

  return (
    <div style={{ background: "#333699", minHeight: "100vh", position: "relative" }}>

      {/* GLOW */}
      <div style={{
        position: "absolute",
        width: "800px", height: "800px", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(255,255,255,0.13) 0%, rgba(255,255,255,0.04) 40%, transparent 65%)",
        top: "80px", left: "50%", transform: "translateX(-50%)",
        pointerEvents: "none", zIndex: 0,
      }} />

      <div style={{
        position: "absolute",
        width: "600px", height: "600px", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(251,191,36,0.07) 0%, rgba(255,255,255,0.02) 40%, transparent 65%)",
        top: "600px", left: "50%", transform: "translateX(-50%)",
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
            maxWidth: "1100px",
            margin: "0 auto",
            padding: "22px 24px",
            height: "88px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}>
        
            {/* LOGO */}
            <div onClick={() => router.push("/site/HomePage")} style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", zIndex: 1, flexShrink: 0 }}>
              <Image src="/logo.png" alt="SoulTrack" width={50} height={50} />
              <span style={{ color: "#fff", fontSize: "22px", fontWeight: 500, fontFamily: "'Great Vibes', cursive" }}>SoulTrack</span>
            </div>
        
            {/* NAV */}
            <nav style={{ display: "flex", alignItems: "center", gap: "32px", zIndex: 1 }}>
              {navItems.map((item) => (
                <span key={item.path} onClick={() => router.push(item.path)}
                  style={{ color: pathname === item.path ? "#fbbf24" : "#fff", fontSize: "14px", fontWeight: 600, cursor: "pointer", transition: "color 0.2s" }}
                  onMouseEnter={e => e.currentTarget.style.color = "#fff"}
                  onMouseLeave={e => e.currentTarget.style.color = pathname === item.path ? "#fbbf24" : "#fff"}
                  className="nav-hide"
                >{item.label}</span>
              ))}
            </nav>
        
            {/* BOUTONS */}
            <div style={{ display: "flex", gap: "10px", alignItems: "center", zIndex: 1, flexShrink: 0 }} className="nav-hide">
              <button onClick={() => router.push("/login")} style={{ background: "transparent", color: "#fbbf24", border: "0.5px solid rgba(255,255,255,0.35)", padding: "7px 18px", borderRadius: "8px", fontSize: "14px", cursor: "pointer" }}>
                Connexion
              </button>
              <button onClick={() => router.push("/SignupEglise")} style={{ background: "#fff", color: "#333699", border: "none", padding: "7px 18px", borderRadius: "8px", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}>
                Créer mon église
              </button>
            </div>
        
            {/* HAMBURGER */}
            <button onClick={() => setOpenMenu(!openMenu)} className="nav-show" style={{ background: "none", border: "none", cursor: "pointer", display: "none", flexDirection: "column", gap: "5px", padding: "4px", zIndex: 1 }}>
              {[0, 1, 2].map(i => (
                <span key={i} style={{
                  display: "block", width: "22px", height: "1.5px", background: "rgba(255,255,255,0.85)", borderRadius: "2px", transition: "transform 0.2s, opacity 0.2s",
                  transform: openMenu ? i === 0 ? "rotate(45deg) translate(5px, 5px)" : i === 2 ? "rotate(-45deg) translate(5px, -5px)" : "scaleX(0)" : "none",
                  opacity: openMenu && i === 1 ? 0 : 1,
                }} />
              ))}
            </button>
          </div>
        
          {openMenu && (
            <div style={{ background: "#333699", borderTop: "0.5px solid rgba(255,255,255,0.15)", padding: "20px 24px 28px", display: "flex", flexDirection: "column", gap: "20px" }}>
              {navItems.map((item) => (
                <span key={item.path} onClick={() => { router.push(item.path); setOpenMenu(false); }}
                  style={{ color: pathname === item.path ? "#fbbf24" : "#fff", fontSize: "15px", fontWeight: 600, cursor: "pointer" }}>{item.label}</span>
              ))}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "4px" }}>
                <button onClick={() => router.push("/login")} style={{ background: "transparent", color: "#fff", border: "0.5px solid rgba(255,255,255,0.35)", padding: "11px", borderRadius: "8px", fontSize: "14px", cursor: "pointer" }}>Connexion</button>
                <button onClick={() => router.push("/SignupEglise")} style={{ background: "#fff", color: "#333699", border: "none", padding: "11px", borderRadius: "8px", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}>Créer mon église</button>
              </div>
            </div>
          )}
        </header>

      {/* HERO */}
      <section style={{ textAlign: "center", padding: "60px 24px 40px", position: "relative", zIndex: 1 }}>        

        <h1 style={{ color: "#fff", fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 500, marginBottom: "10px" }}>
          Une structure adaptée à votre <span style={{ color: "#fbbf24" }}>croissance</span>
        </h1>

        <p style={{ color: "rgba(255,255,255,0.6)", maxWidth: "500px", margin: "0 auto", lineHeight: 1.7 }}>
          Chaque étape du ministère nécessite un niveau de structure différent. SoulTrack évolue avec votre église.
        </p>
      </section>

      {/* PLANS */}
      <section style={{ padding: "40px 24px 100px", position: "relative", zIndex: 1 }}>
        <div style={{
          maxWidth: "1100px",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "20px",
        }}>
          {plans.map((plan, i) => (
            <div key={i} style={{
              background: "rgba(255,255,255,0.08)",
              border: "0.5px solid rgba(255,255,255,0.12)",
              borderRadius: "20px",
              padding: "28px 24px",
              position: "relative",
              backdropFilter: "blur(8px)",

              display: "flex",
              flexDirection: "column",
              alignItems: "left,   // 👉 centre horizontalement
              textAlign: "left"
              
            }}>
              <div style={{
                position: "center",
                top: "-40px",
                left: "-40px",
                width: "160px",
                height: "160px",
                borderRadius: "50%",
                background: `radial-gradient(circle, ${plan.accent} 0%, transparent 70%)`,
              }} />

              <h3 style={{ color: "#fff", fontSize: "18px", marginBottom: "6px" }}>
                {plan.emoji} {plan.name}
              </h3>

              <p style={{ color: "#fff", fontSize: "13px", marginBottom: "14px",  opacity: 0.85 }}> {plan.range}</p>
              <div style={{color: "#fbbf24", fontSize: "22px", fontWeight: 500, marginBottom: "18px"}}> {plan.price}</div>
              <ul style={{
                listStyle: "none",
                padding: 0,
                marginBottom: "22px",
                width: "100%"
              }}>
                {plan.features.map((f, idx) => (
                  <li key={idx} style={{
                    color: "#fff",
                    fontSize: "14.5px",
                    lineHeight: 1.8,
                    padding: "10px 0",
                    textAlign: "left",
              
                    borderBottom: idx !== plan.features.length - 1
                      ? "1px solid rgba(255,255,255,0.12)" // 👈 ligne grise
                      : "none"
                  }}>
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => router.push("/SignupEglise")}
                style={{
                  background: "#fff",
                  color: "#333699",
                  padding: "10px 20px",
                  borderRadius: "10px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Commencer →
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: "0.5px solid rgba(255,255,255,0.1)", padding: "20px 24px" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", textAlign: "center", color: "rgba(255,255,255,0.35)", fontSize: "14px" }}>
          © {new Date().getFullYear()} SoulTrack. Tous droits réservés.
        </div>
      </footer>

      <style>{`
        body { overflow-x: hidden; }
        @media (max-width: 768px) {
          .nav-hide { display: none !important; }
          .nav-show { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
