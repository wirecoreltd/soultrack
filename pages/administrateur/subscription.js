"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import supabase from "../../lib/supabaseClient";
import HeaderPages from "../../components/HeaderPages";
import ProtectedRoute from "../../components/ProtectedRoute";
import Footer from "../../components/Footer";

const PLANS = [
  { id: "free",       nom: "Départ",     prix: "Gratuit",    prixNum: 0,  limite: 50,   emoji: "🌱", color: "#10b981" },
  { id: "starter",    nom: "Croissance", prix: "$19/mois",   prixNum: 19, limite: 200,  emoji: "📈", color: "#3b82f6" },
  { id: "vision",     nom: "Vision",     prix: "$39/mois",   prixNum: 39, limite: 500,  emoji: "🔥", color: "#f59e0b" },
  { id: "expansion",  nom: "Expansion",  prix: "$79/mois",   prixNum: 79, limite: 1500, emoji: "🌍", color: "#8b5cf6" },
  { id: "enterprise", nom: "Réseaux",    prix: "Sur mesure", prixNum: 99, limite: null, emoji: "🔗", color: "#ec4899" },
];

function barColor(pct) {
  if (pct < 50) return "#10b981";
  if (pct < 80) return "#f59e0b";
  return "#ef4444";
}

function ProgressBar({ value, max, height = 8 }) {
  const pct = max ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div
      style={{
        width: "100%",
        height,
        background: "rgba(255,255,255,0.1)",
        borderRadius: 99,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${pct}%`,
          background: barColor(pct),
          borderRadius: 99,
          transition: "width 0.5s ease",
        }}
      />
    </div>
  );
}

function SubscriptionContent() {
  const router = useRouter();

  const [subscription, setSubscription]   = useState(null);
  const [nombreMembres, setNombreMembres] = useState(0);
  const [egliseId, setEgliseId]           = useState(null);
  const [loading, setLoading]             = useState(true);
  const [message, setMessage]             = useState(null);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [confirming, setConfirming]       = useState(false);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return router.push("/login");

    const { data: profile } = await supabase
      .from("profiles")
      .select("eglise_id")
      .eq("id", user.id)
      .single();

    if (!profile?.eglise_id) { setLoading(false); return; }
    setEgliseId(profile.eglise_id);

    const { data: sub } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("eglise_id", profile.eglise_id)
      .maybeSingle();

    setSubscription(sub);

    const { count } = await supabase
      .from("membres_complets")
      .select("*", { count: "exact", head: true })
      .eq("eglise_id", profile.eglise_id)
      .neq("etat_contact", "supprime");

    setNombreMembres(count || 0);
    setLoading(false);
  }

  const planActuelIndex = PLANS.findIndex(p => p.id === subscription?.plan_id);
  const planActuel      = PLANS[planActuelIndex] ?? null;

  const pctActuel = planActuel?.limite
    ? Math.min(100, (nombreMembres / planActuel.limite) * 100)
    : 0;

  // Plans disponibles = tous sauf le plan actuel
  const autresPlans = PLANS.filter(p => p.id !== subscription?.plan_id);

  const confirmTarget = PLANS.find(p => p.id === selectedPlanId) ?? null;

  const isDowngrade = confirmTarget && planActuel
    ? confirmTarget.prixNum < planActuel.prixNum
    : false;

  const downgradeWarning =
    isDowngrade &&
    confirmTarget?.limite &&
    nombreMembres > confirmTarget.limite;

  async function handleConfirm() {
    if (!confirmTarget) return;
    setConfirming(true);
    setMessage(null);

    try {
      const { error } = await supabase
        .from("subscriptions")
        .update({ plan_id: confirmTarget.id })
        .eq("eglise_id", egliseId);

      if (error) throw error;

      setMessage({ type: "success", text: `Plan mis à jour vers ${confirmTarget.nom} avec succès.` });
      setSelectedPlanId(null);
      await loadData();
    } catch (err) {
      setMessage({ type: "error", text: "Une erreur est survenue. Veuillez réessayer." });
    } finally {
      setConfirming(false);
    }
  }

  // ---- Render ----
  return (
    <div className="min-h-screen p-6 bg-[#333699]">
    <HeaderPages />

    <h1 className="text-2xl font-bold mt-4 mb-6 text-center text-white">
      Mon <span className="text-emerald-300">Abonnement</span>
    </h1>

    <div className="max-w-3xl w-full mb-6 text-center mx-auto">
      <p className="italic text-base text-white/90">
        <span className="text-blue-300 font-semibold">
          Gérez votre plan et suivez votre utilisation
        </span>.
      </p>
    </div>

    {loading ? (
      <p className="text-center text-white/60 py-20">
        Chargement...
      </p>
    ) : (
      <>
        {/* Message de retour */}
        {message && (
          <div
            className={`rounded-xl px-4 py-3 text-sm font-medium border ${
              message.type === "error"
                ? "bg-red-500/15 border-red-500/40 text-red-300"
                : "bg-emerald-500/15 border-emerald-500/40 text-emerald-300"
            }`}
          >
            {message.text}
          </div>
        )}

            {/* ── 1. PLAN ACTUEL ── */}
            {planActuel ? (
              <div
                className="rounded-2xl p-5"
                style={{
                  background: "rgba(255,255,255,0.07)",
                  border: "1.5px solid rgba(255,255,255,0.18)",
                  borderLeft: `4px solid ${planActuel.color}`,
                }}
              >
                <span
                  className="inline-block text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full mb-3"
                  style={{ background: `${planActuel.color}22`, color: planActuel.color }}
                >
                  Plan actuel
                </span>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{planActuel.emoji}</span>
                    <div>
                      <p className="text-white font-semibold text-lg leading-tight">{planActuel.nom}</p>
                      {subscription?.current_period_end && (
                        <p className="text-white/40 text-xs mt-0.5">
                          Renouvellement le{" "}
                          {new Date(subscription.current_period_end).toLocaleDateString("fr-FR", {
                            day: "numeric", month: "long", year: "numeric",
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-xl" style={{ color: planActuel.color }}>
                      {planActuel.prix}
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-white/50">
                    <span>{nombreMembres} membres utilisés</span>
                    <span>{planActuel.limite ? `${planActuel.limite} max` : "Illimité"}</span>
                  </div>
                  <ProgressBar value={nombreMembres} max={planActuel.limite ?? nombreMembres} height={8} />
                  {pctActuel >= 80 && (
                    <p className="text-xs text-amber-400 mt-1">
                      ⚠️ Vous approchez de la limite — pensez à upgrader.
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-white/50 text-center text-sm">Aucun plan actif trouvé.</p>
            )}

            {/* ── 2. CHANGER DE PLAN ── */}
            {autresPlans.length > 0 && (
              <div>
                <p className="text-white/40 text-xs uppercase font-semibold tracking-widest mb-3">
                  Changer de plan
                </p>

                <div className="space-y-2">
                  {autresPlans.map((plan) => {
                    const isUpgrade   = planActuel ? plan.prixNum > planActuel.prixNum : false;
                    const isSelected  = selectedPlanId === plan.id;
                    const pctSurCePlan = plan.limite
                      ? Math.min(100, (nombreMembres / plan.limite) * 100)
                      : 0;
                    const depasseLimit = plan.limite && nombreMembres > plan.limite;

                    return (
                      <button
                        key={plan.id}
                        onClick={() => setSelectedPlanId(isSelected ? null : plan.id)}
                        className="w-full rounded-2xl p-4 flex items-center gap-4 text-left transition-all duration-200"
                        style={{
                          background: isSelected
                            ? isUpgrade ? `${plan.color}22` : "rgba(255,255,255,0.12)"
                            : isUpgrade ? `${plan.color}11` : "rgba(255,255,255,0.05)",
                          border: isSelected
                            ? isUpgrade
                              ? `1.5px solid ${plan.color}99`
                              : "1.5px solid rgba(255,255,255,0.35)"
                            : isUpgrade
                              ? `1px solid ${plan.color}33`
                              : "1px solid rgba(255,255,255,0.10)",
                        }}
                      >
                        {/* Emoji */}
                        <span className="text-2xl shrink-0">{plan.emoji}</span>

                        {/* Infos */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className="text-white font-semibold text-sm">{plan.nom}</p>
                            <span
                              className="text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full"
                              style={
                                isUpgrade
                                  ? { background: `${plan.color}22`, color: plan.color }
                                  : { background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.4)" }
                              }
                            >
                              {isUpgrade ? "↑ Upgrade" : "↓ Downgrade"}
                            </span>
                            {pctActuel >= 70 && isUpgrade && (
                              <span className="text-[10px] font-bold bg-amber-400 text-black px-1.5 py-0.5 rounded-full">
                                Recommandé
                              </span>
                            )}
                            {depasseLimit && (
                              <span className="text-[10px] font-bold bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded-full">
                                ⚠️ Limite dépassée
                              </span>
                            )}
                          </div>

                          {/* Mini progress bar */}
                          <div className="flex items-center gap-2 mt-1.5">
                            <div className="flex-1">
                              <ProgressBar
                                value={nombreMembres}
                                max={plan.limite ?? nombreMembres}
                                height={4}
                              />
                            </div>
                            <span className="text-white/30 text-[11px] shrink-0">
                              {plan.limite ? `${nombreMembres}/${plan.limite}` : "Illimité"}
                            </span>
                          </div>
                        </div>

                        {/* Prix */}
                        <p
                          className="text-sm font-semibold shrink-0"
                          style={{ color: isUpgrade ? plan.color : "rgba(255,255,255,0.5)" }}
                        >
                          {plan.prix}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── 3. CONFIRMATION INLINE ── */}
            {selectedPlanId && confirmTarget && (
              <div
                className="rounded-2xl p-5 space-y-3"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.15)",
                }}
              >
                <p className="text-white font-semibold">
                  Passer au plan{" "}
                  <span style={{ color: confirmTarget.color }}>{confirmTarget.nom}</span>
                  {" "}— {confirmTarget.prix}
                </p>

                {downgradeWarning && (
                  <div className="bg-red-500/15 border border-red-500/30 rounded-xl px-3 py-2.5 text-red-300 text-sm">
                    ⚠️ Vos {nombreMembres} membres dépassent la limite de {confirmTarget.limite} du plan{" "}
                    {confirmTarget.nom}. Certains membres pourraient devenir inaccessibles.
                  </div>
                )}

                {!downgradeWarning && isDowngrade && (
                  <p className="text-white/50 text-sm">
                    Votre plan sera réduit à la fin du cycle actuel.
                  </p>
                )}

                {!isDowngrade && (
                  <p className="text-white/50 text-sm">
                    Le nouveau tarif sera appliqué dès le prochain cycle de facturation.
                  </p>
                )}

                <div className="flex gap-3 pt-1">
                  <button
                    onClick={handleConfirm}
                    disabled={confirming}
                    className="flex-1 py-2.5 rounded-xl font-semibold text-sm transition-opacity"
                    style={{
                      background: confirmTarget.color,
                      color: "#fff",
                      opacity: confirming ? 0.6 : 1,
                    }}
                  >
                    {confirming ? "En cours…" : `Confirmer — ${confirmTarget.prix}`}
                  </button>
                  <button
                    onClick={() => setSelectedPlanId(null)}
                    className="px-4 py-2.5 rounded-xl text-sm text-white/50 hover:text-white/80 transition"
                    style={{ border: "1px solid rgba(255,255,255,0.15)" }}
                  >
                    Annuler
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}

export default function SubscriptionPage() {
  return (
    <ProtectedRoute allowedRoles={["Administrateur"]}>
      <SubscriptionContent />
    </ProtectedRoute>
  );
}
