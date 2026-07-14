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
    heroLabel: "Politique de remboursement",
    heroTitle: "Transparent",
    heroHighlight: "et équitable",
    heroPara: "Nous croyons en une relation de confiance avec nos utilisateurs. Notre politique de remboursement est conçue pour être juste, claire et sans mauvaise surprise.",
    lastUpdated: "Dernière mise à jour",
    badge: "Satisfait ou remboursé",
    badgeSub: "sous 14 jours",
    sections: [
      {
        icon: "✅",
        title: "1. Période d'essai gratuite",
        content:
          "SoulTrack propose une période d'essai gratuite de 14 jours sans carte bancaire requise. Durant cette période, vous avez accès à toutes les fonctionnalités du plan choisi. Si vous décidez de ne pas continuer, aucun frais ne vous sera facturé. Aucune action n'est requise de votre part pour annuler.",
      },
      {
        icon: "💰",
        title: "2. Remboursement dans les 14 jours",
        content:
          "Si vous souscrivez à un abonnement payant et n'êtes pas satisfait, vous pouvez demander un remboursement complet dans les 14 jours suivant votre premier paiement. Cette garantie s'applique à votre premier achat uniquement. Pour initier un remboursement, contactez-nous à billing@soultrack.org avec votre numéro de compte.",
      },
      {
        icon: "🔄",
        title: "3. Remboursements au-delà de 14 jours",
        content:
          "Après la période de 14 jours, les remboursements sont examinés au cas par cas. Nous pouvons accorder un remboursement partiel ou total en cas de problème technique grave imputable à SoulTrack, d'interruption prolongée du service (plus de 48 heures consécutives), ou de facturation erronée de notre part. Ces situations font l'objet d'une analyse attentive.",
      },
      {
        icon: "📅",
        title: "4. Annulation d'abonnement",
        content:
          "Vous pouvez annuler votre abonnement à tout moment depuis les paramètres de votre compte. L'annulation prend effet à la fin de la période de facturation en cours — vous conservez l'accès jusqu'à cette date. Aucun remboursement n'est accordé pour la période restante sauf dans les cas mentionnés à l'article 3.",
      },
      {
        icon: "🔃",
        title: "5. Changement de plan",
        content:
          "Si vous passez à un plan supérieur en cours de période, vous êtes facturé au prorata pour les jours restants. Si vous rétrogradez vers un plan inférieur, la différence est créditée sur votre prochain cycle de facturation. Les changements de plan n'ouvrent pas de droit à remboursement en dehors de la fenêtre de 14 jours.",
      },
      {
        icon: "🚫",
        title: "6. Cas non remboursables",
        content:
          "Les remboursements ne sont pas accordés dans les situations suivantes : violation des conditions d'utilisation entraînant la suspension du compte, demandes formulées après la période de 14 jours sans motif valable, frais de transaction bancaires ou de conversion de devises, et abonnements offerts dans le cadre de promotions spéciales sauf indication contraire.",
      },
      {
        icon: "⏱️",
        title: "7. Délai de traitement",
        content:
          "Une fois votre demande de remboursement approuvée, le virement est effectué dans un délai de 5 à 10 jours ouvrables selon votre établissement bancaire. Les remboursements sont crédités sur le moyen de paiement original utilisé lors de l'achat. Nous vous enverrons une confirmation par e-mail dès que le remboursement sera traité.",
      },
      {
        icon: "📞",
        title: "8. Comment demander un remboursement",
        content:
          "Pour toute demande de remboursement, envoyez un e-mail à billing@soultrack.org en indiquant votre nom, l'adresse e-mail associée à votre compte, et la raison de votre demande. Notre équipe vous répondra dans un délai de 2 jours ouvrables. Vous pouvez également nous contacter via la page Contact ou par WhatsApp.",
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
    heroLabel: "Refund Policy",
    heroTitle: "Transparent",
    heroHighlight: "and fair",
    heroPara: "We believe in a relationship of trust with our users. Our refund policy is designed to be fair, clear, and free of unpleasant surprises.",
    lastUpdated: "Last updated",
    badge: "Satisfaction guaranteed",
    badgeSub: "within 14 days",
    sections: [
      {
        icon: "✅",
        title: "1. Free Trial Period",
        content:
          "SoulTrack offers a 14-day free trial with no credit card required. During this period, you have access to all features of your chosen plan. If you decide not to continue, you will not be charged. No action is required on your part to cancel.",
      },
      {
        icon: "💰",
        title: "2. Refund Within 14 Days",
        content:
          "If you subscribe to a paid plan and are not satisfied, you can request a full refund within 14 days of your first payment. This guarantee applies to your first purchase only. To initiate a refund, contact us at billing@soultrack.org with your account number.",
      },
      {
        icon: "🔄",
        title: "3. Refunds Beyond 14 Days",
        content:
          "After the 14-day period, refunds are reviewed on a case-by-case basis. We may grant a partial or full refund in the event of a serious technical issue attributable to SoulTrack, a prolonged service interruption (more than 48 consecutive hours), or an erroneous charge on our part. These situations are carefully analyzed.",
      },
      {
        icon: "📅",
        title: "4. Subscription Cancellation",
        content:
          "You can cancel your subscription at any time from your account settings. Cancellation takes effect at the end of the current billing period — you retain access until that date. No refund is granted for the remaining period except in the cases mentioned in section 3.",
      },
      {
        icon: "🔃",
        title: "5. Plan Changes",
        content:
          "If you upgrade to a higher plan mid-period, you are charged on a pro-rata basis for the remaining days. If you downgrade to a lower plan, the difference is credited to your next billing cycle. Plan changes do not entitle you to a refund outside the 14-day window.",
      },
      {
        icon: "🚫",
        title: "6. Non-Refundable Cases",
        content:
          "Refunds are not granted in the following situations: violation of the terms of service leading to account suspension, requests made after the 14-day period without valid reason, bank transaction or currency conversion fees, and subscriptions offered as part of special promotions unless otherwise stated.",
      },
      {
        icon: "⏱️",
        title: "7. Processing Time",
        content:
          "Once your refund request is approved, the transfer is processed within 5 to 10 business days depending on your bank. Refunds are credited to the original payment method used at purchase. We will send you a confirmation email as soon as the refund has been processed.",
      },
      {
        icon: "📞",
        title: "8. How to Request a Refund",
        content:
          "For any refund request, send an email to billing@soultrack.org stating your name, the email address associated with your account, and the reason for your request. Our team will respond within 2 business days. You can also contact us via the Contact page or by WhatsApp.",
      },
    ],
    footer: "All rights reserved.",
  },
};

export default function RefundPage() {
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

        {/* Badge garantie */}
        <div style={{ display: "inline-flex", alignItems: "center", gap: "10px", marginTop: "28px", background: "rgba(251,191,36,0.12)", border: "0.5px solid rgba(251,191,36,0.35)", borderRadius: "50px", padding: "10px 22px" }}>
          <span style={{ fontSize: "22px" }}>🛡️</span>
          <div style={{ textAlign: "left" }}>
            <div style={{ color: "#fbbf24", fontSize: "13px", fontWeight: 700, letterSpacing: "0.03em" }}>{t.badge}</div>
            <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "11px", letterSpacing: "0.04em" }}>{t.badgeSub}</div>
          </div>
        </div>

        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "12px", marginTop: "20px", letterSpacing: "0.04em" }}>
          {t.lastUpdated} : {lang === "fr" ? "1er janvier 2025" : "January 1, 2025"}
        </p>
      </section>

      {/* ───── CONTENU REFUND ───── */}
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

          {/* CTA contact */}
          <div style={{
            background: "rgba(251,191,36,0.1)",
            border: "0.5px solid rgba(251,191,36,0.25)",
            borderRadius: "16px",
            padding: "28px 30px",
            textAlign: "center",
            backdropFilter: "blur(8px)",
          }}>
            <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "14px", lineHeight: 1.8, marginBottom: "18px" }}>
              {lang === "fr"
                ? "Une question sur votre remboursement ? Notre équipe est là pour vous aider."
                : "A question about your refund? Our team is here to help."}
            </p>
            <button
              onClick={() => router.push("/site/contact")}
              style={{
                background: "#fff", color: "#333699", border: "none",
                padding: "11px 28px", borderRadius: "10px", fontSize: "14px",
                fontWeight: 600, cursor: "pointer", transition: "opacity 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.88")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              {lang === "fr" ? "Nous contacter" : "Contact us"}
            </button>
          </div>
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
