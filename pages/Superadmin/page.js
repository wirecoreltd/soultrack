"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import supabase from "../../lib/supabaseClient";
import HeaderPages from "../../components/HeaderPages";
import ProtectedRoute from "../../components/ProtectedRoute";
import Footer from "../../components/Footer";

const PLANS = [
  { id: "free",       nom: "Départ",     prix: "Gratuit",    limite: 50,   emoji: "🌱", color: "rgba(29,158,117,0.8)"  },
  { id: "starter",    nom: "Croissance", prix: "$19/mois",   limite: 200,  emoji: "📈", color: "rgba(55,138,221,0.8)"  },
  { id: "vision",     nom: "Vision",     prix: "$39/mois",   limite: 500,  emoji: "🔥", color: "rgba(251,191,36,0.9)"  },
  { id: "expansion",  nom: "Expansion",  prix: "$79/mois",   limite: 1500, emoji: "🌍", color: "rgba(212,83,126,0.9)"  },
  { id: "enterprise", nom: "Réseaux",    prix: "Sur mesure", limite: null, emoji: "🔗", color: "rgba(139,92,246,0.9)"  },
];

function BillingContent() {
  const router = useRouter();

  const [rows, setRows]             = useState([]);
  const [loading, setLoading]       = useState(true);
  const [filterText, setFilterText] = useState("");
  const [filterPlan, setFilterPlan] = useState("all");
  const [modal, setModal]           = useState(null);
  const [upgrading, setUpgrading]   = useState(false);
  const [message, setMessage]       = useState(null);

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return router.push("/login");

    const { data: eglises, error } = await supabase
      .from("eglises")
      .select("id, nom, denomination, branche, ville, pays")
      .order("nom");

    if (error || !eglises?.length) { setLoading(false); return; }

    const { data: subs } = await supabase
      .from("subscriptions")
      .select("eglise_id, plan_id, current_period_end");

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

    setRows(eglises.map(e => ({
      eglise: e,
      subscription: subMap[e.id] || null,
      membres: membresCount[e.id] || 0,
    })));
    setLoading(false);
  }

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

  function openModal(egliseId, planActuelId, nomEglise) {
    setMessage(null);
    setModal({ egliseId, planActuelId, nomEglise });
  }

  return (
    <div style={{ background: "#333699", minHeight: "100vh" }}>
      <HeaderPages />

      {/* TITRE */}
      <div style={{ textAlign: "center", padding: "28px 24px 0" }}>
        <h1 style={{ color: "#fff", fontSize: "clamp(1.4rem,3vw,2rem)", fontWeight: 700, margin: 0 }}>
          Abonnements <span style={{ color: "#6ee7b7" }}>SoulTrack</span>
        </h1>
        <p style={{ color: "rgba(255,255,255,0.5)", marginTop: "8px", fontSize: "14px" }}>
          Gérez les plans de toutes les églises enregistrées sur la plateforme.
        </p>
      </div>

      {/* FILTRES */}
      <div style={{
        maxWidth: "1200px", margin: "24px auto 0", padding: "0 20px",
        display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center",
      }}>
        <div style={{ flex: "1 1 300px", position: "relative" }}>
          <span style={{
            position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)",
            fontSize: "15px", pointerEvents: "none",
          }}>🔍</span>
          <input
            type="text"
            placeholder="Dénomination · Nom · Branche · Ville · Pays…"
            value={filterText}
            onChange={e => setFilterText(e.target.value)}
            style={{
              width: "100%", padding: "10px 14px 10px 36px",
              borderRadius: "10px", border: "0.5px solid rgba(255,255,255,0.2)",
              background: "rgba(255,255,255,0.1)", color: "#fff",
              fontSize: "14px", outline: "none", boxSizing: "border-box",
            }}
          />
        </div>
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
        <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px" }}>
          {filtered.length} église{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* TABLEAU */}
      <div style={{ maxWidth: "1200px", margin: "20px auto 60px", padding: "0 20px" }}>
        {loading ? (
          <p style={{ color: "#fff", textAlign: "center", marginTop: "60px" }}>Chargement…</p>
        ) : filtered.length === 0 ? (
          <p style={{ color: "rgba(255,255,255,0.4)", textAlign: "center", marginTop: "60px" }}>
            Aucune église trouvée.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>

            {/* En-tête desktop — 8 colonnes fixes */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "1.2fr 1.5fr 1.1fr 0.9fr 0.9fr 130px 150px 90px",
              padding: "0 16px 10px",
              borderBottom: "0.5px solid rgba(255,255,255,0.1)",
              gap: "8px",
            }} className="desk-only">
              {["Dénomination","Nom de l'église","Branche","Ville","Pays","Plan","Membres",""].map((h, i) => (
                <span key={i} style={{
                  color: "rgba(255,255,255,0.3)", fontSize: "10px",
                  fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.09em",
                }}>{h}</span>
              ))}
            </div>

            {filtered.map(({ eglise, subscription, membres }) => {
              const planId     = subscription?.plan_id ?? "free";
              const plan       = PLANS.find(p => p.id === planId) || PLANS[0];
              const pct        = plan.limite ? Math.min(100, (membres / plan.limite) * 100) : 0;
              // ligne "complète" si au moins denomination OU branche est renseigné
              const hasDetails = !!(eglise.denomination || eglise.branche);

              return (
                <div
                  key={eglise.id}
                  style={{
                    background: "rgba(255,255,255,0.07)",
                    borderRadius: "12px",
                    border: "0.5px solid rgba(255,255,255,0.07)",
                    overflow: "hidden",
                  }}
                >
                  {/* ── DESKTOP ── */}
                  <div className="desk-only" style={{
                    display: "grid",
                    gridTemplateColumns: hasDetails
                      ? "1.2fr 1.5fr 1.1fr 0.9fr 0.9fr 130px 150px 90px"   // complète
                      : "1fr 130px 150px 90px",                              // incomplète
                    alignItems: "center",
                    padding: "13px 16px",
                    gap: "8px",
                  }}>
                    {hasDetails ? (
                      <>
                        {/* 8 colonnes */}
                        <DimText>{eglise.denomination || "—"}</DimText>
                        <WhiteText bold>{eglise.nom}</WhiteText>
                        <DimText>{eglise.branche || "—"}</DimText>
                        <DimText>{eglise.ville || "—"}</DimText>
                        <DimText>{eglise.pays || "—"}</DimText>
                        <PlanBadge plan={plan} />
                        <MembresCell membres={membres} plan={plan} pct={pct} />
                        <ChangerBtn onClick={() => openModal(eglise.id, planId, eglise.nom)} />
                      </>
                    ) : (
                      <>
                        {/* 4 colonnes — nom à gauche, tout le reste à droite */}
                        <span style={{ color: "#fff", fontWeight: 700, fontSize: "14px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {eglise.nom}
                          {(eglise.ville || eglise.pays) && (
                            <span style={{ color: "rgba(255,255,255,0.38)", fontWeight: 400, fontSize: "12px", marginLeft: "10px" }}>
                              {[eglise.ville, eglise.pays].filter(Boolean).join(", ")}
                            </span>
                          )}
                        </span>
                        <PlanBadge plan={plan} />
                        <MembresCell membres={membres} plan={plan} pct={pct} />
                        <ChangerBtn onClick={() => openModal(eglise.id, planId, eglise.nom)} />
                      </>
                    )}
                  </div>

                  {/* ── MOBILE ── */}
                  <div className="mob-only" style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
                      <div style={{ flex: 1 }}>
                        <p style={{ color: "#fff", fontWeight: 700, fontSize: "15px", margin: 0 }}>{eglise.nom}</p>
                        <p style={{ color: "rgba(255,255,255,0.42)", fontSize: "12px", margin: "3px 0 0" }}>
                          {hasDetails
                            ? [eglise.denomination, eglise.branche, eglise.ville, eglise.pays].filter(Boolean).join(" · ")
                            : [eglise.ville, eglise.pays].filter(Boolean).join(", ") || "—"}
                        </p>
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
                        <span style={{ color: "#fff", fontWeight: 700, fontSize: "14px" }}>
                          {membres}
                          <span style={{ color: "rgba(255,255,255,0.35)", fontWeight: 400, fontSize: "12px" }}> / {plan.limite ?? "∞"}</span>
                        </span>
                        {plan.limite && (
                          <div style={{ marginTop: "5px", width: "90px", height: "4px", background: "rgba(255,255,255,0.12)", borderRadius: "4px" }}>
                            <div style={{ width: `${pct}%`, height: "100%", borderRadius: "4px", background: barColor(pct), transition: "width 0.4s" }} />
                          </div>
                        )}
                      </div>
                      <ChangerBtn onClick={() => openModal(eglise.id, planId, eglise.nom)} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL */}
      {modal && (
        <div
          onClick={e => { if (e.target === e.currentTarget) setModal(null); }}
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)",
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
            <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "13px", margin: "0 0 20px" }}>
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
                      padding: "12px 16px", borderRadius: "12px",
                      cursor: estActuel ? "default" : "pointer",
                      border: estActuel ? "1.5px solid #fbbf24" : "0.5px solid rgba(255,255,255,0.15)",
                      background: estActuel ? "rgba(251,191,36,0.1)" : "rgba(255,255,255,0.07)",
                      opacity: upgrading && !estActuel ? 0.5 : 1,
                      transition: "background 0.2s",
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
                background: "transparent", color: "rgba(255,255,255,0.4)",
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

// ── Micro-composants ──────────────────────────────────────────────────────────

function WhiteText({ children, bold }) {
  return (
    <span style={{
      color: "#ffffff",
      fontWeight: bold ? 700 : 400,
      fontSize: "13px",
      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
    }}>
      {children}
    </span>
  );
}

function DimText({ children }) {
  return (
    <span style={{
      color: "rgba(255,255,255,0.52)",
      fontWeight: 400, fontSize: "13px",
      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
    }}>
      {children}
    </span>
  );
}

function PlanBadge({ plan }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      background: plan.color, color: "#fff",
      fontSize: "12px", fontWeight: 700,
      padding: "3px 10px", borderRadius: "20px", whiteSpace: "nowrap",
    }}>
      {plan.emoji} {plan.nom}
    </span>
  );
}

function MembresCell({ membres, plan, pct }) {
  return (
    <div>
      <span style={{ color: "#ffffff", fontWeight: 700, fontSize: "14px" }}>
        {membres}
        <span style={{ color: "rgba(255,255,255,0.35)", fontWeight: 400, fontSize: "12px" }}>
          {" "}/ {plan.limite ?? "∞"}
        </span>
      </span>
      {plan.limite && (
        <div style={{ marginTop: "5px", width: "100px", height: "4px", background: "rgba(255,255,255,0.12)", borderRadius: "4px" }}>
          <div style={{
            width: `${pct}%`, height: "100%", borderRadius: "4px",
            background: barColor(pct), transition: "width 0.4s",
          }} />
        </div>
      )}
    </div>
  );
}

function ChangerBtn({ onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: "rgba(255,255,255,0.1)", color: "#fff",
        border: "0.5px solid rgba(255,255,255,0.22)",
        padding: "6px 14px", borderRadius: "8px",
        fontSize: "12px", fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap",
      }}
      onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.18)"}
      onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
    >
      Changer
    </button>
  );
}

function barColor(pct) {
  if (pct >= 90) return "#ef4444";
  if (pct >= 60) return "#f97316";
  return "#fbbf24";
}

// ── Export ────────────────────────────────────────────────────────────────────

export default function BillingPage() {
  return (
    <ProtectedRoute allowedRoles={["Superadmin"]}>
      <BillingContent />
    </ProtectedRoute>
  );
}
