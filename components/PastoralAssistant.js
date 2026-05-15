// components/PastoralAssistant.js
import { useState } from "react";

export default function PastoralAssistant({ membre, suivis, egliseId }) {
  const [loading, setLoading]   = useState(false);
  const [result, setResult]     = useState(null);
  const [error, setError]       = useState(null);
  const [open, setOpen]         = useState(false);

  async function generer() {
    setLoading(true);
    setError(null);
    setResult(null);
    setOpen(true);
    try {
      const res = await fetch("/api/pastoral/prepare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ membre, suivis, egliseId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data);
    } catch (e) {
      setError("Erreur : " + e.message);
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
          padding: "10px 16px",
          borderRadius: "12px",
          background: loading ? "#a0a0c0" : "linear-gradient(135deg, #2E3192 0%, #7F77DD 100%)",
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
        {loading ? (
          <>
            <Spinner /> Analyse en cours...
          </>
        ) : (
          "✨ Support pour l'entretien"
        )}
      </button>

      {error && (
        <div style={{ marginTop: 8, padding: "10px 14px", background: "#fee2e2", borderRadius: 10, color: "#991b1b", fontSize: 13 }}>
          {error}
        </div>
      )}

      {open && result && (
        <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 12 }}>

          {/* Compréhension */}
          <Section titre="Clés de compréhension" emoji="💡">
            <p style={styles.body}>{result.comprehension}</p>
          </Section>

          {/* Questions */}
          <Section titre="Questions à poser" emoji="🙏">
            {result.questions.map((q, i) => (
              <div key={i} style={styles.question}>{q}</div>
            ))}
          </Section>

          {/* Directions */}
          <Section titre="Directions d'accompagnement" emoji="🧭">
            {result.directions.map((d, i) => (
              <div key={i} style={styles.direction}>
                <span style={styles.num}>{i + 1}</span>
                <span style={styles.body}>{d}</span>
              </div>
            ))}
          </Section>

          {/* Versets */}
          <Section titre="Paroles qui éclairent" emoji="📖">
            {result.versets.map((v, i) => (
              <div key={i} style={styles.verset}>
                <strong style={styles.ref}>{v.reference}</strong>
                {v.texte}
              </div>
            ))}
          </Section>

          {/* Références */}
          <Section titre="Références pastorales" emoji="🎙️">
            {result.references.map((r, i) => (
              <div key={i} style={styles.refCard}>
                <span style={styles.refNom}>{r.nom}</span>
                <span style={styles.refSujet}>{r.sujet}</span>
              </div>
            ))}
          </Section>

          <button
            onClick={() => setOpen(false)}
            style={{ fontSize: 12, color: "#6b7280", background: "none", border: "none", cursor: "pointer", textAlign: "center" }}
          >
            Réduire ↑
          </button>
        </div>
      )}
    </div>
  );
}

function Section({ titre, emoji, children }) {
  return (
    <div style={{ background: "#f8faff", borderRadius: 12, padding: "12px 14px", border: "1px solid #e8eaf6" }}>
      <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#2E3192", marginBottom: 8 }}>
        {emoji} {titre}
      </p>
      {children}
    </div>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

const styles = {
  body: { fontSize: 13, color: "#374151", lineHeight: 1.6 },
  question: { fontSize: 13, color: "#1e293b", lineHeight: 1.5, padding: "8px 12px", background: "#eef2ff", borderRadius: 8, marginBottom: 6, borderLeft: "2px solid #2E3192" },
  direction: { display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 6 },
  num: { width: 22, height: 22, borderRadius: "50%", background: "#2E3192", color: "#fff", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 },
  verset: { fontSize: 13, color: "#3C3489", lineHeight: 1.6, padding: "8px 12px", background: "#eef2ff", borderRadius: 8, marginBottom: 6, fontStyle: "italic" },
  ref: { fontStyle: "normal", fontSize: 10, color: "#2E3192", display: "block", fontWeight: 700, marginBottom: 2 },
  refCard: { display: "flex", flexDirection: "column", padding: "6px 0", borderBottom: "0.5px solid #e8eaf6" },
  refNom: { fontSize: 13, fontWeight: 600, color: "#1e293b" },
  refSujet: { fontSize: 12, color: "#6b7280" },
};
