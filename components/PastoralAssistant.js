"use client";
import { useState } from "react";
import { useLang } from "../../hooks/useLang";

const translations = {
  fr: {
    btnPreparer: "✨ Préparer cet entretien",
    btnLoading: "Préparation en cours...",
    erreur: "Erreur : ",
    fermer: "Fermer le support ↑",

    // Section titles
    avantDentrer: "Avant d'entrer",
    clesComprehension: "Clés de compréhension",
    questionsAPoser: "Questions à poser pendant l'entretien",
    pistesAider: "Pistes pour l'aider à avancer",
    parolesAPartager: "Paroles à partager",
  },
  en: {
    btnPreparer: "✨ Prepare this meeting",
    btnLoading: "Preparing...",
    erreur: "Error: ",
    fermer: "Close support ↑",

    // Section titles
    avantDentrer: "Before you begin",
    clesComprehension: "Key insights",
    questionsAPoser: "Questions to ask during the meeting",
    pistesAider: "Ways to help them move forward",
    parolesAPartager: "Scriptures to share",
  },
};

export default function PastoralAssistant({ membre, suivis }) {
  const { lang } = useLang();
  const t = translations[lang];

  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState(null);
  const [error, setError]     = useState(null);
  const [open, setOpen]       = useState(false);

  async function generer() {
    setLoading(true);
    setError(null);
    setOpen(true);
    try {
      const res = await fetch("/api/pastoral/prepare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ membre, suivis }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data);
    } catch (e) {
      setError(t.erreur + e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ marginBottom: "1rem" }}>

      <button
        onClick={generer}
        disabled={loading}
        style={{
          width: "100%",
          padding: "11px 16px",
          borderRadius: "12px",
          background: loading
            ? "#a0a0c0"
            : "linear-gradient(135deg, #2E3192 0%, #7F77DD 100%)",
          color: "#fff",
          fontWeight: 600,
          fontSize: "14px",
          border: "none",
          cursor: loading ? "not-allowed" : "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
        }}
      >
        {loading
          ? <><Spinner /> {t.btnLoading}</>
          : t.btnPreparer}
      </button>

      {error && (
        <div style={{ marginTop: 8, padding: "10px 14px", background: "#fee2e2", borderRadius: 10, color: "#991b1b", fontSize: 13 }}>
          {error}
        </div>
      )}

      {open && result && (
        <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>

          {/* Avant d'entrer */}
          <Section emoji="🚪" titre={t.avantDentrer}>
            <p style={styles.body}>{result.avant_dentrer}</p>
          </Section>

          {/* Clés de compréhension */}
          <Section emoji="💡" titre={t.clesComprehension}>
            <p style={styles.body}>{result.cles_comprehension}</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
              {result.mots_cles?.map((m, i) => (
                <span key={i} style={styles.tag}>{m}</span>
              ))}
            </div>
          </Section>

          {/* Questions à poser */}
          <Section emoji="🙏" titre={t.questionsAPoser}>
            {result.questions_a_poser?.map((q, i) => (
              <div key={i} style={styles.question}>
                <span style={styles.qNum}>{i + 1}</span>
                <span>{q}</span>
              </div>
            ))}
          </Section>

          {/* Pistes */}
          <Section emoji="🧭" titre={t.pistesAider}>
            {result.pistes_accompagnement?.map((p, i) => (
              <div key={i} style={styles.piste}>
                <span style={styles.num}>{i + 1}</span>
                <span style={styles.body}>{p}</span>
              </div>
            ))}
          </Section>

          {/* Versets */}
          <Section emoji="📖" titre={t.parolesAPartager}>
            {result.versets?.map((v, i) => (
              <div key={i} style={styles.verset}>
                <strong style={styles.versetRef}>{v.reference}</strong>
                {v.texte}
              </div>
            ))}
          </Section>

          <button
            onClick={() => { setResult(null); setOpen(false); }}
            style={{ fontSize: 12, color: "#6b7280", background: "none", border: "none", cursor: "pointer", textAlign: "center", marginTop: 4 }}
          >
            {t.fermer}
          </button>

        </div>
      )}
    </div>
  );
}

function Section({ emoji, titre, children }) {
  return (
    <div style={{ background: "#f8faff", borderRadius: 12, padding: "12px 14px", border: "1px solid #e8eaf6" }}>
      <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#2E3192", marginBottom: 10 }}>
        {emoji} {titre}
      </p>
      {children}
    </div>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
      <path d="M12 2a10 10 0 0 1 10 10" />
    </svg>
  );
}

const styles = {
  body: {
    fontSize: 13,
    color: "#374151",
    lineHeight: 1.6,
    margin: 0,
  },
  tag: {
    fontSize: 11,
    background: "#e8eaf6",
    color: "#2E3192",
    borderRadius: 20,
    padding: "3px 10px",
    fontWeight: 600,
  },
  question: {
    display: "flex",
    alignItems: "flex-start",
    gap: 10,
    padding: "8px 0",
    borderBottom: "1px solid #e8eaf6",
    fontSize: 13,
    color: "#374151",
    lineHeight: 1.5,
  },
  qNum: {
    minWidth: 22,
    height: 22,
    borderRadius: "50%",
    background: "#2E3192",
    color: "#fff",
    fontSize: 11,
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  piste: {
    display: "flex",
    alignItems: "flex-start",
    gap: 10,
    padding: "6px 0",
  },
  num: {
    minWidth: 20,
    height: 20,
    borderRadius: "50%",
    background: "#e8eaf6",
    color: "#2E3192",
    fontSize: 11,
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  verset: {
    fontSize: 13,
    color: "#374151",
    lineHeight: 1.6,
    padding: "8px 0",
    borderBottom: "1px solid #e8eaf6",
    display: "flex",
    flexDirection: "column",
    gap: 2,
  },
  versetRef: {
    color: "#2E3192",
    fontSize: 11,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  },
};
