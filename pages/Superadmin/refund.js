"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import supabase from "../../lib/supabaseClient";
import HeaderPages from "../../components/HeaderPages";
import ProtectedRoute from "../../components/ProtectedRoute";
import Footer from "../../components/Footer";

const STATUTS = [
  { id: "pending",  label: "En attente", emoji: "⏳", color: "rgba(251,191,36,0.85)"  },
  { id: "approved", label: "Traité",     emoji: "✔",  color: "rgba(29,158,117,0.85)"  },
  { id: "rejected", label: "Rejeté",     emoji: "✖",  color: "rgba(239,68,68,0.85)"   },
];

function RefundContent() {
  const router = useRouter();
  const [rows, setRows]                 = useState([]);
  const [loading, setLoading]           = useState(true);
  const [filterText, setFilterText]     = useState("");
  const [filterStatut, setFilterStatut] = useState("all");
  const [modal, setModal]               = useState(null);
  const [updating, setUpdating]         = useState(false);
  const [message, setMessage]           = useState(null);

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return router.push("/login");
    const { data, error } = await supabase
      .from("contact")
      .select("*")
      .eq("type", "refund")
      .order("created_at", { ascending: false });
    if (error) { console.error(error); setRows([]); }
    else setRows(data || []);
    setLoading(false);
  }

  const filtered = useMemo(() => rows.filter(r => {
    const label = [r.nom, r.email, r.message].filter(Boolean).join(" ").toLowerCase();
    const matchText   = filterText.trim() === "" || label.includes(filterText.toLowerCase());
    const matchStatut = filterStatut === "all" || r.status === filterStatut;
    return matchText && matchStatut;
  }), [rows, filterText, filterStatut]);

  async function changerStatut(newStatus) {
    if (!modal || newStatus === modal.statusActuel) return;
    setUpdating(true); setMessage(null);
    const { error } = await supabase.from("contact").update({ status: newStatus }).eq("id", modal.id);
    if (error) { setMessage({ type: "error", text: "Erreur lors de la mise à jour." }); }
    else { setMessage({ type: "success", text: "Statut mis à jour !" }); setModal(null); loadAll(); }
    setUpdating(false);
  }

  function openModal(row) {
    setMessage(null);
    setModal({ id: row.id, statusActuel: row.status, nom: row.nom, message: row.message, email: row.email });
  }

  return (
    <div style={{ background: "#333699", minHeight: "100vh", paddingTop: "24px" }}>
      <HeaderPages />

      <div style={{ textAlign: "center", padding: "28px 24px 0" }}>
        <h1 style={{ color: "#fff", fontSize: "clamp(1.4rem,3vw,2rem)", fontWeight: 700, margin: 0 }}>
          Suggestions d'<span style={{ color: "#6ee7b7" }}>Amélioration</span>
        </h1>
        <p style={{ color: "rgba(255,255,255,0.5)", marginTop: "8px", fontSize: "14px" }}>
          Consultez et traitez les suggestions soumises par les utilisateurs.
        </p>
      </div>

      <div style={{ maxWidth: "1000px", margin: "24px auto 0", padding: "0 20px", display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center" }}>
        <div style={{ flex: "1 1 300px", position: "relative" }}>
          <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", fontSize: "15px", pointerEvents: "none" }}>🔍</span>
          <input type="text" placeholder="Nom · Email · Message…" value={filterText} onChange={e => setFilterText(e.target.value)}
            style={{ width: "100%", padding: "10px 14px 10px 36px", borderRadius: "10px", border: "0.5px solid rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.1)", color: "#fff", fontSize: "14px", outline: "none", boxSizing: "border-box" }} />
        </div>
        <div style={{ flex: "0 1 180px" }}>
          <select value={filterStatut} onChange={e => setFilterStatut(e.target.value)}
            style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "0.5px solid rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.1)", color: "#fff", fontSize: "14px", outline: "none", cursor: "pointer" }}>
            <option value="all" style={{ color: "#000" }}>Tous les statuts</option>
            {STATUTS.map(s => <option key={s.id} value={s.id} style={{ color: "#000" }}>{s.emoji} {s.label}</option>)}
          </select>
        </div>
        <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px" }}>{filtered.length} suggestion{filtered.length !== 1 ? "s" : ""}</span>
      </div>

      <div style={{ maxWidth: "1000px", margin: "20px auto 60px", padding: "0 20px" }}>
        {loading ? (
          <p style={{ color: "#fff", textAlign: "center", marginTop: "60px" }}>Chargement…</p>
        ) : filtered.length === 0 ? (
          <p style={{ color: "rgba(255,255,255,0.4)", textAlign: "center", marginTop: "60px" }}>Aucune suggestion trouvée.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr 2fr 130px 100px", padding: "0 16px 10px", borderBottom: "0.5px solid rgba(255,255,255,0.1)", gap: "8px" }} className="desk-only">
              {["Nom", "Email", "Message", "Statut", ""].map((h, i) => (
                <span key={i} style={{ color: "rgba(255,255,255,0.3)", fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.09em" }}>{h}</span>
              ))}
            </div>

            {filtered.map(row => {
              const statut = STATUTS.find(s => s.id === row.status) || STATUTS[0];
              return (
                <div key={row.id} style={{ background: "rgba(255,255,255,0.07)", borderRadius: "12px", border: "0.5px solid rgba(255,255,255,0.07)", overflow: "hidden" }}>
                  {/* DESKTOP */}
                  <div className="desk-only" style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr 2fr 130px 100px", alignItems: "center", padding: "13px 16px", gap: "8px" }}>
                    <span style={{ color: "#fff", fontWeight: 700, fontSize: "13px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.nom || "—"}</span>
                    <span style={{ color: "rgba(255,255,255,0.52)", fontSize: "13px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.email || "—"}</span>
                    <span style={{ color: "rgba(255,255,255,0.72)", fontSize: "13px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.message || "—"}</span>
                    <span style={{ display: "inline-flex", alignItems: "center", background: statut.color, color: "#fff", fontSize: "11px", fontWeight: 700, padding: "3px 10px", borderRadius: "20px", whiteSpace: "nowrap" }}>{statut.emoji} {statut.label}</span>
                    <ActionBtn onClick={() => openModal(row)} />
                  </div>
                  {/* MOBILE */}
                  <div className="mob-only" style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
                      <div style={{ flex: 1 }}>
                        <p style={{ color: "#fff", fontWeight: 700, fontSize: "15px", margin: 0 }}>{row.nom || "Anonyme"}</p>
                        <p style={{ color: "rgba(255,255,255,0.42)", fontSize: "12px", margin: "3px 0 0" }}>{row.email}</p>
                      </div>
                      <span style={{ background: statut.color, color: "#fff", fontSize: "11px", fontWeight: 700, padding: "3px 10px", borderRadius: "20px", whiteSpace: "nowrap" }}>{statut.emoji} {statut.label}</span>
                    </div>
                    <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "13px", margin: "10px 0" }}>{row.message}</p>
                    <div style={{ display: "flex", justifyContent: "flex-end" }}><ActionBtn onClick={() => openModal(row)} /></div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {modal && (
        <div onClick={e => { if (e.target === e.currentTarget) setModal(null); }}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: "20px" }}>
          <div style={{ background: "#1e2070", borderRadius: "20px", padding: "28px 24px", width: "100%", maxWidth: "420px", border: "0.5px solid rgba(255,255,255,0.15)" }}>
            <h2 style={{ color: "#fff", fontSize: "17px", fontWeight: 700, margin: "0 0 4px" }}>🚀 Changer le statut</h2>
            <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "13px", margin: "0 0 8px" }}>{modal.nom}</p>
            <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "13px", fontStyle: "italic", margin: "0 0 20px", borderLeft: "3px solid rgba(255,255,255,0.15)", paddingLeft: "10px" }}>"{modal.message}"</p>
            {message && (
              <div style={{ marginBottom: "16px", padding: "10px 14px", borderRadius: "10px", background: message.type === "error" ? "rgba(239,68,68,0.15)" : "rgba(110,231,183,0.15)", color: message.type === "error" ? "#f87171" : "#6ee7b7", fontSize: "13px", fontWeight: 600, border: `0.5px solid ${message.type === "error" ? "rgba(239,68,68,0.3)" : "rgba(110,231,183,0.3)"}` }}>{message.text}</div>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {STATUTS.map(s => {
                const estActuel = s.id === modal.statusActuel;
                return (
                  <button key={s.id} onClick={() => changerStatut(s.id)} disabled={updating || estActuel}
                    style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderRadius: "12px", cursor: estActuel ? "default" : "pointer", border: estActuel ? `1.5px solid ${s.color}` : "0.5px solid rgba(255,255,255,0.15)", background: estActuel ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.07)", opacity: updating && !estActuel ? 0.5 : 1 }}>
                    <span style={{ color: "#fff", fontWeight: 600, fontSize: "14px" }}>
                      {s.emoji} {s.label}
                      {estActuel && <span style={{ color: "#fbbf24", fontSize: "11px", marginLeft: "8px" }}>• Actuel</span>}
                    </span>
                  </button>
                );
              })}
            </div>
            <button onClick={() => setModal(null)} style={{ marginTop: "20px", width: "100%", padding: "10px", borderRadius: "10px", border: "0.5px solid rgba(255,255,255,0.15)", background: "transparent", color: "rgba(255,255,255,0.4)", fontSize: "14px", cursor: "pointer" }}>Annuler</button>
          </div>
        </div>
      )}

      <Footer />
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { margin: 0; padding: 0; background: #333699; }
        .desk-only { display: grid !important; }
        .mob-only  { display: none  !important; }
        @media (max-width: 768px) {
          .desk-only { display: none  !important; }
          .mob-only  { display: block !important; }
        }
        input::placeholder { color: rgba(255,255,255,0.3); }
        select option { background: #1e2070; }
      `}</style>
    </div>
  );
}

function ActionBtn({ onClick }) {
  return (
    <button onClick={onClick}
      style={{ background: "rgba(255,255,255,0.1)", color: "#fff", border: "0.5px solid rgba(255,255,255,0.22)", padding: "6px 14px", borderRadius: "8px", fontSize: "12px", fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}
      onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.18)"}
      onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
    >Gérer</button>
  );
}

export default function RefundPage() {
  return (
    <ProtectedRoute allowedRoles={["Superadmin"]}>
      <RefundContent />
    </ProtectedRoute>
  );
}
