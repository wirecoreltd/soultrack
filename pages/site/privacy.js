"use client";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { useLang } from "../../hooks/useLang";

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
    heroLabel: "Politique de confidentialité",
    heroTitle: "Votre vie",
    heroHighlight: "privée nous importe",
    heroPara: "Chez SoulTrack, nous traitons vos données avec le plus grand soin. Cette politique explique comment nous collectons, utilisons et protégeons vos informations.",
    lastUpdated: "Dernière mise à jour",
    sections: [
      {
        icon: "🔍",
        title: "1. Données collectées",
        content:
          "Nous collectons les informations que vous nous fournissez lors de la création de votre compte : nom, adresse e-mail, nom de l'église, et informations de paiement. Nous collectons également des données d'utilisation (pages visitées, fonctionnalités utilisées) afin d'améliorer notre service, ainsi que des données techniques (adresse IP, type de navigateur, appareil) pour assurer la sécurité de la plateforme.",
      },
      {
        icon: "🎯",
        title: "2. Utilisation des données",
        content:
          "Vos données sont utilisées pour fournir et améliorer le service SoulTrack, traiter vos paiements, vous envoyer des communications importantes liées à votre compte, vous informer des nouvelles fonctionnalités (avec votre consentement), et répondre à vos demandes d'assistance. Nous n'utilisons jamais vos données à des fins publicitaires ni ne les vendons à des tiers.",
      },
      {
        icon: "🤝",
        title: "3. Partage des données",
        content:
          "Nous ne vendons, n'échangeons ni ne louons vos données personnelles à des tiers. Nous pouvons partager certaines informations avec des prestataires de services de confiance (comme Stripe pour les paiements ou Supabase pour le stockage), uniquement dans le cadre de la fourniture du service. Ces prestataires sont contractuellement tenus de protéger vos données.",
      },
      {
        icon: "🔒",
        title: "4. Sécurité des données",
        content:
          "Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles robustes : chiffrement SSL/TLS pour toutes les transmissions, hachage des mots de passe, accès restreint aux données sensibles, et audits de sécurité réguliers. En cas de violation de données, nous vous notifierons dans les 72 heures conformément aux réglementations applicables.",
      },
      {
        icon: "🗓️",
        title: "5. Conservation des données",
        content:
          "Vos données sont conservées tant que votre compte est actif. En cas de résiliation, vos données sont supprimées dans un délai de 30 jours, à l'exception des données que nous sommes légalement tenus de conserver (données comptables, par exemple). Vous pouvez demander la suppression anticipée de vos données en nous contactant.",
      },
      {
        icon: "⚖️",
        title: "6. Vos droits",
        content:
          "Conformément au RGPD et aux lois applicables, vous disposez des droits suivants : accès à vos données personnelles, rectification des données inexactes, suppression (droit à l'oubli), portabilité de vos données, opposition au traitement, et limitation du traitement. Pour exercer ces droits, contactez-nous à privacy@soultrack.org.",
      },
      {
        icon: "🍪",
        title: "7. Cookies",
        content:
          "SoulTrack utilise des cookies essentiels au fonctionnement de la plateforme (authentification, session) et des cookies analytiques anonymisés pour comprendre l'utilisation du service. Vous pouvez désactiver les cookies analytiques dans vos paramètres de compte. Les cookies essentiels ne peuvent pas être désactivés car ils sont nécessaires au bon fonctionnement du service.",
      },
      {
        icon: "👶",
        title: "8. Données des mineurs",
        content:
          "SoulTrack n'est pas destiné aux personnes de moins de 16 ans. Si vous êtes un administrateur d'église et gérez des informations de membres mineurs, vous êtes responsable d'obtenir les consentements parentaux appropriés conformément aux lois locales. Nous vous recommandons de minimiser les données collectées sur les mineurs.",
      },
      {
        icon: "🌍",
        title: "9. Transferts internationaux",
        content:
          "Vos données peuvent être traitées dans des pays autres que votre pays de résidence. Dans ce cas, nous veillons à ce que des garanties appropriées soient en place, notamment des clauses contractuelles types approuvées par les autorités compétentes, pour assurer un niveau de protection adéquat de vos données.",
      },
      {
        icon: "🔔",
        title: "10. Modifications de la politique",
        content:
          "Nous pouvons mettre à jour cette politique de confidentialité pour refléter les changements dans nos pratiques ou les exigences légales. Nous vous informerons de tout changement important par e-mail ou via une notification dans l'application au moins 30 jours avant l'entrée en vigueur des nouvelles dispositions.",
      },
      {
        icon: "📬",
        title: "11. Nous contacter",
        content:
          "Pour toute question relative à la confidentialité ou pour exercer vos droits, contactez notre Délégué à la Protection des Données à privacy@soultrack.org. Vous pouvez également soumettre une réclamation auprès de l'autorité de protection des données compétente dans votre pays.",
      },
    ],
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
    heroLabel: "Privacy Policy",
    heroTitle: "Your privacy",
    heroHighlight: "matters to us",
    heroPara: "At SoulTrack, we handle your data with the utmost care. This policy explains how we collect, use, and protect your information.",
    lastUpdated: "Last updated",
    sections: [
      {
        icon: "🔍",
        title: "1. Data We Collect",
        content:
          "We collect information you provide when creating your account: name, email address, church name, and payment information. We also collect usage data (pages visited, features used) to improve our service, as well as technical data (IP address, browser type, device) to ensure platform security.",
      },
      {
        icon: "🎯",
        title: "2. How We Use Your Data",
        content:
          "Your data is used to provide and improve the SoulTrack service, process your payments, send you important account-related communications, inform you of new features (with your consent), and respond to your support requests. We never use your data for advertising purposes or sell it to third parties.",
      },
      {
        icon: "🤝",
        title: "3. Data Sharing",
        content:
          "We do not sell, trade, or rent your personal data to third parties. We may share certain information with trusted service providers (such as Stripe for payments or Supabase for storage), solely for the purpose of providing the service. These providers are contractually required to protect your data.",
      },
      {
        icon: "🔒",
        title: "4. Data Security",
        content:
          "We implement robust technical and organizational security measures: SSL/TLS encryption for all transmissions, password hashing, restricted access to sensitive data, and regular security audits. In the event of a data breach, we will notify you within 72 hours in accordance with applicable regulations.",
      },
      {
        icon: "🗓️",
        title: "5. Data Retention",
        content:
          "Your data is retained for as long as your account is active. Upon termination, your data is deleted within 30 days, except for data we are legally required to retain (such as accounting records). You may request early deletion of your data by contacting us.",
      },
      {
        icon: "⚖️",
        title: "6. Your Rights",
        content:
          "In accordance with GDPR and applicable laws, you have the following rights: access to your personal data, correction of inaccurate data, deletion (right to be forgotten), data portability, objection to processing, and restriction of processing. To exercise these rights, contact us at privacy@soultrack.org.",
      },
      {
        icon: "🍪",
        title: "7. Cookies",
        content:
          "SoulTrack uses cookies essential to platform operation (authentication, session) and anonymized analytical cookies to understand service usage. You can disable analytical cookies in your account settings. Essential cookies cannot be disabled as they are necessary for the service to function properly.",
      },
      {
        icon: "👶",
        title: "8. Minors' Data",
        content:
          "SoulTrack is not intended for persons under 16 years of age. If you are a church administrator managing information about minor members, you are responsible for obtaining appropriate parental consents in accordance with local laws. We recommend minimizing the data collected on minors.",
      },
      {
        icon: "🌍",
        title: "9. International Transfers",
        content:
          "Your data may be processed in countries other than your country of residence. In such cases, we ensure that appropriate safeguards are in place, including standard contractual clauses approved by competent authorities, to ensure an adequate level of protection for your data.",
      },
      {
        icon: "🔔",
        title: "10. Policy Changes",
        content:
          "We may update this privacy policy to reflect changes in our practices or legal requirements. We will notify you of any significant changes by email or via an in-app notification at least 30 days before the new provisions take effect.",
      },
      {
        icon: "📬",
        title: "11. Contact Us",
        content:
          "For any privacy-related questions or to exercise your rights, contact our Data Protection Officer at privacy@soultrack.org. You may also submit a complaint to the competent data protection authority in your country.",
      },
    ],
    footer: "All rights reserved.",
  },
};

export default function PrivacyPage() {
  const router = useRouter();
  const [openMenu, setOpenMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { lang, changeLang } = useLang();
  const pathname = usePathname();

  const t = translations[lang];

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
    transition: "opacity 0.2s",
  });

  return (
    <div style={{ background: "#333699", minHeight: "100vh", position: "relative" }}>

      {/* ───── HEADER ───── */}
      <header
        style={{
          background: scrolled ? "rgba(51,54,153,0.92)" : "transparent",
          borderBottom: scrolled ? "0.5px solid rgba(255,255,255,0.15)" : "0.5px solid transparent",
          position: "sticky",
          top: 0,
          zIndex: 100,
          backdropFilter: scrolled ? "blur(16px)" : "none",
          transition: "background 0.3s, border-color 0.3s",
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
            style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", zIndex: 1, flexShrink: 0 }}
          >
            <Image src="/logo.png" alt="SoulTrack" width={38} height={38} />
            <span style={{ color: "#fff", fontSize: "19px", fontWeight: 500, fontFamily: "'Great Vibes', cursive", whiteSpace: "nowrap" }}>
              SoulTrack
            </span>
          </div>

          {/* ───── GROUPE DROITE desktop : nav + boutons + switcher langue ───── */}
          <div className="nav-hide" style={{ display: "flex", alignItems: "center", gap: "26px", zIndex: 1, flexShrink: 0 }}>

            {/* NAV desktop */}
            <nav style={{ display: "flex", alignItems: "center", gap: "20px", zIndex: 1, flexShrink: 0 }}>
              {t.nav.map((item) => (
                <span
                  key={item.path}
                  onClick={() => router.push(item.path)}
                  style={{ color: pathname === item.path ? "#fbbf24" : "#fff", fontSize: "14px", fontWeight: 600, cursor: "pointer", transition: "color 0.2s", whiteSpace: "nowrap" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = pathname === item.path ? "#fbbf24" : "#fff")}
                >
                  {item.label}
                </span>
              ))}
            </nav>

            {/* BOUTONS desktop */}
            <div style={{ display: "flex", gap: "8px", alignItems: "center", zIndex: 1, flexShrink: 0 }}>
              <button
                onClick={() => router.push("/login")}
                style={{ background: "transparent", color: "#fbbf24", border: "0.5px solid rgba(255,255,255,0.35)", padding: "7px 18px", borderRadius: "8px", fontSize: "14px", cursor: "pointer", whiteSpace: "nowrap" }}
              >
                {t.login}
              </button>
              <button
                onClick={() => router.push("/site/pricing")}
                style={{ background: "#fff", color: "#333699", border: "none", padding: "7px 18px", borderRadius: "8px", fontSize: "14px", fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}
              >
                {t.signup}
              </button>
            </div>

            {/* Switcher langue desktop */}
            <div style={{ display: "flex", gap: "10px", alignItems: "center", flexShrink: 0 }}>
              <button onClick={() => changeLang("fr")} title="Français" style={{ ...langBtnStyle(lang === "fr"), flexShrink: 0 }}>
                <img src="https://flagcdn.com/w40/fr.png" srcSet="https://flagcdn.com/w80/fr.png 2x" width="30" height="21" alt="Français" style={{ display: "block", borderRadius: "3px", flexShrink: 0 }} />
              </button>
              <button onClick={() => changeLang("en")} title="English" style={{ ...langBtnStyle(lang === "en"), flexShrink: 0 }}>
                <img src="https://flagcdn.com/w40/gb.png" srcSet="https://flagcdn.com/w80/gb.png 2x" width="30" height="21" alt="English" style={{ display: "block", borderRadius: "3px", flexShrink: 0 }} />
              </button>
            </div>
          </div>
          {/* ───── FIN GROUPE DROITE ───── */}

          {/* HAMBURGER */}
          <button
            onClick={() => setOpenMenu(!openMenu)}
            className="nav-show"
            style={{ background: "none", border: "none", cursor: "pointer", display: "none", flexDirection: "column", gap: "5px", padding: "4px", zIndex: 1 }}
          >
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                style={{
                  display: "block", width: "22px", height: "1.5px", background: "rgba(255,255,255,0.85)", borderRadius: "2px",
                  transition: "transform 0.2s, opacity 0.2s",
                  transform: openMenu ? (i === 0 ? "rotate(45deg) translate(5px, 5px)" : i === 2 ? "rotate(-45deg) translate(5px, -5px)" : "scaleX(0)") : "none",
                  opacity: openMenu && i === 1 ? 0 : 1,
                }}
              />
            ))}
          </button>
        </div>

        {/* MENU MOBILE */}
        {openMenu && (
          <div style={{ background: "#333699", borderTop: "0.5px solid rgba(255,255,255,0.15)", padding: "20px 24px 28px", display: "flex", flexDirection: "column", gap: "20px" }}>
            {t.nav.map((item) => (
              <span
                key={item.path}
                onClick={() => { router.push(item.path); setOpenMenu(false); }}
                style={{ color: pathname === item.path ? "#fbbf24" : "#fff", fontSize: "15px", fontWeight: 600, cursor: "pointer" }}
              >
                {item.label}
              </span>
            ))}
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <button onClick={() => changeLang("fr")} title="Français" style={langBtnStyle(lang === "fr")}>
                <img src="https://flagcdn.com/w20/fr.png" srcSet="https://flagcdn.com/w40/fr.png 2x" width="20" height="14" alt="Français" style={{ display: "block", borderRadius: "2px" }} />
              </button>
              <button onClick={() => changeLang("en")} title="English" style={langBtnStyle(lang === "en")}>
                <img src="https://flagcdn.com/w20/gb.png" srcSet="https://flagcdn.com/w40/gb.png 2x" width="20" height="14" alt="English" style={{ display: "block", borderRadius: "2px" }} />
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "4px" }}>
              <button onClick={() => { router.push("/login"); setOpenMenu(false); }} style={{ background: "transparent", color: "#fff", border: "0.5px solid rgba(255,255,255,0.35)", padding: "11px", borderRadius: "8px", fontSize: "14px", cursor: "pointer" }}>
                {t.login}
              </button>
              <button onClick={() => { router.push("/site/pricing"); setOpenMenu(false); }} style={{ background: "#fff", color: "#333699", border: "none", padding: "11px", borderRadius: "8px", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}>
                {t.signup}
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ───── HERO ───── */}
      <section style={{ textAlign: "center", padding: "70px 24px 40px", position: "relative", zIndex: 1 }}>
        <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "14px" }}>
          {t.heroLabel}
        </p>
        <h1 style={{ color: "#fff", fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 500, lineHeight: 1.15, maxWidth: "600px", margin: "0 auto 20px" }}>
          {t.heroTitle} <span style={{ color: "#fbbf24" }}>{t.heroHighlight}</span>
        </h1>
        <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "clamp(0.9rem, 1.8vw, 1rem)", maxWidth: "560px", margin: "0 auto", lineHeight: 1.8 }}>
          {t.heroPara}
        </p>        
      </section>

      {/* ───── CONTENU PRIVACY ───── */}
      <section style={{ padding: "20px 24px 60px", position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: "760px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "16px" }}>
          {t.sections.map((section, idx) => (
            <div
              key={idx}
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "0.5px solid rgba(255,255,255,0.12)",
                borderRadius: "16px",
                padding: "28px 30px",
                position: "relative",
                overflow: "hidden",
                backdropFilter: "blur(8px)",
              }}
            >
              <div style={{ position: "absolute", top: 0, left: "24px", right: "24px", height: "1px", background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)" }} />
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                <span style={{ fontSize: "20px" }}>{section.icon}</span>
                <h2 style={{ color: "#fbbf24", fontSize: "15px", fontWeight: 600, margin: 0, letterSpacing: "0.01em" }}>
                  {section.title}
                </h2>
              </div>
              <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "14px", lineHeight: 1.85, margin: 0 }}>
                {section.content}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ───── FOOTER ───── */}
      <footer style={{ borderTop: "0.5px solid rgba(255,255,255,0.1)", padding: "20px 24px" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", textAlign: "center", color: "rgba(255,255,255,0.35)", fontSize: "14px" }}>
          <div>© {new Date().getFullYear()} SoulTrack. {t.footer}</div>
          <div style={{ marginTop: "10px", display: "flex", justifyContent: "center", gap: "18px", fontSize: "13px" }}>
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
