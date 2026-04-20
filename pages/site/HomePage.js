"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import supabase from "../../lib/supabaseClient";

import { Great_Vibes } from "next/font/google";
const greatVibes = Great_Vibes({
  subsets: ["latin"],
  weight: "400",
});

export default function HomePage() {
  const router = useRouter();
  const [openMenu, setOpenMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const fadeRefs = useRef([]);
  const pathname = usePathname();

  const [testimonials, setTestimonials] = useState([]);

  const CARD_WIDTH = 300;
  const GAP = 16;
  const STEP = CARD_WIDTH + GAP;
  const max = testimonials.length || 1;
  const looped = testimonials.length
  ? [...testimonials, ...testimonials, ...testimonials]
  : [];
  const [tIndex, setTIndex] = useState(max);
  const trackRef = useRef(null);
  const animating = useRef(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    fadeRefs.current.forEach((el) => {
      if (!el) return;
      el.style.opacity = "0";
      el.style.transform = "translateY(24px)";
      el.style.transition = "opacity 0.55s ease, transform 0.55s ease";
    });
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.style.opacity = "1";
            e.target.style.transform = "translateY(0)";
          }
        });
      },
      { threshold: 0.1 }
    );
    fadeRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (animating.current) return;
      setTIndex((prev) => prev - 1);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (tIndex <= 0) {
      animating.current = true;
      setTimeout(() => {
        if (trackRef.current) {
          trackRef.current.style.transition = "none";
          setTIndex(max);
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              if (trackRef.current) {
                trackRef.current.style.transition = "transform 700ms ease-in-out";
              }
              animating.current = false;
            });
          });
        }
      }, 720);
    }
  }, [tIndex]);

  useEffect(() => {
  const fetchTestimonials = async () => {
    const { data, error } = await supabase
      .from("contact")
      .select("*")
      .eq("type", "temoignage")
      .eq("status", "approved") // 🔥 IMPORTANT
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erreur témoignages:", error);
      return;
    }

    const formatted = data.map((t) => ({
  id: t.id,
  title: t.titre || "",
  name: t.nom,
  church: t.nom_eglise,
  message: t.message,
  note: t.note || 5, 
}));

    setTestimonials(formatted);
  };

  fetchTestimonials();
}, []);

  const addRef = (el) => {
    if (el && !fadeRefs.current.includes(el)) fadeRefs.current.push(el);
  };

  const features = [
    { icon: "🧭", title: "Membres Hub", desc: "Une vue centralisée de chaque membre pour suivre son parcours, son engagement et son évolution. Toutes les informations essentielles sont regroupées pour garder une vision claire du troupeau et agir au bon moment.", accent: "rgba(55,138,221,0.5)" },
    { icon: "✝️", title: "Évangélisation Hub", desc: "Regroupe les nouvelles âmes, les décisions, les suivis et les baptêmes. Permet de ne laisser aucun contact sans accompagnement et d'assurer une progression spirituelle structurée.", accent: "rgba(127,119,221,0.5)" },
    { icon: "🏠", title: "Cellules Hub", desc: "Organise les groupes, les responsables et les présences hebdomadaires. Donne une vision vivante de la dynamique des cellules et aide à maintenir la connexion et la croissance.", accent: "rgba(29,158,117,0.45)" },
    { icon: "🤝", title: "Conseillers Hub", desc: "Offre un suivi personnalisé par responsable. Chaque conseiller peut accompagner, noter, discerner les besoins et intervenir de manière ciblée sur les membres qui lui sont confiés.", accent: "rgba(239,159,39,0.4)" },
    { icon: "📊", title: "Rapports Hub", desc: "Analyse toutes les données du ministère pour en ressortir des indicateurs clairs. Aide à prendre des décisions stratégiques basées sur des faits concrets et mesurables.", accent: "rgba(93,202,165,0.45)" },
    { icon: "⚙️", title: "Admin Hub", desc: "Pilote l'ensemble de la structure : gestion des accès, organisation interne et configuration de l'église. Assure une base solide, cohérente et alignée pour tout le système.", accent: "rgba(212,83,126,0.4)" },
  ];

  const navItems = [
    { label: "Accueil", path: "/site/HomePage" },
    { label: "Fonctionnement", path: "/site/Fonctionnement" },
    { label: "À propos", path: "/site/about" },
    { label: "Pricing", path: "/site/pricing" },
    { label: "Contact", path: "/site/contact" },
  ];

  const offset = -(tIndex * STEP) + CARD_WIDTH + GAP;

  const renderStars = (note = 5) => {
  return "⭐".repeat(note);
};

  return (
    <div style={{ background: "#333699", minHeight: "100vh", position: "relative" }}>

      {/* GLOW 1 — hero */}
      <div style={{
        position: "absolute",
        width: "800px", height: "800px", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(255,255,255,0.13) 0%, rgba(255,255,255,0.04) 40%, transparent 65%)",
        top: "80px", left: "50%", transform: "translateX(-50%)",
        pointerEvents: "none", zIndex: 0,
      }} />

      {/* GLOW 2 — section modules */}
      <div style={{
        position: "absolute",
        width: "700px", height: "700px", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(251,191,36,0.08) 0%, rgba(255,255,255,0.03) 40%, transparent 65%)",
        top: "900px", left: "50%", transform: "translateX(-50%)",
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

      {/* ───── HERO ───── */}
      <section style={{
        minHeight: "460px",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        textAlign: "center",
        padding: "80px 24px 70px",
        position: "relative",
        zIndex: 1,
      }}>
        {/* 3. marginBottom 35→50 */}
        <p style={{ position: "relative", zIndex: 1, color: "#fff", fontSize: "16px", maxWidth: "500px", lineHeight: 1.7, marginBottom: "50px" }}>
          Prendre soin d'une église, c'est veiller sur chaque âme avec attention, discernement et fidélité, afin qu'aucune ne se perde en chemin.
        </p>

        {/* 4. marginBottom 35→50 */}
        <h1 style={{ position: "relative", zIndex: 1, fontSize: "clamp(2rem, 5vw, 3.2rem)", fontWeight: 500, color: "#fff", lineHeight: 1.15, maxWidth: "680px", marginBottom: "50px" }}>
          Pilotez votre église avec <span style={{ color: "#fbbf24" }}>clarté</span> et précision
        </h1>

        <p style={{ position: "relative", zIndex: 1, color: "#fff", fontSize: "16px", maxWidth: "500px", lineHeight: 1.7, marginBottom: "50px" }}>
          Connecte toutes les dimensions de votre ministère pour transformer des données dispersées en une vision claire et actionnable.
        </p>

        <div style={{ position: "relative", zIndex: 1, marginBottom: "5px" }}>
          <button onClick={() => router.push("/comment-ca-marche")} style={{ background: "transparent", color: "rgba(255,255,255,0.8)", border: "0.5px solid rgba(255,255,255,0.35)", padding: "2px 28px", borderRadius: "10px", fontSize: "15px", cursor: "pointer" }}>
            Voir comment ça marche
          </button>
        </div>
      </section>

      {/* ───── LABEL MODULES ───── */}
      <div ref={addRef} style={{ textAlign: "center", padding: "20px 24px 20px", position: "relative", zIndex: 1 }}>
        <p style={{ color: "#fff", fontSize: "16px", padding: "50px 24px 20px", letterSpacing: "0.08em", maxWidth: "560px", margin: "0 auto 14px", lineHeight: 1.6 }}>
          Chaque espace a été conçu pour aider le berger à voir, comprendre et accompagner son troupeau avec sagesse, amour et vision.
        </p>
        <h2 style={{ color: "#fbbf24", fontSize: "clamp(1.4rem, 3vw, 1.9rem)", fontWeight: 500, maxWidth: "500px", margin: "0 auto", lineHeight: 1.3 }}>
          Une structure complète pour accompagner chaque âme
        </h2>
      </div>

      {/* ───── CARDS MODULES ───── */}
      <section style={{ padding: "24px 24px 48px", position: "relative", zIndex: 1 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px", maxWidth: "1050px", margin: "0 auto" }}>
          {features.map((f, i) => (
            <div key={i} ref={addRef}
              style={{ background: "rgba(255,255,255,0.08)", border: "0.5px solid rgba(255,255,255,0.12)", borderRadius: "18px", padding: "28px 24px", position: "relative", overflow: "hidden", backdropFilter: "blur(8px)", cursor: "default", transition: "transform 0.25s, border-color 0.25s, background 0.25s" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-5px)"; e.currentTarget.style.background = "rgba(255,255,255,0.13)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; }}
            >
              <div style={{ position: "absolute", top: "-40px", left: "-40px", width: "180px", height: "180px", borderRadius: "50%", background: `radial-gradient(circle, ${f.accent} 0%, transparent 70%)`, pointerEvents: "none", zIndex: 0 }} />
              <div style={{ position: "absolute", top: 0, left: "24px", right: "24px", height: "1px", background: `linear-gradient(90deg, transparent, ${f.accent}, transparent)` }} />
              <div style={{ position: "relative", zIndex: 1 }}>
                <span style={{ fontSize: "24px", display: "block", marginBottom: "16px" }}>{f.icon}</span>
                <h3 style={{ color: "#fff", fontSize: "15px", fontWeight: 500, marginBottom: "10px" }}>{f.title}</h3>
                <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "13.5px", lineHeight: 1.7 }}>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ───── TÉMOIGNAGES ───── */}
      <section style={{ padding: "40px 0 80px", position: "relative", zIndex: 1 }}>
        <div style={{
          position: "absolute", width: "700px", height: "700px", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 65%)",
          top: "50%", left: "50%", transform: "translate(-50%, -50%)",
          pointerEvents: "none", zIndex: 0,
        }} />

        <div ref={addRef} style={{ textAlign: "center", marginBottom: "40px", position: "relative", zIndex: 1 }}>
          <h2 style={{ color: "#fbbf24", fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 500, maxWidth: "480px", margin: "0 auto", lineHeight: 1.3 }}>
            Ce que disent les responsables
          </h2>
        </div>

        <div style={{ position: "relative", maxWidth: `${CARD_WIDTH * 3 + GAP * 2}px`, margin: "0 auto", overflow: "hidden", zIndex: 1 }}>
          <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "80px", background: "linear-gradient(90deg, #333699, transparent)", zIndex: 2, pointerEvents: "none" }} />
          <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: "80px", background: "linear-gradient(270deg, #333699, transparent)", zIndex: 2, pointerEvents: "none" }} />

          <div ref={trackRef} style={{ display: "flex", gap: `${GAP}px`, transform: `translateX(${offset}px)`, transition: "transform 700ms ease-in-out", alignItems: "center", padding: "24px 0" }}>
            {looped.map((t, i) => {
  const isCenter = i === tIndex;

  return (
    <div key={i} style={{
      flexShrink: 0,
      width: `${CARD_WIDTH}px`,
      transition: "transform 0.5s ease, opacity 0.5s ease",
      transform: isCenter ? "scale(1.08)" : "scale(0.92)",
      opacity: isCenter ? 1 : 0.5,
    }}>
      
      <div style={{
        <div
  style={{
    background: isCenter ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.06)",
    border: isCenter ? "0.5px solid rgba(255,255,255,0.35)" : "0.5px solid rgba(255,255,255,0.1)",
    borderRadius: "18px",
    padding: "28px 24px",
    position: "relative",
    overflow: "hidden",
    backdropFilter: "blur(8px)",
  }}
>
  {isCenter && (
    <div style={{ position: "absolute", top: 0, left: "24px", right: "24px", height: "1px", background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)" }} />
  )}

  {isCenter && (
    <div style={{ position: "absolute", top: "-30px", left: "-30px", width: "140px", height: "140px", borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)", pointerEvents: "none" }} />
  )}

  <p style={{
    color: isCenter ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.4)",
    fontSize: "13px",
    lineHeight: 1.7,
    fontStyle: "italic",
    textAlign: "center",
    marginBottom: "18px",
  }}>
    "{t.message}"
  </p>

  {/* TITRE + NOM */}
  <div style={{ textAlign: "center", marginBottom: "6px" }}>
    <div style={{ color: "#fff", fontSize: "14px", fontWeight: 600 }}>
      {t.title ? `${t.title} ${t.name}` : t.name}
    </div>
  </div>

  {/* EGLISE */}
  <div style={{
    color: "#ffffff",
    fontSize: "15px",
    fontWeight: 600,
    marginBottom: "10px",
    letterSpacing: "0.3px",
    textAlign: "center"
  }}>
    {t.church}
  </div>

  {/* STARS */}
  <div style={{ textAlign: "center" }}>
    <div style={{ fontSize: "14px" }}>
      {renderStars(t.note)}
    </div>
  </div>
</div>

        <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginTop: "36px", position: "relative", zIndex: 1 }}>
          {testimonials.map((_, i) => (
            <div key={i} style={{
              width: (tIndex % max) === i ? "20px" : "6px",
              height: "6px", borderRadius: "3px",
              background: (tIndex % max) === i ? "#fff" : "rgba(255,255,255,0.25)",
              transition: "width 0.3s ease, background 0.3s ease",
            }} />
          ))}
        </div>
      </section>

      {/* ───── CTA ───── */}
      <section ref={addRef} style={{ borderTop: "0.5px solid rgba(255,255,255,0.15)", padding: "60px 24px", textAlign: "center", position: "relative", zIndex: 1 }}>
        <h2 style={{ color: "#fff", fontSize: "clamp(1.6rem, 3vw, 2.2rem)", fontWeight: 500, marginBottom: "12px" }}>
          Commencez dès aujourd'hui
        </h2>
        <p style={{ color: "rgba(255,255,255,0.6)", maxWidth: "400px", margin: "0 auto 28px", lineHeight: 1.7, fontSize: "15px" }}>
          SoulTrack vous donne une vision vivante et stratégique pour guider votre église avec précision.
        </p>
        <button onClick={() => router.push("/SignupEglise")} style={{ background: "#fff", color: "#fbbf24", border: "none", padding: "14px 36px", borderRadius: "10px", fontSize: "16px", fontWeight: 600, cursor: "pointer" }}>
          Démarrer SoulTrack →
        </button>
      </section>

      {/* ───── FOOTER ───── */}
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
