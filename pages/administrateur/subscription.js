"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import supabase from "../../lib/supabaseClient";
import HeaderPages from "../../components/HeaderPages";
import ProtectedRoute from "../../components/ProtectedRoute";
import Footer from "../../components/Footer";
import { useLang } from "../../hooks/useLang";

const translations = {
  fr: {
    pageTitle: "Mon",
    pageTitleHighlight: "Abonnement",
    pageSubtitle: "Gérez votre plan et suivez votre utilisation",
    loading: "Chargement...",
    noActivePlan: "Aucun plan actif trouvé.",
    paymentConfirmed: "Paiement confirmé ! Votre plan a été mis à jour.",
    paymentCancelled: "Paiement annulé. Aucun changement effectué.",
    currentPlan: "Plan actuel",
    renewalDate: "Renouvellement le",
    membersUsed: "membres utilisés",
    unlimited: "Illimité",
    max: "max",
    approachingLimit: "⚠️ Vous approchez de la limite — pensez à upgrader.",
    changePlan: "Changer de plan",
    upgrade: "↑ Upgrade",
    downgrade: "↓ Downgrade",
    paymentRequired: "💳 Paiement requis",
    recommended: "Recommandé",
    limitExceeded: "⚠️ Limite dépassée",
    switchToPlan: "Passer au plan",
    downgradeWarning: "⚠️ Vos {count} membres dépassent la limite de {limit} du plan {name}. Certains membres pourraient devenir inaccessibles.",
    enterpriseNote: "Notre équipe vous contactera pour configurer votre plan sur mesure.",
    downgradeNote: "Votre plan sera réduit à la fin du cycle actuel.",
    choosePayment: "Choisissez votre moyen de paiement pour activer ce plan.",
    contactUs: "📧 Nous contacter",
    confirmDowngrade: "Confirmer le downgrade",
    proceedPayment: "💳 Procéder au paiement",
    cancel: "Annuler",
    paymentMethod: "Choisissez votre moyen de paiement",
    chooseDuration: "Choisissez la durée",
    creditCard: "Carte bancaire",
    creditCardSub: "Via Lemon Squeezy · Visa, Mastercard, Apple Pay",
    paypalSub: "Compte PayPal ou carte via PayPal",
    securePayment: "🔒 Paiement sécurisé · Annulable à tout moment",
    confirmingDowngrade: "Confirmer le downgrade",
    confirmingDowngradeInProgress: "En cours…",
    freeDowngradeNote: "Vous allez revenir au plan gratuit (50 membres max).",
    errorPrefix: "Erreur : ",
    errorLemonSqueezy: "Erreur paiement : ",
    errorPaypal: "Erreur PayPal : ",
    freeDowngradeSuccess: "Retour au plan Départ effectué.",
    freePlanActivated: "Plan {name} activé via PayPal !",
    save: "Économie",
    perMonth: "/mois",
  },
  en: {
    pageTitle: "My",
    pageTitleHighlight: "Subscription",
    pageSubtitle: "Manage your plan and track your usage",
    loading: "Loading...",
    noActivePlan: "No active plan found.",
    paymentConfirmed: "Payment confirmed! Your plan has been updated.",
    paymentCancelled: "Payment cancelled. No changes were made.",
    currentPlan: "Current plan",
    renewalDate: "Renews on",
    membersUsed: "members used",
    unlimited: "Unlimited",
    max: "max",
    approachingLimit: "⚠️ You are approaching the limit — consider upgrading.",
    changePlan: "Change plan",
    upgrade: "↑ Upgrade",
    downgrade: "↓ Downgrade",
    paymentRequired: "💳 Payment required",
    recommended: "Recommended",
    limitExceeded: "⚠️ Limit exceeded",
    switchToPlan: "Switch to plan",
    downgradeWarning: "⚠️ Your {count} members exceed the limit of {limit} for the {name} plan. Some members may become inaccessible.",
    enterpriseNote: "Our team will contact you to configure your custom plan.",
    downgradeNote: "Your plan will be reduced at the end of the current billing cycle.",
    choosePayment: "Choose your payment method to activate this plan.",
    contactUs: "📧 Contact us",
    confirmDowngrade: "Confirm downgrade",
    proceedPayment: "💳 Proceed to payment",
    cancel: "Cancel",
    paymentMethod: "Choose your payment method",
    chooseDuration: "Choose duration",
    creditCard: "Credit card",
    creditCardSub: "Via Lemon Squeezy · Visa, Mastercard, Apple Pay",
    paypalSub: "PayPal account or card via PayPal",
    securePayment: "🔒 Secure payment · Cancel anytime",
    confirmingDowngrade: "Confirm downgrade",
    confirmingDowngradeInProgress: "Processing…",
    freeDowngradeNote: "You will return to the free plan (50 members max).",
    errorPrefix: "Error: ",
    errorLemonSqueezy: "Payment error: ",
    errorPaypal: "PayPal error: ",
    freeDowngradeSuccess: "Switched back to Starter plan.",
    freePlanActivated: "{name} plan activated via PayPal!",
    save: "Save",
    perMonth: "/mo",
  },
};

const PLANS = [
  { id: "free",       nom: { fr: "Départ",     en: "Starter"   }, prix: { fr: "Gratuit",    en: "Free"    }, prixNum: 0,  limite: 50,   emoji: "🌱", color: "#10b981" },
  { id: "starter",    nom: { fr: "Croissance", en: "Growth"    }, prix: { fr: "$19/mois",   en: "$19/mo"  }, prixNum: 19, limite: 200,  emoji: "📈", color: "#3b82f6" },
  { id: "vision",     nom: { fr: "Vision",     en: "Vision"    }, prix: { fr: "$39/mois",   en: "$39/mo"  }, prixNum: 39, limite: 500,  emoji: "🔥", color: "#f59e0b" },
  { id: "expansion",  nom: { fr: "Expansion",  en: "Expansion" }, prix: { fr: "$79/mois",   en: "$79/mo"  }, prixNum: 79, limite: 1500, emoji: "🌍", color: "#8b5cf6" },
  { id: "enterprise", nom: { fr: "Réseaux",    en: "Networks"  }, prix: { fr: "Sur mesure", en: "Custom"  }, prixNum: 99, limite: null, emoji: "🔗", color: "#ec4899" },
];

// Durées disponibles par plan
const DUREES = {
  starter: [
    { id: "1m", label: { fr: "1 mois",  en: "1 month"  }, prix: 19,  economie: null },
    { id: "6m", label: { fr: "6 mois",  en: "6 months" }, prix: 99,  economie: 15   },
    { id: "1a", label: { fr: "1 an",    en: "1 year"   }, prix: 179, economie: 49   },
  ],
  vision: [
    { id: "1m", label: { fr: "1 mois",  en: "1 month"  }, prix: 39,  economie: null },
    { id: "6m", label: { fr: "6 mois",  en: "6 months" }, prix: 199, economie: 35   },
    { id: "1a", label: { fr: "1 an",    en: "1 year"   }, prix: 359, economie: 109  },
  ],
  expansion: [
    { id: "1m", label: { fr: "1 mois",  en: "1 month"  }, prix: 79,  economie: null },
    { id: "6m", label: { fr: "6 mois",  en: "6 months" }, prix: 399, economie: 75   },
    { id: "1a", label: { fr: "1 an",    en: "1 year"   }, prix: 719, economie: 229  },
  ],
};

const FREE_PLANS = ["free", "enterprise"];

function barColor(pct) {
  if (pct < 50) return "#10b981";
  if (pct < 80) return "#f59e0b";
  return "#ef4444";
}

function ProgressBar({ value, max, height = 8 }) {
  const isUnlimited = max === null || max === undefined;
  const pct = isUnlimited ? 0 : Math.min(100, (value / max) * 100);
  return (
    <div style={{ width: "100%", height, background: "rgba(255,255,255,0.1)", borderRadius: 99, overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${pct}%`, background: barColor(pct), borderRadius: 99, transition: "width 0.5s ease" }} />
    </div>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function PaymentModal({ plan, egliseId, onClose, onSuccess, lang }) {
  const t = translations[lang];
  const [loading, setLoading]   = useState(null);
  const [error, setError]       = useState(null);
  const [duree, setDuree]       = useState("1m");

  const isFree   = FREE_PLANS.includes(plan.id);
  const durees   = DUREES[plan.id] || [];
  const dureeObj = durees.find(d => d.id === duree) || durees[0];

  async function handleFreeDowngrade() {
    setLoading("free");
    try {
      const now       = new Date();
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
      onSuccess(t.freeDowngradeSuccess);
    } catch (e) {
      setError(t.errorPrefix + e.message);
    } finally {
      setLoading(null);
    }
  }

  async function handleLemonSqueezy() {
    setLoading("lemonsqueezy");
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const email = user?.email;
      if (!email) throw new Error("Utilisateur non connecté");

      const res  = await fetch("/api/lemonsqueezy/checkout", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ egliseId, planId: plan.id, duree, email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      window.location.href = data.checkoutUrl;
    } catch (e) {
      setError(t.errorLemonSqueezy + e.message);
    } finally {
      setLoading(null);
    }
  }

  async function handlePayPal() {
    setLoading("paypal");
    setError(null);
    try {
      const res  = await fetch("/api/paypal/create-order", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ egliseId, planId: plan.id, duree }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      if (data.type === "subscription") {
        window.location.href = data.approvalUrl;
      } else {
        const paypalBase = process.env.NEXT_PUBLIC_PAYPAL_MODE === "live"
          ? "https://www.paypal.com"
          : "https://www.sandbox.paypal.com";
        window.location.href = `${paypalBase}/checkoutnow?token=${data.orderId}`;
      }
    } catch (e) {
      setError(t.errorPaypal + e.message);
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
            <p className="text-white font-bold text-lg">{plan.emoji} {plan.nom[lang]}</p>
            <p className="text-white/40 text-sm">{plan.prix[lang]}</p>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white/70 transition text-xl font-bold">×</button>
        </div>

        {error && (
          <div className="bg-red-500/15 border border-red-500/30 rounded-xl px-3 py-2 text-red-300 text-sm">
            {error}
          </div>
        )}

        {isFree ? (
          <div className="space-y-3">
            <p className="text-white/60 text-sm">{t.freeDowngradeNote}</p>
            <button
              onClick={handleFreeDowngrade}
              disabled={loading === "free"}
              className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2"
              style={{ background: "#10b981", color: "#fff", opacity: loading ? 0.7 : 1 }}
            >
              {loading === "free" ? <><Spinner /> {t.confirmingDowngradeInProgress}</> : t.confirmingDowngrade}
            </button>
          </div>
        ) : (
          <div className="space-y-4">

            {/* ── Sélecteur de durée ── */}
            <div className="space-y-2">
              <p className="text-white/50 text-xs uppercase tracking-widest font-semibold">{t.chooseDuration}</p>
              <div className="grid grid-cols-3 gap-2">
                {durees.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => setDuree(d.id)}
                    className="rounded-xl p-3 flex flex-col items-center gap-1 transition-all"
                    style={{
                      background: duree === d.id ? `${plan.color}22` : "rgba(255,255,255,0.05)",
                      border: duree === d.id ? `1.5px solid ${plan.color}` : "1.5px solid rgba(255,255,255,0.1)",
                    }}
                  >
                    <span className="text-white font-semibold text-xs">{d.label[lang]}</span>
                    <span className="font-bold text-sm" style={{ color: duree === d.id ? plan.color : "rgba(255,255,255,0.6)" }}>
                      ${d.prix}
                    </span>
                    {d.economie && (
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-full font-semibold">
                        -{d.economie}$
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Moyen de paiement ── */}
            <div className="space-y-2">
              <p className="text-white/50 text-xs uppercase tracking-widest font-semibold">{t.paymentMethod}</p>

              {/* Lemon Squeezy */}
              <button
                onClick={handleLemonSqueezy}
                disabled={!!loading}
                className="w-full rounded-xl p-4 flex items-center gap-4 text-left transition-all"
                style={{
                  background: loading === "lemonsqueezy" ? "rgba(99,102,241,0.25)" : "rgba(99,102,241,0.12)",
                  border:     "1.5px solid rgba(99,102,241,0.5)",
                  opacity:    loading && loading !== "lemonsqueezy" ? 0.5 : 1,
                }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(99,102,241,0.2)" }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <rect x="2" y="6" width="20" height="14" rx="3" stroke="#818cf8" strokeWidth="1.8"/>
                    <path d="M2 10h20" stroke="#818cf8" strokeWidth="1.8"/>
                    <rect x="5" y="14" width="4" height="2" rx="1" fill="#818cf8"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-white font-semibold text-sm flex items-center gap-2">
                    {t.creditCard}
                    <span className="text-[10px] bg-indigo-400/20 text-indigo-300 px-1.5 py-0.5 rounded-full font-bold">{t.recommended}</span>
                  </p>
                  <p className="text-white/40 text-xs mt-0.5">{t.creditCardSub}</p>
                </div>
                {loading === "lemonsqueezy" ? <Spinner /> : <span className="text-white/30 text-lg">→</span>}
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
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(0,112,240,0.15)" }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <path d="M7 20V4h6a5 5 0 0 1 5 5v0a5 5 0 0 1-5 5H9" stroke="#60a5fa" strokeWidth="1.8" strokeLinecap="round"/>
                    <path d="M9 14l-2 6" stroke="#60a5fa" strokeWidth="1.8" strokeLinecap="round"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-white font-semibold text-sm">PayPal</p>
                  <p className="text-white/40 text-xs mt-0.5">{t.paypalSub}</p>
                </div>
                {loading === "paypal" ? <Spinner /> : <span className="text-white/30 text-lg">→</span>}
              </button>
            </div>
          </div>
        )}

        <p className="text-white/25 text-[11px] text-center">{t.securePayment}</p>
      </div>
    </div>
  );
}

function SubscriptionContent() {
  const router = useRouter();
  const { lang } = useLang();
  const t = translations[lang];

  const [subscription, setSubscription]         = useState(null);
  const [nombreMembres, setNombreMembres]       = useState(0);
  const [egliseId, setEgliseId]                 = useState(null);
  const [loading, setLoading]                   = useState(true);
  const [message, setMessage]                   = useState(null);
  const [selectedPlanId, setSelectedPlanId]     = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    const params    = new URLSearchParams(window.location.search);
    const token     = params.get("token");
    const success   = params.get("success");
    const cancelled = params.get("cancelled");

    if (token) {
      fetch("/api/paypal/capture-order", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ orderId: token }),
      })
        .then(r => r.json())
        .then(d => {
          window.history.replaceState({}, "", window.location.pathname);
          if (d.success) {
            setMessage({ type: "success", text: t.paymentConfirmed });
          } else {
            setMessage({ type: "error", text: d.error || "Erreur capture" });
          }
          loadData();
        })
        .catch(() => {
          setMessage({ type: "error", text: t.paymentCancelled });
          loadData();
        });
    } else {
      if (success === "true") {
        setMessage({ type: "success", text: t.paymentConfirmed });
        window.history.replaceState({}, "", window.location.pathname);
      } else if (cancelled === "true") {
        setMessage({ type: "error", text: t.paymentCancelled });
        window.history.replaceState({}, "", window.location.pathname);
      }
      loadData();
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
      {showPaymentModal && confirmTarget && egliseId && (
        <PaymentModal
          plan={confirmTarget}
          egliseId={egliseId}
          lang={lang}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={handlePaymentSuccess}
        />
      )}

      <div className="min-h-screen p-6 bg-[#333699]">
        <HeaderPages />

        <h1 className="text-2xl font-bold mt-4 mb-6 text-center text-white">
          {t.pageTitle} <span className="text-emerald-300">{t.pageTitleHighlight}</span>
        </h1>

        <div className="max-w-3xl w-full mb-6 text-center mx-auto">
          <p className="italic text-base text-white/90">
            <span className="text-blue-300 font-semibold">{t.pageSubtitle}</span>.
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-5">
          {loading ? (
            <p className="text-center text-white/60 py-20">{t.loading}</p>
          ) : (
            <>
              {message && (
                <div className={`rounded-xl px-4 py-3 text-sm font-medium border ${
                  message.type === "error"
                    ? "bg-red-500/15 border-red-500/40 text-red-300"
                    : "bg-emerald-500/15 border-emerald-500/40 text-emerald-300"
                }`}>
                  {message.text}
                </div>
              )}

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
                    {t.currentPlan}
                  </span>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{planActuel.emoji}</span>
                      <div>
                        <p className="text-white font-semibold text-lg leading-tight">{planActuel.nom[lang]}</p>
                        {subscription?.current_period_end && (
                          <p className="text-white/40 text-xs mt-0.5">
                            {t.renewalDate}{" "}
                            {new Date(subscription.current_period_end).toLocaleDateString(
                              lang === "fr" ? "fr-FR" : "en-US",
                              { day: "numeric", month: "long", year: "numeric" }
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-xl" style={{ color: planActuel.color }}>
                        {planActuel.prix[lang]}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs text-white/50">
                      <span>{nombreMembres} {t.membersUsed}</span>
                      <span>{planActuel.limite ? `${planActuel.limite} ${t.max}` : t.unlimited}</span>
                    </div>
                   <ProgressBar value={nombreMembres} max={planActuel.limite} height={8} />
                    {pctActuel >= 80 && (
                      <p className="text-xs text-amber-400 mt-1">{t.approachingLimit}</p>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-white/50 text-center text-sm">{t.noActivePlan}</p>
              )}

              {autresPlans.length > 0 && (
                <div>
                  <p className="text-white/40 text-xs uppercase font-semibold tracking-widest mb-3">
                    {t.changePlan}
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
                              ? isUpgrade ? `1.5px solid ${plan.color}99` : "1.5px solid rgba(255,255,255,0.35)"
                              : isUpgrade ? `1px solid ${plan.color}33`   : "1px solid rgba(255,255,255,0.10)",
                          }}
                        >
                          <span className="text-2xl shrink-0">{plan.emoji}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                              <p className="text-white font-semibold text-sm">{plan.nom[lang]}</p>
                              <span
                                className="text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full"
                                style={
                                  isUpgrade
                                    ? { background: `${plan.color}22`, color: plan.color }
                                    : { background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.4)" }
                                }
                              >
                                {isUpgrade ? t.upgrade : t.downgrade}
                              </span>
                              {needsPay && (
                                <span className="text-[10px] font-bold bg-indigo-400/20 text-indigo-300 px-1.5 py-0.5 rounded-full">
                                  {t.paymentRequired}
                                </span>
                              )}
                              {pctActuel >= 70 && isUpgrade && (
                                <span className="text-[10px] font-bold bg-amber-400 text-black px-1.5 py-0.5 rounded-full">
                                  {t.recommended}
                                </span>
                              )}
                              {depasseLimit && (
                                <span className="text-[10px] font-bold bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded-full">
                                  {t.limitExceeded}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-1.5">
                              <div className="flex-1">
                                {plan.limite ? (
                                  <ProgressBar value={nombreMembres} max={plan.limite} height={4} />
                                ) : (
                                  <ProgressBar value={0} max={1} height={4} />
                                )}
                              </div>
                              <span className="text-white/30 text-[11px] shrink-0">
                                {plan.limite ? `${nombreMembres}/${plan.limite}` : t.unlimited}
                              </span>
                            </div>
                          </div>
                          <p className="text-sm font-semibold shrink-0" style={{ color: isUpgrade ? plan.color : "rgba(255,255,255,0.5)" }}>
                            {plan.prix[lang]}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {selectedPlanId && confirmTarget && (
                <div
                  className="rounded-2xl p-5 space-y-3"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)" }}
                >
                  <p className="text-white font-semibold">
                    {t.switchToPlan}{" "}
                    <span style={{ color: confirmTarget.color }}>{confirmTarget.nom[lang]}</span>
                    {" "}— {confirmTarget.prix[lang]}
                  </p>

                  {isDowngrade && confirmTarget.limite && nombreMembres > confirmTarget.limite && (
                    <div className="bg-red-500/15 border border-red-500/30 rounded-xl px-3 py-2.5 text-red-300 text-sm">
                      {t.downgradeWarning
                        .replace("{count}", nombreMembres)
                        .replace("{limit}", confirmTarget.limite)
                        .replace("{name}", confirmTarget.nom[lang])
                      }
                    </div>
                  )}

                  {FREE_PLANS.includes(confirmTarget.id) ? (
                    <p className="text-white/50 text-sm">
                      {confirmTarget.id === "enterprise" ? t.enterpriseNote : t.downgradeNote}
                    </p>
                  ) : (
                    <p className="text-white/50 text-sm">{t.choosePayment}</p>
                  )}

                  <div className="flex gap-3 pt-1">
                    <button
                      onClick={() => {
                        if (confirmTarget.id === "enterprise") {
                          router.push("/site/contact?type=reseaux");
                        } else {
                          setShowPaymentModal(true);
                        }
                      }}
                      className="flex-1 py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-opacity"
                      style={{ background: confirmTarget.color, color: "#fff" }}
                    >
                      {FREE_PLANS.includes(confirmTarget.id)
                        ? confirmTarget.id === "enterprise" ? t.contactUs : t.confirmDowngrade
                        : t.proceedPayment
                      }
                    </button>
                    <button
                      onClick={() => setSelectedPlanId(null)}
                      className="px-4 py-2.5 rounded-xl text-sm text-white/50 hover:text-white/80 transition"
                      style={{ border: "1px solid rgba(255,255,255,0.15)" }}
                    >
                      {t.cancel}
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
