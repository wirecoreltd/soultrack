import { useRouter } from "next/router";
import Head from "next/head";
import { useLang } from "../../../hooks/useLang";
import HeaderSite from "../../../components/HeaderSite";
import { categories, tutorialDetails } from "../../../lib/aideContent";

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

export default function AideTutorialPage() {
  const router = useRouter();
  const { slug, tutorial } = router.query;
  const { lang } = useLang();

  const t = translations[lang];
  const category = categories[lang].find((c) => c.slug === slug);
  const detail = tutorialDetails[`${slug}/${tutorial}`]?.[lang];

  const pageTitle = detail ? `${detail.title} — Centre d'aide SoulTrack` : t.comingSoonTitle;

  return (
    <div style={{ background: "#333699", minHeight: "100vh", position: "relative", overflowX: "hidden" }}>
      <Head>
        <title>{pageTitle}</title>
        {detail && <meta name="description" content={detail.subtitle} />}
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
            style={{ color: "rgba(255,255,255,0.55)", fontSize: "13px", cursor: "pointer", display: "inline-block", marginBottom: "24px" }}
          >
            {t.backCategory(category ? category.title : "")}
          </span>

          {detail ? (
            <>
              <div style={{ textAlign: "center", marginBottom: "36px" }}>
                <p style={{ color: "rgba(251,191,36,0.85)", fontSize: "12px", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 600, marginBottom: "10px" }}>
                  Tutoriel
                </p>
                <h1 style={{ color: "#fff", fontSize: "clamp(1.6rem, 4vw, 2rem)", fontWeight: 500, marginBottom: "12px" }}>
                  {detail.title}
                </h1>
                <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "14px", lineHeight: 1.7, maxWidth: "420px", margin: "0 auto" }}>
                  {detail.subtitle}
                </p>
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
                      <p style={{ color: "#fff", fontSize: "14.5px", fontWeight: 500, margin: "0 0 4px" }}>{step.title}</p>
                      <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "13px", lineHeight: 1.6, margin: 0 }}>{step.description}</p>
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
              <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "14px" }}>{t.comingSoon}</p>
            </div>
          )}
        </div>
      </section>

      {/* ───── FOOTER ───── */}
      <footer style={{ borderTop: "0.5px solid rgba(255,255,255,0.1)", padding: "20px 24px", boxSizing: "border-box", width: "100%" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", textAlign: "center", color: "rgba(255,255,255,0.35)", fontSize: "14px" }}>
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
