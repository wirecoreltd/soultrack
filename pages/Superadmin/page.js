"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import supabase from "../../lib/supabaseClient";
import HeaderPages from "../../components/HeaderPages";
import ProtectedRoute from "../../components/ProtectedRoute";
import Footer from "../../components/Footer";

const PLANS = [
  { id: "free",       nom: "Départ",     prix: "Gratuit",    limite: 50,   emoji: "🌱", color: "rgba(29,158,117,0.7)"  },
  { id: "starter",    nom: "Croissance", prix: "$19/mois",   limite: 200,  emoji: "📈", color: "rgba(55,138,221,0.7)"  },
  { id: "vision",     nom: "Vision",     prix: "$39/mois",   limite: 500,  emoji: "🔥", color: "rgba(251,191,36,0.8)"  },
  { id: "expansion",  nom: "Expansion",  prix: "$79/mois",   limite: 1500, emoji: "🌍", color: "rgba(212,83,126,0.8)"  },
  { id: "enterprise", nom: "Réseaux",    prix: "Sur mesure", limite: null, emoji: "🔗", color: "rgba(139,92,246,0.8)"  },
];

function BillingContent() {
  const router = useRouter();

  const [rows, setRows]           = useState([]);   // { eglise, subscription, membres }
  const [loading, setLoading]     = useState(true);
  const [filterText, setFilterText] = useState("");
  const [filterPlan, setFilterPlan] = useState("all");

  // ── modal changement de plan ──
  const [modal, setModal]         = useState(null);  // { egliseId, planActuelId }
  const [upgrading, setUpgrading] = useState(false);
  const [message, setMessage]     = useState(null);

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return router.push("/login");

    // 1. Toutes les églises
    const { data: eglises, error } = await supabase
      .from("eglises")
      .select("id, nom, denomination, branche, ville, pays")
      .order("nom");

    if (error || !eglises?.length) { setLoading(false); return; }

    // 2. Tous les abonnements
    const { data: subs } = await supabase
      .from("subscriptions")
      .select("eglise_id, plan_id, current_period_end");

    // 3. Nombre de membres par église
    const { data: membresRaw } = await supabase
      .from("membres_complets")
      .select("eglise_id")
      .is("raison_supprime", null);

    const membresCount = {};
    (membresRaw || []).forEach(m => {
      membresCount[m.eglise_id] = (membresCount[m.eglise_id] || 0) + 1;
    });

    const subMap = {};
    (subs || []).forEach(s => { subMap[s.eglise_id] = s; });

    const combined = eglises.map(e => ({
      eglise: e,
      subscription: subMap[e.id] || null,
      membres: membresCount[e.id] || 0,
    }));

    setRows(combined);
    setLoading(false);
  }

  // ── filtres ──
  const filtered = useMemo(() => {
    return rows.filter(r => {
      const e = r.eglise;
      const label = [e.denomination, e.nom, e.branche, e.ville, e.pays]
        .filter(Boolean).join(" ").toLowerCase();
      const matchText = filterText.trim() === "" || label.includes(filterText.toLowerCase());
      const matchPlan = filterPlan === "all" || (r.subscription?.plan_id ?? "free") === filterPlan;
      return matchText && matchPlan;
    });
  }, [rows, filterText, filterPlan]);

  // ── changer plan ──
  async function changerPlan(newPlanId) {
    if (!modal || newPlanId === modal.planActuelId) return;
    setUpgrading(true);
    setMessage(null);

    const res = await fetch("/api/billing/upgrade", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eglise_id: modal.egliseId, new_plan_id: newPlanId }),
    });

    const data = await res.json();
    if (!res.ok) {
      setMessage({ type: "error", text: data.message || "Erreur lors du changement de plan." });
    } else {
      setMessage({ type: "success", text: "Plan mis à jour !" });
      setModal(null);
      loadAll();
    }
    setUpgrading(false);
  }

  return (
    <div style={{ background: "#333699", minHeight: "100vh", position: "relative" }}>
      <HeaderPages />

      {/* ── TITRE ── */}
      <div style={{ textAlign: "center", padding: "28px 24px 0" }}>
        <h1 style={{ color: "#fff", fontSize: "clamp(1.4rem,3vw,2rem)", fontWeight: 700, margin: 0 }}>
          Abonnements <span style={{ color: "#6ee7b7" }}>SoulTrack</span>
        </h1>
        <p style={{ color: "rgba(255,255,255,0.6)", marginTop: "8px", fontSize: "14px" }}>
          Gérez les plans de toutes les églises enregistrées sur la plateforme.
        </p>
      </div>

      {/* ── FILTRES ── */}
      <div style={{
        maxWidth: "1200px", margin: "24px auto 0", padding: "0 20px",
        display: "flex", flexWrap: "wrap", gap: "12px",
      }}>
        {/* Filtre texte combiné */}
        <div style={{ flex: "1 1 300px", position: "relative" }}>
          <span style={{
            position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)",
            fontSize: "16px", pointerEvents: "none",
          }}>🔍</span>
          <input
            type="text"
            placeholder="Dénomination · Nom · Branche · Ville · Pays…"
            value={filterText}
            onChange={e => setFilterText(e.target.value)}
            style={{
              width: "100%", padding: "10px 14px 10px 38px",
              borderRadius: "10px", border: "0.5px solid rgba(255,255,255,0.2)",
              background: "rgba(255,255,255,0.1)", color: "#fff",
              fontSize: "14px", outline: "none", boxSizing: "border-box",
            }}
          />
        </div>

        {/* Filtre plan */}
        <div style={{ flex: "0 1 200px" }}>
          <select
            value={filterPlan}
            onChange={e => setFilterPlan(e.target.value)}
            style={{
              width: "100%", padding: "10px 14px",
              borderRadius: "10px", border: "0.5px solid rgba(255,255,255,0.2)",
              background: "rgba(255,255,255,0.1)", color: "#fff",
              fontSize: "14px", outline: "none", cursor: "pointer",
            }}
          >
            <option value="all" style={{ color: "#000" }}>Tous les plans</option>
            {PLANS.map(p => (
              <option key={p.id} value={p.id} style={{ color: "#000" }}>
                {p.emoji} {p.nom}
              </option>
            ))}
          </select>
        </div>

        {/* Compteur résultats */}
        <div style={{
          flex: "0 0 auto", display: "flex", alignItems: "center",
          color: "rgba(255,255,255,0.5)", fontSize: "13px",
        }}>
          {filtered.length} église{filtered.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* ── TABLEAU ── */}
      <div style={{ maxWidth: "1200px", margin: "20px auto 60px", padding: "0 20px" }}>
        {loading ? (
          <p style={{ color: "#fff", textAlign: "center", marginTop: "60px" }}>Chargement…</p>
        ) : filtered.length === 0 ? (
          <p style={{ color: "rgba(255,255,255,0.5)", textAlign: "center", marginTop: "60px" }}>
            Aucune église trouvée.
          </p>
        ) : (
          <>
            {/* ── Desktop table ── */}
            <div style={{ overflowX: "auto" }} className="desk-only">
              <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 8px" }}>
                <thead>
                  <tr>
                    {["Dénomination", "Nom de l'église", "Branche", "Ville", "Pays", "Plan", "Membres"].map(h => (
                      <th key={h} style={{
                        color: "rgba(255,255,255,0.45)", fontSize: "11px", fontWeight: 700,
                        textTransform: "uppercase", letterSpacing: "0.08em",
                        padding: "0 14px 10px", textAlign: "left",
                      }}>
                        {h}
                      </th>
                    ))}
                    <th style={{ width: "80px" }} />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(({ eglise, subscription, membres }) => {
                    const planId = subscription?.plan_id ?? "free";
                    const plan = PLANS.find(p => p.id === planId) || PLANS[0];
                    const pct = plan.limite ? Math.min(100, (membres / plan.limite) * 100) : 0;
                    const overload = plan.limite && membres > plan.limite;

                    return (
                      <tr
                        key={eglise.id}
                        style={{ background: "rgba(255,255,255,0.07)", borderRadius: "12px" }}
                      >
                        <Cell>{eglise.denomination || "—"}</Cell>
                        <Cell bold>{eglise.nom}</Cell>
                        <Cell>{eglise.branche || "—"}</Cell>
                        <Cell>{eglise.ville || "—"}</Cell>
                        <Cell>{eglise.pays || "—"}</Cell>

                        {/* Plan badge */}
                        <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                          <span style={{
                            background: plan.color,
                            color: "#fff", fontSize: "12px", fontWeight: 700,
                            padding: "3px 10px", borderRadius: "20px",
                          }}>
                            {plan.emoji} {plan.nom}
                          </span>
                        </td>

                        {/* Membres + barre */}
                        <td style={{ padding: "12px 14px", minWidth: "130px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <span style={{
                              color: overload ? "#f87171" : "#fff",
                              fontWeight: 600, fontSize: "14px",
                            }}>
                              {membres}
                              <span style={{ color: "rgba(255,255,255,0.35)", fontWeight: 400, fontSize: "12px" }}>
                                {" "}/ {plan.limite ?? "∞"}
                              </span>
                            </span>
                          </div>
                          {plan.limite && (
                            <div style={{ marginTop: "5px", width: "100px", height: "4px", background: "rgba(255,255,255,0.12)", borderRadius: "4px" }}>
                              <div style={{
                                width: `${pct}%`, height: "100%", borderRadius: "4px",
                                background: pct > 90 ? "#ef4444" : "#fbbf24",
                                transition: "width 0.4s",
                              }} />
                            </div>
                          )}
                        </td>

                        {/* Bouton changer plan */}
                        <td style={{ padding: "12px 14px" }}>
                          <button
                            onClick={() => { setMessage(null); setModal({ egliseId: eglise.id, planActuelId: planId, nomEglise: eglise.nom }); }}
                            style={{
                              background: "rgba(255,255,255,0.12)", color: "#fff",
                              border: "0.5px solid rgba(255,255,255,0.25)",
                              padding: "6px 14px", borderRadius: "8px",
                              fontSize: "12px", fontWeight: 600, cursor: "pointer",
                              whiteSpace: "nowrap",
                            }}
                          >
                            Changer
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* ── Mobile cards ── */}
            <div className="mob-only" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {filtered.map(({ eglise, subscription, membres }) => {
                const planId = subscription?.plan_id ?? "free";
                const plan = PLANS.find(p => p.id === planId) || PLANS[0];
                const pct = plan.limite ? Math.min(100, (membres / plan.limite) * 100) : 0;
                const label = [eglise.denomination, eglise.branche, eglise.ville, eglise.pays]
                  .filter(Boolean).join(" · ");

                return (
                  <div key={eglise.id} style={{
                    background: "rgba(255,255,255,0.08)", borderRadius: "16px",
                    padding: "16px", borderLeft: `4px solid ${plan.color}`,
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px", flexWrap: "wrap" }}>
                      <div>
                        <p style={{ color: "#fff", fontWeight: 700, fontSize: "15px", margin: 0 }}>{eglise.nom}</p>
                        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "12px", margin: "4px 0 0" }}>{label || "—"}</p>
                      </div>
                      <span style={{
                        background: plan.color, color: "#fff",
                        fontSize: "11px", fontWeight: 700,
                        padding: "3px 10px", borderRadius: "20px", whiteSpace: "nowrap",
                      }}>
                        {plan.emoji} {plan.nom}
                      </span>
                    </div>

                    <div style={{ marginTop: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <span style={{ color: "#fff", fontWeight: 600, fontSize: "14px" }}>
                          {membres}
                          <span style={{ color: "rgba(255,255,255,0.4)", fontWeight: 400, fontSize: "12px" }}> / {plan.limite ?? "∞"}</span>
                        </span>
                        {plan.limite && (
                          <div style={{ marginTop: "5px", width: "100px", height: "4px", background: "rgba(255,255,255,0.12)", borderRadius: "4px" }}>
                            <div style={{ width: `${pct}%`, height: "100%", borderRadius: "4px", background: pct > 90 ? "#ef4444" : "#fbbf24" }} />
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => { setMessage(null); setModal({ egliseId: eglise.id, planActuelId: planId, nomEglise: eglise.nom }); }}
                        style={{
                          background: "rgba(255,255,255,0.12)", color: "#fff",
                          border: "0.5px solid rgba(255,255,255,0.25)",
                          padding: "7px 16px", borderRadius: "8px",
                          fontSize: "13px", fontWeight: 600, cursor: "pointer",
                        }}
                      >
                        Changer
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* ── MODAL changement de plan ── */}
      {modal && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setModal(null); }}
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 200, padding: "20px",
          }}
        >
          <div style={{
            background: "#1e2070", borderRadius: "20px",
            padding: "28px 24px", width: "100%", maxWidth: "460px",
            border: "0.5px solid rgba(255,255,255,0.15)",
          }}>
            <h2 style={{ color: "#fff", fontSize: "17px", fontWeight: 700, margin: "0 0 4px" }}>
              Changer le plan
            </h2>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px", margin: "0 0 20px" }}>
              {modal.nomEglise}
            </p>

            {message && (
              <div style={{
                marginBottom: "16px", padding: "10px 14px", borderRadius: "10px",
                background: message.type === "error" ? "rgba(239,68,68,0.15)" : "rgba(110,231,183,0.15)",
                color: message.type === "error" ? "#f87171" : "#6ee7b7",
                fontSize: "13px", fontWeight: 600,
                border: `0.5px solid ${message.type === "error" ? "rgba(239,68,68,0.3)" : "rgba(110,231,183,0.3)"}`,
              }}>
                {message.text}
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {PLANS.map(plan => {
                const estActuel = plan.id === modal.planActuelId;
                return (
                  <button
                    key={plan.id}
                    onClick={() => changerPlan(plan.id)}
                    disabled={upgrading || estActuel}
                    style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      padding: "12px 16px", borderRadius: "12px", cursor: estActuel ? "default" : "pointer",
                      border: estActuel ? "1.5px solid #fbbf24" : "0.5px solid rgba(255,255,255,0.15)",
                      background: estActuel ? "rgba(251,191,36,0.1)" : "rgba(255,255,255,0.07)",
                      transition: "background 0.2s",
                      opacity: upgrading && !estActuel ? 0.5 : 1,
                    }}
                    onMouseEnter={e => { if (!estActuel) e.currentTarget.style.background = "rgba(255,255,255,0.13)"; }}
                    onMouseLeave={e => { if (!estActuel) e.currentTarget.style.background = "rgba(255,255,255,0.07)"; }}
                  >
                    <span style={{ color: "#fff", fontWeight: 600, fontSize: "14px" }}>
                      {plan.emoji} {plan.nom}
                      {estActuel && <span style={{ color: "#fbbf24", fontSize: "11px", marginLeft: "8px" }}>• Actuel</span>}
                    </span>
                    <span style={{ color: "#fbbf24", fontWeight: 700, fontSize: "14px" }}>{plan.prix}</span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setModal(null)}
              style={{
                marginTop: "20px", width: "100%", padding: "10px",
                borderRadius: "10px", border: "0.5px solid rgba(255,255,255,0.15)",
                background: "transparent", color: "rgba(255,255,255,0.5)",
                fontSize: "14px", cursor: "pointer",
              }}
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      <Footer />

      <style>{`
        * { box-sizing: border-box; }
        .desk-only { display: block; }
        .mob-only  { display: none;  }
        @media (max-width: 768px) {
          .desk-only { display: none !important; }
          .mob-only  { display: flex !important;  }
        }
        input::placeholder { color: rgba(255,255,255,0.35); }
        select option { background: #1e2070; }
        tbody tr td:first-child { border-radius: 12px 0 0 12px; }
        tbody tr td:last-child  { border-radius: 0 12px 12px 0; }
      `}</style>
    </div>
  );
}

// Cellule de tableau réutilisable
function Cell({ children, bold }) {
  return (
    <td style={{
      padding: "13px 14px",
      color: bold ? "#fff" : "rgba(255,255,255,0.75)",
      fontWeight: bold ? 600 : 400,
      fontSize: "13px",
      whiteSpace: "nowrap",
      maxWidth: "180px",
      overflow: "hidden",
      textOverflow: "ellipsis",
    }}>
      {children}
    </td>
  );
}

export default function BillingPage() {
  return (
    <ProtectedRoute allowedRoles={["Superadmin"]}>
      <BillingContent />
    </ProtectedRoute>
  );
}
