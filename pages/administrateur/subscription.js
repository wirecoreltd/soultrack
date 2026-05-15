"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
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

// Plans gratuits ou sur mesure → pas de paiement en ligne
const FREE_PLANS       = ["free", "enterprise"];
// Plans en mode paiement unique (sinon récurrent)
const ONE_TIME_PLANS   = [];

function barColor(pct) {
  if (pct < 50) return "#10b981";
  if (pct < 80) return "#f59e0b";
  return "#ef4444";
}

function ProgressBar({ value, max, height = 8 }) {
  const pct = max ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div style={{ width: "100%", height, background: "rgba(255,255,255,0.1)", borderRadius: 99, overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${pct}%`, background: barColor(pct), borderRadius: 99, transition: "width 0.5s ease" }} />
    </div>
  );
}

// ── Spinner ──
function Spinner() {
  return (
    <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

// ── Modal de choix du moyen de paiement ──
function PaymentModal({ plan, egliseId, onClose, onSuccess }) {
  const [loading, setLoading] = useState(null); // "paddle" | "paypal" | null
  const [error, setError]     = useState(null);

  const isFree       = FREE_PLANS.includes(plan.id);
  const needsPayment = !isFree;

  // Downgrade vers free → pas de paiement, simple update
  async function handleFreeDowngrade() {
    setLoading("free");
    try {
      const now      = new Date();
      const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
      const { error: err } = await supabase
        .from("subscriptions")
        .update({
          plan_id:              "free",
          statut:               "active",
          current_period_start: now.toISOString(),
          current_period_end:   nextMonth.toISOString(),
          updated_at:           now.toISOString(),
          started_at:           now.toISOString(),
        })
        .eq("eglise_id", egliseId);

      if (err) throw err;
      onSuccess("Retour au plan Départ effectué.");
    } catch (e) {
      setError("Erreur : " + e.message);
    } finally {
      setLoading(null);
    }
  }

  // Checkout Paddle
  async function handlePaddle() {
  setLoading("paddle");
  setError(null);
  try {
    const res  = await fetch("/api/paddle/create-checkout", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ egliseId, planId: plan.id }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);

    // Ouvre le checkout Paddle en overlay (pas de redirect)
    if (!window.Paddle) throw new Error("Paddle.js non chargé");

    window.Paddle.Checkout.open({
      items: [{ priceId: data.priceId, quantity: 1 }],
      customer: {
        email: data.email,
        ...(data.customerId ? { id: data.customerId } : {}),
      },
      customData: { egliseId, planId: plan.id },
      settings: {
        successUrl: `${window.location.origin}/subscription?success=true`,
        displayMode: "overlay",
        theme: "dark",
      },
    });

    onClose(); // Ferme ton modal SoulTrack
  } catch (e) {
    setError("Erreur Paddle : " + e.message);
  } finally {
    setLoading(null);
  }
}

  // Checkout PayPal
  async function handlePayPal() {
    setLoading("paypal");
    setError(null);
    try {
      const res  = await fetch("/api/paypal/create-order", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ egliseId, planId: plan.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      if (data.type === "subscription") {
        // Abonnement récurrent → redirect vers PayPal pour approbation
        window.location.href = data.approvalUrl;
      } else {
        // Paiement unique → on capture directement
        const captureRes  = await fetch("/api/paypal/capture-order", {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ orderId: data.orderId }),
        });
        const captureData = await captureRes.json();
        if (!captureRes.ok) throw new Error(captureData.error);
        onSuccess(`Plan ${plan.nom} activé via PayPal !`);
      }
    } catch (e) {
      setError("Erreur PayPal : " + e.message);
      setLoading(null);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)" }}
    >
      <div
        className="w-full max-w-sm rounded-2xl p-6 space-y-5"
        style={{ background: "#1a1a3e", border: "1.5px solid rgba(255,255,255,0.15)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white font-bold text-lg">
              {plan.emoji} {plan.nom}
            </p>
            <p className="text-white/40 text-sm">{plan.prix}</p>
          </div>
          <button
            onClick={onClose}
            className="text-white/30 hover:text-white/70 transition text-xl font-bold"
          >
            ×
          </button>
        </div>

        {error && (
          <div className="bg-red-500/15 border border-red-500/30 rounded-xl px-3 py-2 text-red-300 text-sm">
            {error}
          </div>
        )}

        {isFree ? (
          // Downgrade vers free
          <div className="space-y-3">
            <p className="text-white/60 text-sm">
              Vous allez revenir au plan gratuit (50 membres max).
            </p>
            <button
              onClick={handleFreeDowngrade}
              disabled={loading === "free"}
              className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-opacity"
              style={{ background: "#10b981", color: "#fff", opacity: loading ? 0.7 : 1 }}
            >
              {loading === "free" ? <><Spinner /> En cours…</> : "Confirmer le downgrade"}
            </button>
          </div>
        ) : (
          // Choix du moyen de paiement
          <div className="space-y-3">
            <p className="text-white/50 text-xs uppercase tracking-widest font-semibold">
              Choisissez votre moyen de paiement
            </p>

            {/* Paddle — Recommandé */}
            <button
              onClick={handlePaddle}
              disabled={!!loading}
              className="w-full rounded-xl p-4 flex items-center gap-4 text-left transition-all"
              style={{
                background: loading === "paddle" ? "rgba(99,102,241,0.25)" : "rgba(99,102,241,0.12)",
                border:     "1.5px solid rgba(99,102,241,0.5)",
                opacity:    loading && loading !== "paddle" ? 0.5 : 1,
              }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: "rgba(99,102,241,0.2)" }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <rect x="2" y="6" width="20" height="14" rx="3" stroke="#818cf8" strokeWidth="1.8"/>
                  <path d="M2 10h20" stroke="#818cf8" strokeWidth="1.8"/>
                  <rect x="5" y="14" width="4" height="2" rx="1" fill="#818cf8"/>
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-white font-semibold text-sm flex items-center gap-2">
                  Carte bancaire
                  <span className="text-[10px] bg-indigo-400/20 text-indigo-300 px-1.5 py-0.5 rounded-full font-bold">
                    Recommandé
                  </span>
                </p>
                <p className="text-white/40 text-xs mt-0.5">Via Paddle · Visa, Mastercard, Apple Pay</p>
              </div>
              {loading === "paddle"
                ? <Spinner />
                : <span className="text-white/30 text-lg">→</span>
              }
            </button>

            {/* PayPal */}
            <button
              onClick={handlePayPal}
              disabled={!!loading}
              className="w-full rounded-xl p-4 flex items-center gap-4 text-left transition-all"
              style={{
                background: loading === "paypal" ? "rgba(0,112,240,0.2)" : "rgba(0,112,240,0.08)",
                border:     "1.5px solid rgba(0,112,240,0.35)",
                opacity:    loading && loading !== "paypal" ? 0.5 : 1,
              }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: "rgba(0,112,240,0.15)" }}>
                {/* PayPal P logo */}
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M7 20V4h6a5 5 0 0 1 5 5v0a5 5 0 0 1-5 5H9" stroke="#60a5fa" strokeWidth="1.8" strokeLinecap="round"/>
                  <path d="M9 14l-2 6" stroke="#60a5fa" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-white font-semibold text-sm">PayPal</p>
                <p className="text-white/40 text-xs mt-0.5">Compte PayPal ou carte via PayPal</p>
              </div>
              {loading === "paypal"
                ? <Spinner />
                : <span className="text-white/30 text-lg">→</span>
              }
            </button>
          </div>
        )}

        <p className="text-white/25 text-[11px] text-center">
          🔒 Paiement sécurisé · Annulable à tout moment
        </p>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════
function SubscriptionContent() {
  const router = useRouter();

  const [subscription, setSubscription]     = useState(null);
  const [nombreMembres, setNombreMembres]   = useState(0);
  const [egliseId, setEgliseId]             = useState(null);
  const [loading, setLoading]               = useState(true);
  const [message, setMessage]               = useState(null);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    loadData();

    // Détecte retour depuis Paddle/PayPal
    const params = new URLSearchParams(window.location.search);
    if (params.get("success") === "true") {
      setMessage({ type: "success", text: "Paiement confirmé ! Votre plan a été mis à jour." });
      // Nettoie l'URL
      window.history.replaceState({}, "", window.location.pathname);
    } else if (params.get("cancelled") === "true") {
      setMessage({ type: "error", text: "Paiement annulé. Aucun changement effectué." });
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

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
  const pctActuel       = planActuel?.limite
    ? Math.min(100, (nombreMembres / planActuel.limite) * 100)
    : 0;

  const autresPlans   = PLANS.filter(p => p.id !== subscription?.plan_id);
  const confirmTarget = PLANS.find(p => p.id === selectedPlanId) ?? null;
  const isDowngrade   = confirmTarget && planActuel
    ? confirmTarget.prixNum < planActuel.prixNum
    : false;

  function handleSelectPlan(planId) {
    setSelectedPlanId(planId === selectedPlanId ? null : planId);
    setShowPaymentModal(false);
  }

  function handlePaymentSuccess(msg) {
    setShowPaymentModal(false);
    setSelectedPlanId(null);
    setMessage({ type: "success", text: msg });
    loadData();
  }

  return (
    <>
      {/* Script Paddle.js (Paddle Billing) */}
      <Script
        src="https://cdn.paddle.com/paddle/v2/paddle.js"
        strategy="afterInteractive"
        onLoad={() => {
          if (window.Paddle) {
            window.Paddle.Initialize({ token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN });
          }
        }}
      />

      {/* Modal de paiement */}
      {showPaymentModal && confirmTarget && egliseId && (
        <PaymentModal
          plan={confirmTarget}
          egliseId={egliseId}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={handlePaymentSuccess}
        />
      )}

      <div className="min-h-screen p-6 bg-[#333699]">
        <HeaderPages />

        <h1 className="text-2xl font-bold mt-4 mb-6 text-center text-white">
          Mon <span className="text-emerald-300">Abonnement</span>
        </h1>

        <div className="max-w-3xl w-full mb-6 text-center mx-auto">
          <p className="italic text-base text-white/90">
            <span className="text-blue-300 font-semibold">Gérez votre plan et suivez votre utilisation</span>.
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-5">
          {loading ? (
            <p className="text-center text-white/60 py-20">Chargement...</p>
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
                      const isUpgrade    = planActuel ? plan.prixNum > planActuel.prixNum : false;
                      const isSelected   = selectedPlanId === plan.id;
                      const depasseLimit = plan.limite && nombreMembres > plan.limite;
                      const needsPay     = !FREE_PLANS.includes(plan.id);

                      return (
                        <button
                          key={plan.id}
                          onClick={() => handleSelectPlan(plan.id)}
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
                          <span className="text-2xl shrink-0">{plan.emoji}</span>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
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
                              {needsPay && (
                                <span className="text-[10px] font-bold bg-indigo-400/20 text-indigo-300 px-1.5 py-0.5 rounded-full">
                                  💳 Paiement requis
                                </span>
                              )}
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

              {/* ── 3. CONFIRMATION / PAIEMENT ── */}
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

                  {/* Avertissement downgrade avec dépassement */}
                  {isDowngrade && confirmTarget.limite && nombreMembres > confirmTarget.limite && (
                    <div className="bg-red-500/15 border border-red-500/30 rounded-xl px-3 py-2.5 text-red-300 text-sm">
                      ⚠️ Vos {nombreMembres} membres dépassent la limite de {confirmTarget.limite} du plan{" "}
                      {confirmTarget.nom}. Certains membres pourraient devenir inaccessibles.
                    </div>
                  )}

                  {FREE_PLANS.includes(confirmTarget.id) ? (
                    <p className="text-white/50 text-sm">
                      {confirmTarget.id === "enterprise"
                        ? "Notre équipe vous contactera pour configurer votre plan sur mesure."
                        : "Votre plan sera réduit à la fin du cycle actuel."
                      }
                    </p>
                  ) : (
                    <p className="text-white/50 text-sm">
                      Choisissez votre moyen de paiement pour activer ce plan.
                    </p>
                  )}

                  <div className="flex gap-3 pt-1">
                    <button
                      onClick={() => setShowPaymentModal(true)}
                      className="flex-1 py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-opacity"
                      style={{ background: confirmTarget.color, color: "#fff" }}
                    >
                      {FREE_PLANS.includes(confirmTarget.id)
                        ? confirmTarget.id === "enterprise"
                          ? "📧 Nous contacter"
                          : "Confirmer le downgrade"
                        : "💳 Procéder au paiement"
                      }
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
    </>
  );
}

export default function SubscriptionPage() {
  return (
    <ProtectedRoute allowedRoles={["Administrateur"]}>
      <SubscriptionContent />
    </ProtectedRoute>
  );
}
