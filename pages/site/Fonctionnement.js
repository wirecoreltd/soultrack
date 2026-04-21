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
    heroPara: `Chaque module sert un même chemin : suivre la présence, former les membres, accompagner les baptisés, engager chacun dans le service, répondre aux besoins et veiller d'abord sur la croissance personnelle de chaque vie, puis sur celle de l'église dans son ensemble. Rien ici n'est de simples données, mais des vies confiées à notre soin.`,
    heroPara2: `Que chaque âme soit gagnée, restaurée, bien entourée, enracinée dans la Parole et transformée en un disciple fidèle et accompli dans la maison de Dieu.`,
    heroTitle: "Comment fonctionne",
    footer: "Tous droits réservés.",
    modules: [
      {
        title: "Espace Membres",
        emoji: "🧭",
        accent: "rgba(55,138,221,0.6)",
        accentSolid: "rgba(55,138,221,0.25)",
        steps: [
          { icon: "➕", title: "Nouveau Membre", desc: "Créer ou importer un nouveau membre avec ses informations essentielles pour l'intégrer dans la base." },
          { icon: "🏛️", title: "Liste des Membres", desc: "Accéder instantanément à tous les membres enregistrés, chacun disposant d'une carte dédiée avec ses informations, pour une vue claire, structurée et facile à exploiter." },
          { icon: "👤", title: "Affectation", desc: "Associer un membre à un conseiller ou une cellule pour faciliter un suivi plus structuré et personnalisé, selon l'organisation de votre église." },
          { icon: "💌", title: "Suivis", desc: "Enregistrer les interactions, commentaires et l'évolution du membre dans le temps." },
          { icon: "📊", title: "Rapport", desc: "Analyser les données pour suivre la croissance, l'activité et l'efficacité du suivi." },
        ],
      },
      {
        title: "Espace Évangélisation",
        emoji: "✝️",
        accent: "rgba(29,158,117,0.6)",
        accentSolid: "rgba(29,158,117,0.25)",
        steps: [
          { icon: "➕", title: "Nouveau contact", desc: "Créer et centraliser toutes les nouvelles données afin de constituer une base structurée et exploitable." },
          { icon: "🌿", title: "Liste des Évangélisées", desc: "Accéder à une vue claire et structurée de toutes les informations avec une classification automatique." },
          { icon: "💗", title: "Suivis", desc: "Enregistrer les échanges, commentaires et évolutions pour garantir un accompagnement continu et un historique complet." },
          { icon: "💧", title: "Baptême", desc: "Enregistrer les étapes spirituelles." },
          { icon: "📊", title: "Rapport", desc: "Suivre les performances globales à travers des indicateurs et rapports pour mesurer l'impact et optimiser les actions." },
        ],
      },
      {
        title: "Espace Cellules",
        emoji: "🏠",
        accent: "rgba(93,202,165,0.6)",
        accentSolid: "rgba(93,202,165,0.25)",
        steps: [
          { icon: "🏠", title: "Liste des Cellules", desc: "Créer, organiser et suivre les cellules afin d'assurer une structure claire, une croissance équilibrée et un encadrement efficace des membres." },
          { icon: "💌", title: "Suivi des Âmes", desc: "Suivre l'évolution des personnes depuis leur premier contact jusqu'à leur intégration dans l'église." },
          { icon: "👤", title: "Responsable", desc: "Gérer les responsables de cellules et d'équipes afin d'assurer une répartition claire des rôles et un leadership efficace." },
          { icon: "🌱", title: "Intégration", desc: "Accompagner les nouveaux venus dans leur parcours d'intégration à l'église jusqu'à leur enracinement dans une cellule active." },
          { icon: "📊", title: "Croissance", desc: "Analyser l'évolution globale des membres, des cellules et des conversions pour orienter les décisions stratégiques." },
        ],
      },
      {
        title: "Espace Conseiller",
        emoji: "🤝",
        accent: "rgba(239,159,39,0.55)",
        accentSolid: "rgba(239,159,39,0.22)",
        steps: [
          { icon: "🏛️", title: "Mes membres", desc: "Centraliser tous les membres de l'église avec leurs informations complètes afin d'avoir une vue globale et structurée de la communauté." },
          { icon: "💗", title: "Suivis", desc: "Assurer un accompagnement régulier des membres pour renforcer la proximité, identifier les besoins et favoriser leur croissance spirituelle." },
          { icon: "🌱", title: "Évolution des Âmes", desc: "Analyser la progression des personnes accompagnées afin de suivre leur croissance spirituelle." },
          { icon: "🎯", title: "Parcours Spirituel", desc: "Définir et structurer les étapes de croissance des personnes, depuis leur premier contact jusqu'à leur maturité spirituelle." },
          { icon: "📊", title: "Rapports", desc: "Suivre et analyser les données globales des personnes accompagnées afin d'évaluer l'impact du suivi pastoral." },
        ],
      },
      {
        title: "Espace Rapports",
        emoji: "📉",
        accent: "rgba(127,119,221,0.6)",
        accentSolid: "rgba(127,119,221,0.25)",
        steps: [
          { icon: "⛪", title: "Affluence", desc: "Suivi des présences aux cultes : hommes, femmes, jeunes, enfants, connectés et nouveaux venus." },
          { icon: "✒️", title: "Formations", desc: "Analyse des formations organisées : participation et évolution de la croissance spirituelle." },
          { icon: "💧", title: "Baptême", desc: "Suivi des baptêmes réalisés. Mesure les décisions publiques de foi et la croissance des nouveaux disciples." },
          { icon: "💢", title: "Ministère", desc: "État des serviteurs engagés par ministère. Permet de voir la répartition, l'implication et la dynamique du service." },
          { icon: "❓", title: "Besoins", desc: "Identification des besoins spirituels et personnels des membres de l'église pour apporter un accompagnement adapté." },
          { icon: "📊", title: "Vue d'ensemble", desc: "Vue d'ensemble complète de l'église : croissance, engagement, structures et impact spirituel." },
        ],
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
    heroPara: `Every module serves the same journey: tracking attendance, training members, accompanying the baptised, engaging each person in service, responding to needs and watching first over the personal growth of each life, then over the church as a whole. Nothing here is mere data — these are lives entrusted to our care.`,
    heroPara2: `May every soul be won, restored, well surrounded, rooted in the Word and transformed into a faithful and fulfilled disciple in the house of God.`,
    heroTitle: "How",
    heroTitleSuffix: "works",
    footer: "All rights reserved.",
    modules: [
      {
        title: "Members Space",
        emoji: "🧭",
        accent: "rgba(55,138,221,0.6)",
        accentSolid: "rgba(55,138,221,0.25)",
        steps: [
          { icon: "➕", title: "New Member", desc: "Create or import a new member with their essential information to integrate them into the database." },
          { icon: "🏛️", title: "Members List", desc: "Instantly access all registered members, each with a dedicated card containing their information, for a clear and structured view." },
          { icon: "👤", title: "Assignment", desc: "Associate a member with a counselor or cell group to facilitate more structured and personalised follow-up." },
          { icon: "💌", title: "Follow-ups", desc: "Record interactions, comments and the member's progress over time." },
          { icon: "📊", title: "Report", desc: "Analyse data to track growth, activity and the effectiveness of follow-up." },
        ],
      },
      {
        title: "Evangelism Space",
        emoji: "✝️",
        accent: "rgba(29,158,117,0.6)",
        accentSolid: "rgba(29,158,117,0.25)",
        steps: [
          { icon: "➕", title: "New Contact", desc: "Create and centralise all new data to build a structured and usable database." },
          { icon: "🌿", title: "Evangelised List", desc: "Access a clear and structured view of all information with automatic classification." },
          { icon: "💗", title: "Follow-ups", desc: "Record exchanges, comments and progress to ensure continuous support and a complete history." },
          { icon: "💧", title: "Baptism", desc: "Record spiritual milestones." },
          { icon: "📊", title: "Report", desc: "Track overall performance through indicators and reports to measure impact and optimise actions." },
        ],
      },
      {
        title: "Cell Groups Space",
        emoji: "🏠",
        accent: "rgba(93,202,165,0.6)",
        accentSolid: "rgba(93,202,165,0.25)",
        steps: [
          { icon: "🏠", title: "Cell Groups List", desc: "Create, organise and track cell groups to ensure a clear structure, balanced growth and effective member oversight." },
          { icon: "💌", title: "Soul Follow-up", desc: "Track people's journey from their first contact through to full integration into the church." },
          { icon: "👤", title: "Leader", desc: "Manage cell and team leaders to ensure clear role distribution and effective on-the-ground leadership." },
          { icon: "🌱", title: "Integration", desc: "Guide newcomers through their integration journey until they are rooted in an active cell group." },
          { icon: "📊", title: "Growth", desc: "Analyse the overall evolution of members, cells and conversions to guide strategic decisions." },
        ],
      },
      {
        title: "Counselor Space",
        emoji: "🤝",
        accent: "rgba(239,159,39,0.55)",
        accentSolid: "rgba(239,159,39,0.22)",
        steps: [
          { icon: "🏛️", title: "My Members", desc: "Centralise all church members with their complete information for a global and structured view of the community." },
          { icon: "💗", title: "Follow-ups", desc: "Provide regular support to members to strengthen connection, identify needs and foster their spiritual growth." },
          { icon: "🌱", title: "Soul Progress", desc: "Analyse the progression of those being accompanied to track their spiritual growth." },
          { icon: "🎯", title: "Spiritual Journey", desc: "Define and structure growth stages for individuals, from first contact to spiritual maturity." },
          { icon: "📊", title: "Reports", desc: "Track and analyse overall data on those being accompanied to evaluate the impact of pastoral care." },
        ],
      },
      {
        title: "Reports Space",
        emoji: "📉",
        accent: "rgba(127,119,221,0.6)",
        accentSolid: "rgba(127,119,221,0.25)",
        steps: [
          { icon: "⛪", title: "Attendance", desc: "Track service attendance: men, women, youth, children, online and newcomers." },
          { icon: "✒️", title: "Training", desc: "Analysis of organised training: participation and spiritual growth through teaching and equipping members." },
          { icon: "💧", title: "Baptism", desc: "Track baptisms performed. Measures public decisions of faith and the growth of new disciples." },
          { icon: "💢", title: "Ministry", desc: "Status of servants engaged by ministry. Shows distribution, involvement and service dynamics." },
          { icon: "❓", title: "Needs", desc: "Identify spiritual and personal needs of church members to provide tailored support." },
          { icon: "📊", title: "Overview", desc: "Complete church overview: growth, engagement, structures and spiritual impact. A central dashboard for the whole vision." },
        ],
      },
    ],
  },
};

export default function Fonctionnement() {
  const router = useRouter();
  const pathname = usePathname();

  const [openMenu, setOpenMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState(null);
  const [lang, setLang] = useState("fr");

  const t = translations[lang];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div style={{ background: "#333699", minHeight: "100vh", position: "relative" }}>

      {/* GLOW 1 */}
      <div style={{
        position: "absolute", width: "800px", height: "800px", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(255,255,255,0.13) 0%, rgba(255,255,255,0.04) 40%, transparent 65%)",
        top: "80px", left: "50%", transform: "translateX(-50%)",
        pointerEvents: "none", zIndex: 0,
      }} />

      {/* GLOW 2 */}
      <div style={{
        position: "absolute", width: "600px", height: "600px", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(251,191,36,0.07) 0%, transparent 65%)",
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
          maxWidth: "1100px", margin: "0 auto", padding: "22px 24px", height: "88px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          {/* LOGO */}
          <div onClick={() => router.push("/site/HomePage")} style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", zIndex: 1, flexShrink: 0 }}>
            <Image src="/logo.png" alt="SoulTrack" width={50} height={50} />
            <span style={{ color: "#fff", fontSize: "22px", fontWeight: 500, fontFamily: "'Great Vibes', cursive" }}>SoulTrack</span>
          </div>

          {/* NAV */}
          <nav style={{ display: "flex", alignItems: "center", gap: "32px", zIndex: 1 }}>
            {t.nav.map((item) => (
              <span key={item.path} onClick={() => router.push(item.path)}
                style={{ color: pathname === item.path ? "#fbbf24" : "#fff", fontSize: "14px", fontWeight: 600, cursor: "pointer", transition: "color 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.color = "#fff"}
                onMouseLeave={e => e.currentTarget.style.color = pathname === item.path ? "#fbbf24" : "#fff"}
                className="nav-hide"
              >{item.label}</span>
            ))}
          </nav>

         
            <button onClick={() => router.push("/login")} style={{ background: "transparent", color: "#fbbf24", border: "0.5px solid rgba(255,255,255,0.35)", padding: "7px 18px", borderRadius: "8px", fontSize: "14px", cursor: "pointer" }}>
              {t.login}
            </button>
            <button onClick={() => router.push("/SignupEglise")} style={{ background: "#fff", color: "#333699", border: "none", padding: "7px 18px", borderRadius: "8px", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}>
              {t.signup}
            </button>
          </div>

           {/* BOUTONS + SWITCHER */}
                    <div style={{ display: "flex", gap: "10px", alignItems: "center", zIndex: 1, flexShrink: 0 }} className="nav-hide">
                      {/* Drapeaux */}
                      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                        <button onClick={() => setLang("fr")} title="Français" style={{ background: "none", border: "none", cursor: "pointer", padding: 0, opacity: lang === "fr" ? 1 : 0.45, transition: "opacity 0.2s" }}>
                          <img src="https://flagcdn.com/w40/fr.png" srcSet="https://flagcdn.com/w80/fr.png 2x" width="32" height="22" alt="Français" style={{ display: "block", borderRadius: "3px" }} />
                        </button>
                        <button onClick={() => setLang("en")} title="English" style={{ background: "none", border: "none", cursor: "pointer", padding: 0, opacity: lang === "en" ? 1 : 0.45, transition: "opacity 0.2s" }}>
                          <img src="https://flagcdn.com/w40/gb.png" srcSet="https://flagcdn.com/w80/gb.png 2x" width="32" height="22" alt="English" style={{ display: "block", borderRadius: "3px" }} />
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

        {/* MENU MOBILE */}
        {openMenu && (
          <div style={{ background: "#333699", borderTop: "0.5px solid rgba(255,255,255,0.15)", padding: "20px 24px 28px", display: "flex", flexDirection: "column", gap: "20px" }}>
            {t.nav.map((item) => (
              <span key={item.path} onClick={() => { router.push(item.path); setOpenMenu(false); }}
                style={{ color: pathname === item.path ? "#fbbf24" : "#fff", fontSize: "15px", fontWeight: 600, cursor: "pointer" }}>{item.label}</span>
            ))}
            {/* Drapeaux mobile */}
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <button onClick={() => setLang("fr")} title="Français" style={{ background: "none", border: "none", cursor: "pointer", padding: 0, opacity: lang === "fr" ? 1 : 0.45, transition: "opacity 0.2s" }}>
                <img src="https://flagcdn.com/w40/fr.png" srcSet="https://flagcdn.com/w80/fr.png 2x" width="32" height="22" alt="Français" style={{ display: "block", borderRadius: "3px" }} />
              </button>
              <button onClick={() => setLang("en")} title="English" style={{ background: "none", border: "none", cursor: "pointer", padding: 0, opacity: lang === "en" ? 1 : 0.45, transition: "opacity 0.2s" }}>
                <img src="https://flagcdn.com/w40/gb.png" srcSet="https://flagcdn.com/w80/gb.png 2x" width="32" height="22" alt="English" style={{ display: "block", borderRadius: "3px" }} />
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "4px" }}>
              <button onClick={() => router.push("/login")} style={{ background: "transparent", color: "#fff", border: "0.5px solid rgba(255,255,255,0.35)", padding: "11px", borderRadius: "8px", fontSize: "14px", cursor: "pointer" }}>{t.login}</button>
              <button onClick={() => router.push("/SignupEglise")} style={{ background: "#fff", color: "#333699", border: "none", padding: "11px", borderRadius: "8px", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}>{t.signup}</button>
            </div>
          </div>
        )}
      </header>

      {/* ───── HERO ───── */}
      <section style={{ textAlign: "center", padding: "60px 24px 40px", position: "relative", zIndex: 1 }}>
        <p style={{
          color: "rgba(255,255,255,0.85)", fontSize: "clamp(0.9rem, 1.8vw, 1.05rem)",
          lineHeight: 1.8, maxWidth: "680px", margin: "0 auto 28px", fontWeight: 400,
        }}>
          {t.heroPara}
          <br /><br />
          {t.heroPara2}
        </p>

        <h2 style={{ color: "#fff", fontSize: "clamp(1.4rem, 3.5vw, 2.2rem)", fontWeight: 500, lineHeight: 1.2, margin: "0 auto" }}>
          {lang === "fr" ? (
            <>Comment fonctionne <span style={{ color: "#fbbf24" }}>SoulTrack</span></>
          ) : (
            <>How <span style={{ color: "#fbbf24" }}>SoulTrack</span> works</>
          )}
        </h2>
      </section>

      {/* ───── MODULES ───── */}
      {t.modules.map((module, mIndex) => (
        <section key={mIndex} style={{ padding: "24px 24px 36px", position: "relative", zIndex: 1 }}>

          {/* MODULE TITLE */}
          <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: "16px", marginBottom: "40px" }}>
            <div style={{
              width: "55px", height: "55px", fontSize: "29px", borderRadius: "50%",
              background: module.accentSolid,
              boxShadow: `0 0 32px 8px ${module.accent}`,
              border: `0.5px solid ${module.accent}`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {module.emoji}
            </div>
            <h2 style={{ color: "#fff", fontSize: "clamp(1.2rem, 3vw, 1.6rem)", fontWeight: 500, lineHeight: 1.2, margin: 0 }}>
              {module.title}
            </h2>
          </div>

          {/* STEPS */}
          <div style={{ position: "relative", maxWidth: mIndex === t.modules.length - 1 ? "1050px" : "900px", margin: "0 auto" }}>
            <div className="connector-line" style={{
              position: "absolute", top: "36px", left: "10%", right: "10%", height: "1.5px",
              background: `linear-gradient(90deg, transparent, ${module.accent}, transparent)`,
              zIndex: 0,
            }} />

            <div style={{
              display: "flex", justifyContent: "center",
              gap: mIndex === t.modules.length - 1 ? "8px" : "16px",
              flexWrap: mIndex === t.modules.length - 1 ? "nowrap" : "wrap",
            }}>
              {module.steps.map((step, i) => {
                const isActive = active === `${mIndex}-${i}`;
                return (
                  <div key={i}
                    onMouseEnter={() => setActive(`${mIndex}-${i}`)}
                    onMouseLeave={() => setActive(null)}
                    style={{
                      display: "flex", flexDirection: "column", alignItems: "center",
                      width: mIndex === t.modules.length - 1 ? "120px" : "150px", textAlign: "center",
                      transition: "transform 0.25s",
                      transform: isActive ? "translateY(-6px)" : "translateY(0)",
                    }}
                  >
                    <div style={{
                      width: isActive ? "72px" : "62px", height: isActive ? "72px" : "62px",
                      borderRadius: "50%",
                      background: isActive ? module.accentSolid : "rgba(255,255,255,0.08)",
                      border: `1.5px solid ${isActive ? module.accent : "rgba(255,255,255,0.2)"}`,
                      boxShadow: isActive ? `0 0 20px 4px ${module.accent}` : "none",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "22px", marginBottom: "12px", transition: "all 0.25s",
                      position: "relative", zIndex: 2, backdropFilter: "blur(8px)",
                    }}>
                      {step.icon}
                    </div>

                    <div style={{
                      color: module.accent.replace("0.6", "1").replace("0.55", "1"),
                      fontSize: "13px", fontWeight: 600, marginBottom: "6px",
                    }}>
                      {step.title}
                    </div>

                    <div style={{ color: "#fff", fontSize: "12px", lineHeight: 1.5 }}>
                      {step.desc}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      ))}

      {/* ───── FOOTER ───── */}
      <footer style={{ borderTop: "0.5px solid rgba(255,255,255,0.1)", padding: "20px 24px" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", textAlign: "center", color: "rgba(255,255,255,0.35)", fontSize: "14px" }}>
          © {new Date().getFullYear()} SoulTrack. {t.footer}
        </div>
      </footer>

      <style>{`
        body { overflow-x: hidden; }
        @media (max-width: 768px) {
          .nav-hide { display: none !important; }
          .nav-show { display: flex !important; }
          .connector-line { display: none !important; }
        }
        @media (max-width: 600px) {
          .connector-line { display: none !important; }
        }
      `}</style>
    </div>
  );
}
