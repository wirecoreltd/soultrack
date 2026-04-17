"use client";

import { useEffect, useRef, useState } from "react";
import Head from "next/head";

const testimonials = [
  {
    name: "Pasteur Jean-Marc L.",
    role: "Responsable d'église — Paris",
    text: "Avant SoulTrack, je perdais le fil de dizaines de nouveaux contacts chaque mois. Aujourd'hui j'ai une vision claire de chaque âme. Aucune ne passe entre les mailles.",
    initials: "JM",
    color: "#2E3192",
  },
  {
    name: "Sœur Chantal M.",
    role: "Responsable cellule — Lyon",
    text: "La gestion de ma cellule est devenue fluide. Je sais exactement où en est chaque membre, leurs besoins, leur progression. C'est transformationnel.",
    initials: "CM",
    color: "#10b981",
  },
  {
    name: "Ancien David K.",
    role: "Coordinateur suivi — Bruxelles",
    text: "Les rapports statistiques nous ont permis d'identifier les besoins réels de notre assemblée. On prend désormais des décisions pastorales basées sur des données concrètes.",
    initials: "DK",
    color: "#f59e0b",
  },
  {
    name: "Pasteure Esther N.",
    role: "Superviseure régionale — Abidjan",
    text: "Gérer plusieurs branches simultanément était un défi immense. SoulTrack nous donne une vision globale instantanée. C'est exactement ce dont nous avions besoin.",
    initials: "EN",
    color: "#8b5cf6",
  },
  {
    name: "Frère Samuel T.",
    role: "Conseiller pastoral — Montréal",
    text: "Le suivi individuel est devenu un vrai ministère structuré. Chaque membre que j'accompagne a un historique complet, je ne perds plus aucune information.",
    initials: "ST",
    color: "#ef4444",
  },
];

const features = [
  {
    icon: "👥",
    title: "Hub Membres",
    desc: "Gérez chaque âme individuellement — historique, statut spirituel, cellule, évolution.",
    color: "#2E3192",
  },
  {
    icon: "🏠",
    title: "Hub Cellules",
    desc: "Organisez vos groupes de proximité, suivez les présences et la croissance relationnelle.",
    color: "#10b981",
  },
  {
    icon: "✝️",
    title: "Évangélisation",
    desc: "Enregistrez les conversions, baptêmes et suivez chaque nouveau contact jusqu'à l'intégration.",
    color: "#f59e0b",
  },
  {
    icon: "🧭",
    title: "Conseillers",
    desc: "Assignez des conseillers pastoraux et assurez un accompagnement humain structuré.",
    color: "#8b5cf6",
  },
  {
    icon: "📊",
    title: "Rapports & Analyses",
    desc: "Prenez des décisions stratégiques avec des données réelles sur votre troupeau.",
    color: "#ef4444",
  },
  {
    icon: "🔗",
    title: "Multi-Branches",
    desc: "Supervisez plusieurs églises et branches depuis une seule plateforme centralisée.",
    color: "#0ea5e9",
  },
];

const stats = [
  { value: "0", label: "Âmes perdues", sub: "Objectif central" },
  { value: "6", label: "Modules intégrés", sub: "En un seul système" },
  { value: "360°", label: "Vision du troupeau", sub: "Globale & détaillée" },
  { value: "∞", label: "Membres suivis", sub: "Sans limite" },
];

export default function LandingPage() {
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [isVisible, setIsVisible] = useState({});
  const intervalRef = useRef(null);
  const observerRef = useRef(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(intervalRef.current);
  }, []);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible((prev) => ({ ...prev, [entry.target.dataset.id]: true }));
          }
        });
      },
      { threshold: 0.15 }
    );

    document.querySelectorAll("[data-id]").forEach((el) => {
      observerRef.current.observe(el);
    });

    return () => observerRef.current?.disconnect();
  }, []);

  const visible = (id) => isVisible[id];

  return (
    <>
      <Head>
        <title>SoulTrack — Supervision Pastorale</title>
        <meta name="description" content="La plateforme de gestion d'église qui connecte membres, cellules, conseillers et rapports." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />
      </Head>

      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { font-family: 'DM Sans', sans-serif; background: #ffffff; color: #1a1a2e; overflow-x: hidden; }

        :root {
          --navy: #2E3192;
          --navy-dark: #1f2266;
          --emerald: #10b981;
          --gold: #f59e0b;
          --soft: #f8f9ff;
        }

        /* NAV */
        .nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          display: flex; align-items: center; justify-content: space-between;
          padding: 18px 48px;
          background: rgba(255,255,255,0.92);
          backdrop-filter: blur(16px);
          border-bottom: 1px solid rgba(46,49,146,0.08);
        }
        .nav-logo {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.8rem; font-weight: 700;
          color: var(--navy);
          letter-spacing: -0.5px;
        }
        .nav-logo span { color: var(--emerald); }
        .nav-cta {
          background: var(--navy); color: white;
          padding: 10px 24px; border-radius: 8px;
          font-size: 0.875rem; font-weight: 600;
          text-decoration: none; border: none; cursor: pointer;
          transition: background 0.2s, transform 0.15s;
        }
        .nav-cta:hover { background: var(--navy-dark); transform: translateY(-1px); }

        /* HERO */
        .hero {
          min-height: 100vh;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          padding: 120px 24px 80px;
          background: linear-gradient(160deg, #ffffff 0%, #f0f1ff 50%, #e8fdf5 100%);
          position: relative; overflow: hidden; text-align: center;
        }
        .hero::before {
          content: '';
          position: absolute; top: -200px; right: -200px;
          width: 600px; height: 600px;
          background: radial-gradient(circle, rgba(46,49,146,0.06) 0%, transparent 70%);
          border-radius: 50%;
        }
        .hero::after {
          content: '';
          position: absolute; bottom: -150px; left: -100px;
          width: 400px; height: 400px;
          background: radial-gradient(circle, rgba(16,185,129,0.07) 0%, transparent 70%);
          border-radius: 50%;
        }
        .hero-badge {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(46,49,146,0.08); color: var(--navy);
          padding: 6px 16px; border-radius: 100px;
          font-size: 0.8rem; font-weight: 600; letter-spacing: 0.05em;
          text-transform: uppercase; margin-bottom: 28px;
          animation: fadeDown 0.8s ease both;
        }
        .hero-badge::before {
          content: ''; width: 6px; height: 6px;
          background: var(--emerald); border-radius: 50%;
        }
        .hero-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(3rem, 7vw, 5.5rem);
          font-weight: 700; line-height: 1.05;
          color: #1a1a2e; margin-bottom: 24px;
          animation: fadeDown 0.8s ease 0.1s both;
        }
        .hero-title em {
          font-style: normal; color: var(--navy);
          position: relative;
        }
        .hero-title em::after {
          content: '';
          position: absolute; bottom: -4px; left: 0; right: 0; height: 3px;
          background: linear-gradient(90deg, var(--navy), var(--emerald));
          border-radius: 2px;
        }
        .hero-sub {
          font-size: clamp(1rem, 2vw, 1.2rem);
          color: #555; max-width: 640px;
          line-height: 1.75; margin-bottom: 44px;
          font-weight: 400;
          animation: fadeDown 0.8s ease 0.2s both;
        }
        .hero-actions {
          display: flex; gap: 16px; flex-wrap: wrap; justify-content: center;
          animation: fadeDown 0.8s ease 0.3s both;
        }
        .btn-primary {
          background: var(--navy); color: white;
          padding: 15px 36px; border-radius: 10px;
          font-size: 1rem; font-weight: 600;
          text-decoration: none; cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 20px rgba(46,49,146,0.25);
        }
        .btn-primary:hover { background: var(--navy-dark); transform: translateY(-2px); box-shadow: 0 8px 30px rgba(46,49,146,0.3); }
        .btn-secondary {
          background: transparent; color: var(--navy);
          padding: 15px 36px; border-radius: 10px;
          font-size: 1rem; font-weight: 600;
          text-decoration: none; cursor: pointer;
          border: 2px solid var(--navy);
          transition: all 0.2s;
        }
        .btn-secondary:hover { background: rgba(46,49,146,0.05); transform: translateY(-2px); }
        .hero-scroll {
          position: absolute; bottom: 32px;
          display: flex; flex-direction: column; align-items: center; gap: 8px;
          color: #888; font-size: 0.75rem; letter-spacing: 0.1em; text-transform: uppercase;
          animation: fadeDown 0.8s ease 0.5s both;
        }
        .scroll-line {
          width: 1px; height: 40px;
          background: linear-gradient(to bottom, #888, transparent);
          animation: scrollPulse 2s infinite;
        }

        /* STATS */
        .stats-section {
          background: var(--navy);
          padding: 60px 24px;
        }
        .stats-grid {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 0; max-width: 960px; margin: 0 auto;
        }
        .stat-item {
          text-align: center; padding: 32px 24px;
          border-right: 1px solid rgba(255,255,255,0.1);
          transition: transform 0.3s;
        }
        .stat-item:last-child { border-right: none; }
        .stat-item:hover { transform: translateY(-4px); }
        .stat-value {
          font-family: 'Cormorant Garamond', serif;
          font-size: 3rem; font-weight: 700;
          color: var(--gold); line-height: 1;
          margin-bottom: 8px;
        }
        .stat-label { font-size: 0.95rem; font-weight: 600; color: white; margin-bottom: 4px; }
        .stat-sub { font-size: 0.75rem; color: rgba(255,255,255,0.5); }

        /* VISION */
        .vision-section {
          padding: 100px 24px;
          background: #ffffff;
        }
        .section-label {
          font-size: 0.75rem; font-weight: 700;
          letter-spacing: 0.15em; text-transform: uppercase;
          color: var(--emerald); margin-bottom: 16px;
        }
        .section-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(2rem, 4vw, 3rem);
          font-weight: 700; color: #1a1a2e;
          line-height: 1.2; margin-bottom: 20px;
        }
        .section-desc {
          font-size: 1.05rem; color: #666;
          line-height: 1.8; max-width: 560px;
        }
        .vision-grid {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 64px; align-items: center;
          max-width: 1100px; margin: 0 auto;
        }
        .vision-visual {
          position: relative; display: flex; align-items: center; justify-content: center;
        }
        .vision-circle {
          width: 320px; height: 320px; border-radius: 50%;
          background: linear-gradient(135deg, rgba(46,49,146,0.08), rgba(16,185,129,0.08));
          border: 2px solid rgba(46,49,146,0.15);
          display: flex; align-items: center; justify-content: center;
          position: relative;
        }
        .vision-icon { font-size: 5rem; }
        .orbit-dot {
          position: absolute; width: 12px; height: 12px;
          border-radius: 50%; border: 2px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        }
        .orbit-dot:nth-child(1) { top: -6px; left: 50%; background: #2E3192; animation: orbitPulse 3s infinite; }
        .orbit-dot:nth-child(2) { right: -6px; top: 50%; background: #10b981; animation: orbitPulse 3s 1s infinite; }
        .orbit-dot:nth-child(3) { bottom: -6px; left: 50%; background: #f59e0b; animation: orbitPulse 3s 2s infinite; }
        .orbit-dot:nth-child(4) { left: -6px; top: 50%; background: #8b5cf6; animation: orbitPulse 3s 0.5s infinite; }

        /* FEATURES */
        .features-section {
          padding: 100px 24px;
          background: var(--soft);
        }
        .features-header {
          text-align: center; margin-bottom: 64px;
          max-width: 640px; margin-left: auto; margin-right: auto;
        }
        .features-grid {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 24px; max-width: 1100px; margin: 0 auto;
        }
        .feature-card {
          background: white; border-radius: 16px;
          padding: 32px; border: 1px solid rgba(0,0,0,0.06);
          transition: all 0.3s; cursor: default;
          position: relative; overflow: hidden;
        }
        .feature-card::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 3px;
          background: var(--accent-color);
          transform: scaleX(0); transform-origin: left;
          transition: transform 0.3s;
        }
        .feature-card:hover { transform: translateY(-6px); box-shadow: 0 20px 40px rgba(0,0,0,0.08); }
        .feature-card:hover::before { transform: scaleX(1); }
        .feature-icon {
          font-size: 2.2rem; margin-bottom: 16px;
          display: block;
        }
        .feature-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.3rem; font-weight: 700;
          color: #1a1a2e; margin-bottom: 10px;
        }
        .feature-desc { font-size: 0.9rem; color: #666; line-height: 1.7; }

        /* TESTIMONIALS */
        .testimonials-section {
          padding: 100px 24px;
          background: white;
          overflow: hidden;
        }
        .testimonials-header {
          text-align: center; margin-bottom: 64px;
        }
        .testimonials-track-wrapper {
          max-width: 900px; margin: 0 auto;
          position: relative;
        }
        .testimonials-track {
          display: flex; transition: transform 0.6s cubic-bezier(0.4,0,0.2,1);
        }
        .testimonial-slide {
          min-width: 100%; padding: 0 16px;
        }
        .testimonial-card {
          background: linear-gradient(135deg, #f8f9ff, #f0f8f4);
          border-radius: 20px; padding: 48px;
          border: 1px solid rgba(46,49,146,0.08);
          text-align: center;
        }
        .testimonial-quote {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(1.15rem, 2.5vw, 1.5rem);
          font-style: italic; color: #333;
          line-height: 1.7; margin-bottom: 32px;
        }
        .testimonial-quote::before { content: '\201C'; color: var(--navy); font-size: 3rem; line-height: 0; vertical-align: -0.4em; margin-right: 4px; }
        .testimonial-quote::after { content: '\201D'; color: var(--navy); font-size: 3rem; line-height: 0; vertical-align: -0.4em; margin-left: 4px; }
        .testimonial-author {
          display: flex; flex-direction: column; align-items: center; gap: 10px;
        }
        .author-avatar {
          width: 52px; height: 52px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-weight: 700; font-size: 1rem; color: white;
        }
        .author-name { font-weight: 700; color: #1a1a2e; font-size: 1rem; }
        .author-role { font-size: 0.8rem; color: #888; }
        .testimonials-dots {
          display: flex; justify-content: center; gap: 8px; margin-top: 36px;
        }
        .dot {
          width: 8px; height: 8px; border-radius: 100px;
          background: #ddd; border: none; cursor: pointer; transition: all 0.3s;
        }
        .dot.active { background: var(--navy); width: 24px; }

        /* CYCLE */
        .cycle-section {
          padding: 100px 24px;
          background: var(--navy);
          text-align: center;
        }
        .cycle-section .section-label { color: rgba(255,255,255,0.5); }
        .cycle-section .section-title { color: white; }
        .cycle-grid {
          display: flex; flex-wrap: wrap; justify-content: center;
          gap: 0; max-width: 900px; margin: 60px auto 0;
          position: relative;
        }
        .cycle-step {
          display: flex; flex-direction: column; align-items: center;
          padding: 24px 32px; position: relative;
        }
        .cycle-step:not(:last-child)::after {
          content: '→';
          position: absolute; right: -16px; top: 50%;
          transform: translateY(-50%);
          color: rgba(255,255,255,0.3); font-size: 1.5rem;
        }
        .cycle-num {
          width: 52px; height: 52px; border-radius: 50%;
          background: rgba(255,255,255,0.1); border: 2px solid rgba(255,255,255,0.2);
          display: flex; align-items: center; justify-content: center;
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.4rem; font-weight: 700; color: var(--gold);
          margin-bottom: 12px;
        }
        .cycle-name { color: white; font-weight: 600; font-size: 0.9rem; }
        .cycle-sub { color: rgba(255,255,255,0.45); font-size: 0.75rem; margin-top: 4px; }

        /* CTA */
        .cta-section {
          padding: 100px 24px; text-align: center;
          background: linear-gradient(160deg, #f8f9ff, #e8fdf5);
        }
        .cta-box {
          background: white; border-radius: 24px;
          padding: 64px 48px; max-width: 700px; margin: 0 auto;
          border: 1px solid rgba(46,49,146,0.1);
          box-shadow: 0 30px 80px rgba(46,49,146,0.08);
        }
        .cta-eyebrow { font-size: 2.5rem; margin-bottom: 16px; }
        .cta-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(1.8rem, 4vw, 2.8rem);
          font-weight: 700; color: #1a1a2e;
          margin-bottom: 16px; line-height: 1.2;
        }
        .cta-sub { font-size: 1rem; color: #666; margin-bottom: 36px; line-height: 1.7; }

        /* FOOTER */
        .footer {
          background: #1a1a2e; padding: 40px 24px;
          display: flex; align-items: center; justify-content: space-between;
          flex-wrap: wrap; gap: 16px;
        }
        .footer-logo {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.4rem; font-weight: 700; color: white;
        }
        .footer-logo span { color: var(--emerald); }
        .footer-copy { font-size: 0.8rem; color: rgba(255,255,255,0.35); }

        /* ANIMATIONS */
        @keyframes fadeDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scrollPulse {
          0%, 100% { opacity: 0.4; } 50% { opacity: 1; }
        }
        @keyframes orbitPulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.4); opacity: 0.6; }
        }
        .reveal {
          opacity: 0; transform: translateY(30px);
          transition: opacity 0.7s ease, transform 0.7s ease;
        }
        .reveal.visible {
          opacity: 1; transform: translateY(0);
        }
        .reveal-delay-1 { transition-delay: 0.1s; }
        .reveal-delay-2 { transition-delay: 0.2s; }
        .reveal-delay-3 { transition-delay: 0.3s; }
        .reveal-delay-4 { transition-delay: 0.4s; }
        .reveal-delay-5 { transition-delay: 0.5s; }
        .reveal-delay-6 { transition-delay: 0.6s; }

        @media (max-width: 768px) {
          .nav { padding: 16px 20px; }
          .vision-grid { grid-template-columns: 1fr; gap: 40px; }
          .vision-visual { display: none; }
          .cycle-step:not(:last-child)::after { display: none; }
          .stat-item { border-right: none; border-bottom: 1px solid rgba(255,255,255,0.1); }
          .stat-item:last-child { border-bottom: none; }
          .testimonial-card { padding: 32px 24px; }
          .cta-box { padding: 40px 24px; }
          .footer { justify-content: center; text-align: center; }
        }
      `}</style>

      {/* NAV */}
      <nav className="nav">
        <div className="nav-logo">Soul<span>Track</span></div>
        <a href="/login" className="nav-cta">Connexion →</a>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-badge">Plateforme de supervision pastorale</div>
        <h1 className="hero-title">
          Aucune âme<br />ne doit être <em>perdue</em>
        </h1>
        <p className="hero-sub">
          SoulTrack connecte membres, cellules, conseillers et rapports dans un seul système — pour que chaque responsable guide son troupeau avec précision, clarté et amour.
        </p>
        <div className="hero-actions">
          <a href="/login" className="btn-primary">Accéder à la plateforme</a>
          <a href="#features" className="btn-secondary">Découvrir les modules</a>
        </div>
        <div className="hero-scroll">
          <div className="scroll-line" />
          <span>Découvrir</span>
        </div>
      </section>

      {/* STATS */}
      <section className="stats-section">
        <div className="stats-grid">
          {stats.map((s, i) => (
            <div
              key={i}
              className={`stat-item reveal ${visible(`stat-${i}`) ? "visible" : ""} reveal-delay-${i + 1}`}
              data-id={`stat-${i}`}
            >
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
              <div className="stat-sub">{s.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* VISION */}
      <section className="vision-section">
        <div className="vision-grid">
          <div
            className={`reveal ${visible("vision-text") ? "visible" : ""}`}
            data-id="vision-text"
          >
            <div className="section-label">Notre vision</div>
            <h2 className="section-title">Un berger doit voir son troupeau — en entier</h2>
            <p className="section-desc">
              SoulTrack vous donne une vision globale de votre assemblée <strong>et</strong> un regard précis sur chaque individu. Spirituel, organisationnel, stratégique — les trois dimensions réunies dans une seule plateforme.
            </p>
            <div style={{ marginTop: 32, display: "flex", gap: 12, flexWrap: "wrap" }}>
              {["🕊️ Spirituel", "🏛️ Organisationnel", "📈 Stratégique"].map((tag, i) => (
                <span key={i} style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  padding: "8px 16px", borderRadius: 100,
                  background: "rgba(46,49,146,0.06)", color: "#2E3192",
                  fontSize: "0.82rem", fontWeight: 600
                }}>{tag}</span>
              ))}
            </div>
          </div>
          <div
            className={`vision-visual reveal reveal-delay-2 ${visible("vision-visual") ? "visible" : ""}`}
            data-id="vision-visual"
          >
            <div className="vision-circle">
              <div className="orbit-dot" />
              <div className="orbit-dot" />
              <div className="orbit-dot" />
              <div className="orbit-dot" />
              <div className="vision-icon">🕊️</div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="features-section" id="features">
        <div
          className={`features-header reveal ${visible("feat-header") ? "visible" : ""}`}
          data-id="feat-header"
        >
          <div className="section-label">Les modules</div>
          <h2 className="section-title">Tout ce dont votre église a besoin</h2>
          <p style={{ color: "#666", fontSize: "1rem", lineHeight: 1.7, marginTop: 12 }}>
            Six modules intégrés pour couvrir chaque dimension du ministère pastoral.
          </p>
        </div>
        <div className="features-grid">
          {features.map((f, i) => (
            <div
              key={i}
              className={`feature-card reveal reveal-delay-${(i % 3) + 1} ${visible(`feat-${i}`) ? "visible" : ""}`}
              data-id={`feat-${i}`}
              style={{ "--accent-color": f.color }}
            >
              <span className="feature-icon">{f.icon}</span>
              <div className="feature-title">{f.title}</div>
              <div className="feature-desc">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="testimonials-section">
        <div
          className={`testimonials-header reveal ${visible("test-header") ? "visible" : ""}`}
          data-id="test-header"
        >
          <div className="section-label">Témoignages</div>
          <h2 className="section-title">Ils guident leur troupeau avec SoulTrack</h2>
        </div>
        <div className="testimonials-track-wrapper">
          <div
            className="testimonials-track"
            style={{ transform: `translateX(-${activeTestimonial * 100}%)` }}
          >
            {testimonials.map((t, i) => (
              <div key={i} className="testimonial-slide">
                <div className="testimonial-card">
                  <p className="testimonial-quote">{t.text}</p>
                  <div className="testimonial-author">
                    <div className="author-avatar" style={{ background: t.color }}>
                      {t.initials}
                    </div>
                    <div className="author-name">{t.name}</div>
                    <div className="author-role">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="testimonials-dots">
            {testimonials.map((_, i) => (
              <button
                key={i}
                className={`dot ${i === activeTestimonial ? "active" : ""}`}
                onClick={() => setActiveTestimonial(i)}
                aria-label={`Témoignage ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CYCLE */}
      <section className="cycle-section">
        <div
          className={`reveal ${visible("cycle-header") ? "visible" : ""}`}
          data-id="cycle-header"
        >
          <div className="section-label">Le cycle complet</div>
          <h2 className="section-title" style={{ color: "white" }}>Du premier contact à la maturité spirituelle</h2>
        </div>
        <div className="cycle-grid">
          {[
            { n: "1", name: "Entrée", sub: "Évangélisation" },
            { n: "2", name: "Structuration", sub: "Cellules & membres" },
            { n: "3", name: "Accompagnement", sub: "Conseillers" },
            { n: "4", name: "Transformation", sub: "Baptêmes & croissance" },
            { n: "5", name: "Analyse", sub: "Rapports & vision" },
          ].map((step, i) => (
            <div
              key={i}
              className={`cycle-step reveal reveal-delay-${i + 1} ${visible(`cycle-${i}`) ? "visible" : ""}`}
              data-id={`cycle-${i}`}
            >
              <div className="cycle-num">{step.n}</div>
              <div className="cycle-name">{step.name}</div>
              <div className="cycle-sub">{step.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div
          className={`cta-box reveal ${visible("cta") ? "visible" : ""}`}
          data-id="cta"
        >
          <div className="cta-eyebrow">🙏</div>
          <h2 className="cta-title">Prêt à transformer votre ministère ?</h2>
          <p className="cta-sub">
            Rejoignez SoulTrack et offrez à chaque membre de votre église le suivi qu'il mérite. Commencez dès aujourd'hui.
          </p>
          <a href="/login" className="btn-primary" style={{ display: "inline-block" }}>
            Accéder à SoulTrack →
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-logo">Soul<span>Track</span></div>
        <div className="footer-copy">© {new Date().getFullYear()} SoulTrack — Supervision Pastorale</div>
      </footer>
    </>
  );
}
