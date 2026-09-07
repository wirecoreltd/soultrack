import { useRouter } from "next/router";
import Head from "next/head";
import { useLang } from "../../../hooks/useLang";
import HeaderSite from "../../../components/HeaderSite";
import { categories, tutorialDetails, subTutorials } from "../../../lib/aideContent";

const translations = {
  fr: {
    footer: "Tous droits réservés.",
    backCategory: (title) => `← ${title}`,
    comingSoonTitle: "Tutoriel à venir",
    comingSoon: "Ce tutoriel arrive bientôt.",
  },
  en: {
    footer: "All rights reserved.",
    backCategory: (title) => `← ${title}`,
    comingSoonTitle: "Tutorial coming soon",
    comingSoon: "This tutorial is on its way.",
  },
};

// ── Parse "**mot-clé**" et le colore en amber-300 ───────────────────────────
function renderWithKeywords(text) {
  if (!text) return null;
  const parts = text.split("**");
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <span key={i} style={{ color: "#fcd34d", fontWeight: 600 }}>
        {part}
      </span>
    ) : (
      part
    )
  );
}

export default function AideTutorialPage() {
  const router = useRouter();
  const { slug, tutorial } = router.query;
  const { lang } = useLang();

  const t = translations[lang];
  const category = categories[lang].find((c) => c.slug === slug);

  // 3ᵉ niveau : ce tuto a-t-il une liste de sous-tutoriels (ex: "membres/list-members") ?
  const subList = subTutorials[`${slug}/${tutorial}`]?.[lang];
  const detail = tutorialDetails[`${slug}/${tutorial}`]?.[lang];

  const pageTitle = detail ? `${detail.title} — Centre d'aide SoulTrack` : t.comingSoonTitle;

  // ── Cas 1 : liste de sous-tutoriels (comportement identique à la page catégorie) ──
  if (subList) {
    return (
      <div style={{ background: "#333699", minHeight: "100vh", position: "relative", overflowX: "hidden" }}>
        <Head>
          <title>{detail ? detail.title : pageTitle} — Centre d'aide SoulTrack</title>
          <link rel="canonical" href={`https://soultrack.org/aide/${slug}/${tutorial}`} />
        </Head>

        <div style={{
          position: "absolute", width: "700px", height: "700px", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,255,255,0.10) 0%, transparent 65%)",
          top: "40px", left: "50%", transform: "translateX(-50%)",
          pointerEvents: "none", zIndex: 0,
        }} />

        <HeaderSite />

        <section style={{ padding: "50px max(16px, 4vw) 100px", position: "relative", zIndex: 1 }}>
          <div style={{ maxWidth: "700px", margin: "0 auto" }}>

            <span
              onClick={() => router.push(`/aide/${slug}`)}
              style={{ color: "rgba(255,255,255,0.55)", fontSize: "13px", cursor: "pointer", display: "inline-block", marginBottom: "28px" }}
            >
              {t.backCategory(category ? category.title : "")}
            </span>

            <div style={{ textAlign: "center", marginBottom: "36px" }}>
              <h1 style={{ color: "#fff", fontSize: "clamp(1.8rem, 4vw, 2.3rem)", fontWeight: 500, marginBottom: "16px" }}>
                {detail ? detail.title : ""}
              </h1>
              <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "15px", lineHeight: 1.8, maxWidth: "560px", margin: "0 auto" }}>
                {subList.subtitle}
              </p>
            </div>

            <div style={{
              background: "rgba(255,255,255,0.07)",
              border: "0.5px solid rgba(255,255,255,0.12)",
              borderRadius: "16px",
              overflow: "hidden",
              backdropFilter: "blur(8px)",
            }}>
              {subList.items.map((item, i) => (
                <div
                  key={item.slug}
                  onClick={() => router.push(`/aide/${slug}/${tutorial}/${item.slug}`)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                    padding: "16px 20px",
                    cursor: "pointer",
                    borderTop: i === 0 ? "none" : "0.5px solid rgba(255,255,255,0.08)",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <span style={{ fontSize: "20px", flexShrink: 0 }}>{item.emoji}</span>
                  <span style={{ color: "#fff", fontSize: "15px", flex: 1 }}>{item.title}</span>
                  <span style={{ color: "#fbbf24", fontSize: "16px" }}>›</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <footer style={{ borderTop: "0.5px solid rgba(255,255,255,0.1)", padding: "20px 24px", boxSizing: "border-box", width: "100%" }}>
          <div style={{ maxWidth: "1100px", margin: "0 auto", textAlign: "center", color: "rgba(255,255,255,0.7)", fontSize: "14px" }}>
            © {new Date().getFullYear()} SoulTrack. {t.footer}
          </div>
        </footer>

        <style>{`
          html, body { width: 100%; overflow-x: hidden; }
          * { box-sizing: border-box; }
        `}</style>
      </div>
    );
  }

  // ── Cas 2 : tutoriel avec étapes détaillées (comportement d'origine) ──
  return (
    <div style={{ background: "#333699", minHeight: "100vh", position: "relative", overflowX: "hidden" }}>
      <Head>
        <title>{pageTitle}</title>
        {detail && <meta name="description" content={detail.subtitle || detail.title} />}
        {detail && <link rel="canonical" href={`https://soultrack.org/aide/${slug}/${tutorial}`} />}
      </Head>

      {/* GLOW */}
      <div style={{
        position: "absolute", width: "700px", height: "700px", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(255,255,255,0.10) 0%, transparent 65%)",
        top: "40px", left: "50%", transform: "translateX(-50%)",
        pointerEvents: "none", zIndex: 0,
      }} />

      <HeaderSite />

      <section style={{ padding: "50px max(16px, 4vw) 100px", position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: "560px", margin: "0 auto" }}>

          <span
            onClick={() => router.push(`/aide/${slug}`)}
            style={{ color: "#fcd34d", fontSize: "13px", cursor: "pointer", display: "inline-block", marginBottom: "24px", fontWeight: 600 }}
          >
            {t.backCategory(category ? category.title : "")}
          </span>

          {detail ? (
            <>
              <div style={{ textAlign: "center", marginBottom: "36px" }}>
                <p style={{ color: "#fcd34d", fontSize: "12px", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 600, marginBottom: "10px" }}>
                  Tutoriel
                </p>
                <h1 style={{ color: "#fff", fontSize: "clamp(1.6rem, 4vw, 2rem)", fontWeight: 500, marginBottom: "12px" }}>
                  {renderWithKeywords(detail.title)}
                </h1>
                {detail.subtitle && (
                  <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "14px", lineHeight: 1.7, maxWidth: "420px", margin: "0 auto" }}>
                    {renderWithKeywords(detail.subtitle)}
                  </p>
                )}
              </div>

              <div>
                {detail.steps.map((step, i) => (
                  <div key={i} style={{ display: "flex", gap: "16px" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                      <div style={{
                        width: "26px", height: "26px", borderRadius: "50%",
                        background: "rgba(251,191,36,0.18)", color: "#fbbf24",
                        fontSize: "13px", fontWeight: 500,
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        {i + 1}
                      </div>
                      {i < detail.steps.length - 1 && (
                        <div style={{ width: "1px", flex: 1, background: "rgba(255,255,255,0.15)", marginTop: "4px" }} />
                      )}
                    </div>
                    <div style={{ paddingBottom: i < detail.steps.length - 1 ? "24px" : 0 }}>
                      <p style={{ color: "#fff", fontSize: "14.5px", fontWeight: 500, margin: "0 0 4px" }}>
                        {renderWithKeywords(step.title)}
                      </p>
                      <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "13px", lineHeight: 1.6, margin: 0 }}>
                        {renderWithKeywords(step.description)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={{
              textAlign: "center",
              background: "rgba(255,255,255,0.05)",
              border: "0.5px solid rgba(255,255,255,0.1)",
              borderRadius: "16px",
              padding: "40px 24px",
            }}>
              <p style={{ color: "#fff", fontSize: "16px", fontWeight: 500, marginBottom: "8px" }}>{t.comingSoonTitle}</p>
              <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "14px" }}>{t.comingSoon}</p>
            </div>
          )}
        </div>
      </section>

      {/* ───── FOOTER ───── */}
      <footer style={{ borderTop: "0.5px solid rgba(255,255,255,0.1)", padding: "20px 24px", boxSizing: "border-box", width: "100%" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", textAlign: "center", color: "rgba(255,255,255,0.7)", fontSize: "14px" }}>
          © {new Date().getFullYear()} SoulTrack. {t.footer}
        </div>
      </footer>

      <style>{`
        html, body { width: 100%; overflow-x: hidden; }
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
}
