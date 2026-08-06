"use client";
import { useRouter } from "next/navigation";
import { useLang } from "../hooks/useLang";

const translations = {
  fr: { text: "Tous droits réservés." },
  en: { text: "All rights reserved." },
};

export default function SiteFooter() {
  const router = useRouter();
  const { lang } = useLang();
  const t = translations[lang];

  return (
    <footer
      style={{
        borderTop: "0.5px solid rgba(255,255,255,0.1)",
        padding: "20px 24px",
        boxSizing: "border-box",
        width: "100%",
      }}
    >
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          textAlign: "center",
          color: "rgba(255,255,255,0.35)",
          fontSize: "14px",
        }}
      >
        <div>
          © {new Date().getFullYear()} SoulTrack. {t.text}
        </div>

        <div
          style={{
            marginTop: "10px",
            display: "flex",
            justifyContent: "center",
            gap: "16px",
            flexWrap: "wrap",
          }}
        >
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
  );
}
