import { useRouter } from "next/router";
import Head from "next/head";
import { useLang } from "../../hooks/useLang";
import HeaderSite from "../../components/HeaderSite";
import { categories, tutorials } from "../../lib/aideContent";

const translations = {
  fr: {
    footer: "Tous droits réservés.",
    back: "← Centre d'aide",
    comingSoonTitle: "Tutoriels à venir",
    comingSoon: "Les tutoriels de cette catégorie arrivent bientôt.",
  },
  en: {
    footer: "All rights reserved.",
    back: "← Help center",
    comingSoonTitle: "Tutorials coming soon",
    comingSoon: "Tutorials for this category are on their way.",
  },
};

export default function AideCategoryPage() {
  const router = useRouter();
  const { slug } = router.query;
  const { lang } = useLang();

  const t = translations[lang];
  const category = categories[lang].find((c) => c.slug === slug);
  const content = tutorials[slug]?.[lang];

  const pageTitle = category ? `${category.title} — Centre d'aide SoulTrack` : t.back;

  return (
    <div style={{ background: "#333699", minHeight: "100vh", position: "relative", overflowX: "hidden" }}>
      <Head>
        <title>{pageTitle}</title>
        {category && <meta name="description" content={category.description} />}
        {category && <link rel="canonical" href={`https://soultrack.org/aide/${category.slug}`} />}
      </Head>

      {/* GLOWS */}
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
            onClick={() => router.push("/aide")}
            style={{ color: "rgba(255,255,255,0.55)", fontSize: "13px", cursor: "pointer", display: "inline-block", marginBottom: "28px" }}
          >
            {t.back}
          </span>

          {category ? (
            <>
              <div style={{ textAlign: "center", marginBottom: "36px" }}>
                <div style={{ fontSize: "34px", marginBottom: "14px" }}>{category.emoji}</div>
                <h1 style={{ color: "#fff", fontSize: "clamp(1.8rem, 4vw, 2.3rem)", fontWeight: 500, marginBottom: "16px" }}>
                  {category.title}
                </h1>
                <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "15px", lineHeight: 1.8, maxWidth: "560px", margin: "0 auto" }}>
                  {content ? content.subtitle : category.description}
                </p>
              </div>

              {content ? (
                <div style={{
                  background: "rgba(255,255,255,0.07)",
                  border: "0.5px solid rgba(255,255,255,0.12)",
                  borderRadius: "16px",
                  overflow: "hidden",
                  backdropFilter: "blur(8px)",
                }}>
                  {content.items.map((item, i) => (
                    <div
                      key={item.slug}
                      onClick={() => router.push(`/aide/${category.slug}/${item.slug}`)}
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
            </>
          ) : (
            <p style={{ color: "rgba(255,255,255,0.6)", textAlign: "center" }}>{t.comingSoon}</p>
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
