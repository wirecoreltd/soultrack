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
    heroLabel: "Conditions d'utilisation",
    heroTitle: "Nos",
    heroHighlight: "Conditions générales",
    heroPara: "En utilisant SoulTrack, vous acceptez les présentes conditions. Veuillez les lire attentivement avant d'utiliser notre plateforme.",
    lastUpdated: "Dernière mise à jour",
    sections: [
      {
        title: "1. Acceptation des conditions",
        content:
          "En accédant à SoulTrack ou en l'utilisant, vous acceptez d'être lié par les présentes Conditions d'utilisation. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser notre service. Ces conditions s'appliquent à tous les utilisateurs, administrateurs et membres associés à des comptes d'église.",
      },
      {
        title: "2. Description du service",
        content:
          "SoulTrack est une plateforme de gestion d'église conçue pour aider les communautés religieuses à gérer leurs membres, leurs événements et leurs activités administratives. Nous nous réservons le droit de modifier, suspendre ou interrompre tout aspect du service à tout moment.",
      },
      {
        title: "3. Comptes et inscription",
        content:
          "Pour utiliser SoulTrack, vous devez créer un compte en fournissant des informations exactes et complètes. Vous êtes responsable de la confidentialité de vos identifiants de connexion et de toutes les activités effectuées sous votre compte. Signalez immédiatement tout accès non autorisé à support@soultrack.org.",
      },
      {
        title: "4. Utilisation acceptable",
        content:
          "Vous acceptez d'utiliser SoulTrack uniquement à des fins légales et conformément à ces conditions. Il est interdit d'utiliser la plateforme pour diffuser du contenu offensant, discriminatoire ou illégal, ou pour toute activité susceptible de nuire à d'autres utilisateurs ou à l'intégrité du service.",
      },
      {
        title: "5. Données des membres",
        content:
          "En tant qu'administrateur d'église, vous êtes responsable des données personnelles des membres que vous saisissez dans SoulTrack. Vous devez vous conformer aux lois applicables en matière de protection des données et obtenir les consentements nécessaires auprès de vos membres pour le traitement de leurs informations.",
      },
      {
        title: "6. Abonnements et paiements",
        content:
          "SoulTrack propose différents plans d'abonnement. Les frais sont facturés selon la fréquence choisie (mensuelle ou annuelle). Tous les paiements sont définitifs sauf disposition contraire dans notre politique de remboursement. Nous nous réservons le droit de modifier nos tarifs moyennant un préavis de 30 jours.",
      },
      {
        title: "7. Propriété intellectuelle",
        content:
          "SoulTrack et son contenu original, ses fonctionnalités et sa conception sont la propriété exclusive de SoulTrack et sont protégés par les lois sur la propriété intellectuelle. Vous ne pouvez pas reproduire, distribuer ou créer des œuvres dérivées sans notre autorisation écrite expresse.",
      },
      {
        title: "8. Limitation de responsabilité",
        content:
          "SoulTrack est fourni « tel quel » sans garantie d'aucune sorte. Dans toute la mesure permise par la loi, nous déclinons toute garantie expresse ou implicite. Nous ne serons pas responsables des dommages indirects, accessoires, spéciaux ou consécutifs résultant de l'utilisation du service.",
      },
      {
        title: "9. Résiliation",
        content:
          "Nous nous réservons le droit de suspendre ou de résilier votre accès à SoulTrack à tout moment, avec ou sans préavis, pour toute violation des présentes conditions. En cas de résiliation, vos données seront conservées pendant 30 jours avant suppression définitive.",
      },
      {
        title: "10. Modifications des conditions",
        content:
          "Nous pouvons mettre à jour ces conditions à tout moment. Les modifications importantes seront communiquées par e-mail ou via une notification dans l'application. L'utilisation continue de SoulTrack après notification constitue votre acceptation des nouvelles conditions.",
      },
      {
        title: "11. Contact",
        content:
          "Pour toute question concernant ces Conditions d'utilisation, veuillez nous contacter à support@soultrack.org ou via notre page de contact. Notre équipe vous répondra dans les meilleurs délais.",
      },
      {
        title: "12. Données relatives aux enfants",
        content:
          "Lorsque vous enregistrez des informations concernant des enfants dans SoulTrack, vous déclarez disposer de l'autorisation et des consentements nécessaires des parents, tuteurs légaux ou représentants autorisés. Vous êtes seul responsable de l'exactitude, de la légalité et de l'utilisation des données saisies, y compris les noms, dates de naissance et toute autre information relative aux enfants. SoulTrack agit uniquement comme fournisseur de la plateforme et n'est pas responsable des données enregistrées par les utilisateurs ni de leur conformité aux lois applicables en matière de protection des données des mineurs."
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
    heroLabel: "Terms of Service",
    heroTitle: "Our",
    heroHighlight: "Terms & Conditions",
    heroPara: "By using SoulTrack, you agree to these terms. Please read them carefully before using our platform.",
    lastUpdated: "Last updated",
    sections: [
      {
        title: "1. Acceptance of Terms",
        content:
          "By accessing or using SoulTrack, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service. These terms apply to all users, administrators, and members associated with church accounts.",
      },
      {
        title: "2. Description of Service",
        content:
          "SoulTrack is a church management platform designed to help religious communities manage their members, events, and administrative activities. We reserve the right to modify, suspend, or discontinue any aspect of the service at any time.",
      },
      {
        title: "3. Accounts & Registration",
        content:
          "To use SoulTrack, you must create an account by providing accurate and complete information. You are responsible for maintaining the confidentiality of your login credentials and all activities conducted under your account. Report any unauthorized access immediately to support@soultrack.org.",
      },
      {
        title: "4. Acceptable Use",
        content:
          "You agree to use SoulTrack only for lawful purposes and in accordance with these terms. You may not use the platform to distribute offensive, discriminatory, or illegal content, or for any activity that may harm other users or the integrity of the service.",
      },
      {
        title: "5. Member Data",
        content:
          "As a church administrator, you are responsible for the personal data of members you enter into SoulTrack. You must comply with applicable data protection laws and obtain necessary consents from your members for the processing of their information.",
      },
      {
        title: "6. Subscriptions & Payments",
        content:
          "SoulTrack offers various subscription plans. Fees are billed according to the chosen frequency (monthly or annual). All payments are final except as provided in our refund policy. We reserve the right to modify our pricing with 30 days' notice.",
      },
      {
        title: "7. Intellectual Property",
        content:
          "SoulTrack and its original content, features, and design are the exclusive property of SoulTrack and are protected by intellectual property laws. You may not reproduce, distribute, or create derivative works without our express written permission.",
      },
      {
        title: "8. Limitation of Liability",
        content:
          'SoulTrack is provided "as is" without warranty of any kind. To the fullest extent permitted by law, we disclaim all express or implied warranties. We shall not be liable for indirect, incidental, special, or consequential damages resulting from use of the service.',
      },
      {
        title: "9. Termination",
        content:
          "We reserve the right to suspend or terminate your access to SoulTrack at any time, with or without notice, for any violation of these terms. Upon termination, your data will be retained for 30 days before permanent deletion.",
      },
      {
        title: "10. Changes to Terms",
        content:
          "We may update these terms at any time. Significant changes will be communicated by email or via an in-app notification. Continued use of SoulTrack after notification constitutes your acceptance of the new terms.",
      },
      {
        title: "11. Contact",
        content:
          "For any questions regarding these Terms of Service, please contact us at support@soultrack.org or through our contact page. Our team will respond as soon as possible.",
      },
      {
        title: "6. Children's Data",
        content:
          "When you register information relating to children in SoulTrack, you represent and warrant that you have obtained all necessary permissions and consents from the children's parents, legal guardians, or authorized representatives. You are solely responsible for the accuracy, legality, and use of the data entered, including names, dates of birth, and any other information relating to children. SoulTrack acts solely as a platform provider and is not responsible for the data entered by users or for compliance with applicable laws regarding the protection of minors' personal data."
      },
    ],
    footer: "All rights reserved.",
  },
};

export default function TermsPage() {
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

          {/* NAV desktop */}
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
                onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
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

          {/* BOUTONS desktop */}
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
              }}
            >
              {t.signup}
            </button>
          </div>

          {/* Switcher langue desktop */}
          <div
            style={{ display: "flex", gap: "8px", alignItems: "center" }}
            className="nav-hide"
          >
            <button onClick={() => changeLang("fr")} title="Français" style={langBtnStyle(lang === "fr")}>
              <img src="https://flagcdn.com/w40/fr.png" srcSet="https://flagcdn.com/w80/fr.png 2x" width="32" height="22" alt="Français" style={{ display: "block", borderRadius: "3px" }} />
            </button>
            <button onClick={() => changeLang("en")} title="English" style={langBtnStyle(lang === "en")}>
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
                onClick={() => { router.push(item.path); setOpenMenu(false); }}
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
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <button onClick={() => changeLang("fr")} title="Français" style={langBtnStyle(lang === "fr")}>
                <img src="https://flagcdn.com/w20/fr.png" srcSet="https://flagcdn.com/w40/fr.png 2x" width="20" height="14" alt="Français" style={{ display: "block", borderRadius: "2px" }} />
              </button>
              <button onClick={() => changeLang("en")} title="English" style={langBtnStyle(lang === "en")}>
                <img src="https://flagcdn.com/w20/gb.png" srcSet="https://flagcdn.com/w40/gb.png 2x" width="20" height="14" alt="English" style={{ display: "block", borderRadius: "2px" }} />
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "4px" }}>
              <button
                onClick={() => { router.push("/login"); setOpenMenu(false); }}
                style={{ background: "transparent", color: "#fff", border: "0.5px solid rgba(255,255,255,0.35)", padding: "11px", borderRadius: "8px", fontSize: "14px", cursor: "pointer" }}
              >
                {t.login}
              </button>
              <button
                onClick={() => { router.push("/site/pricing"); setOpenMenu(false); }}
                style={{ background: "#fff", color: "#333699", border: "none", padding: "11px", borderRadius: "8px", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}
              >
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

      {/* ───── CONTENU TERMS ───── */}
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
              {/* top shine line */}
              <div style={{ position: "absolute", top: 0, left: "24px", right: "24px", height: "1px", background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)" }} />
              <h2 style={{ color: "#fbbf24", fontSize: "15px", fontWeight: 600, marginBottom: "12px", letterSpacing: "0.01em" }}>
                {section.title}
              </h2>
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
