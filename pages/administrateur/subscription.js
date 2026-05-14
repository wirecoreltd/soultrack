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
  const [selectedPlan, setSelectedPlan]   = useState(null); // "upgrade" | "downgrade" | null
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
  const planDowngrade   = planActuelIndex > 0 ? PLANS[planActuelIndex - 1] : null;
  const planUpgrade     = planActuelIndex >= 0 && planActuelIndex < PLANS.length - 1
    ? PLANS[planActuelIndex + 1]
    : null;

  const pctActuel = planActuel?.limite
    ? Math.min(100, (nombreMembres / planActuel.limite) * 100)
    : 0;

  // --- Confirmation inline ---
  async function handleConfirm() {
    const target = selectedPlan === "upgrade" ? planUpgrade : planDowngrade;
    if (!target) return;
    setConfirming(true);
    setMessage(null);

    try {
      // Remplacer par votre logique Stripe / Supabase réelle
      const { error } = await supabase
        .from("subscriptions")
        .update({ plan_id: target.id })
        .eq("eglise_id", egliseId);

      if (error) throw error;

      setMessage({ type: "success", text: `Plan mis à jour vers ${target.nom} avec succès.` });
      setSelectedPlan(null);
      await loadData();
    } catch (err) {
      setMessage({ type: "error", text: "Une erreur est survenue. Veuillez réessayer." });
    } finally {
      setConfirming(false);
    }
  }

  const confirmTarget = selectedPlan === "upgrade" ? planUpgrade : planDowngrade;
  const downgradeWarning =
    selectedPlan === "downgrade" &&
    planDowngrade?.limite &&
    nombreMembres > planDowngrade.limite;

  // ---- Render ----
  return (
    <div className="min-h-screen" style={{ background: "#333699" }}>
      <HeaderPages />

      <div className="max-w-xl mx-auto px-4 py-10 space-y-6">

        {/* Titre */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-1">
            Mon <span className="text-emerald-300">Abonnement</span>
          </h1>
          <p className="text-white/50 text-sm">
            Gérez votre plan et suivez votre utilisation
          </p>
        </div>

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
                {/* Badge */}
                <span
                  className="inline-block text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full mb-3"
                  style={{ background: `${planActuel.color}22`, color: planActuel.color }}
                >
                  Plan actuel
                </span>

                {/* Nom + prix */}
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

                {/* Barre d'utilisation */}
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
            {(planDowngrade || planUpgrade) && (
              <div>
                <p className="text-white/40 text-xs uppercase font-semibold tracking-widest mb-3">
                  Changer de plan
                </p>
                <div className={`grid gap-3 ${planDowngrade && planUpgrade ? "grid-cols-2" : "grid-cols-1"}`}>

                  {/* Downgrade */}
                  {planDowngrade && (
                    <button
                      onClick={() => setSelectedPlan(selectedPlan === "downgrade" ? null : "downgrade")}
                      className="rounded-2xl p-4 flex flex-col items-start text-left transition-all duration-200"
                      style={{
                        background: selectedPlan === "downgrade"
                          ? "rgba(255,255,255,0.12)"
                          : "rgba(255,255,255,0.06)",
                        border: selectedPlan === "downgrade"
                          ? "1.5px solid rgba(255,255,255,0.35)"
                          : "1px solid rgba(255,255,255,0.12)",
                      }}
                    >
                      <p className="text-white/40 text-xs uppercase font-semibold tracking-wider mb-2">
                        ↓ Downgrade
                      </p>
                      <span className="text-2xl mb-1">{planDowngrade.emoji}</span>
                      <p className="text-white font-semibold">{planDowngrade.nom}</p>
                      <p className="text-white/50 text-sm">{planDowngrade.prix}</p>
                      <div className="w-full mt-3 space-y-1">
                        <div className="flex justify-between text-xs text-white/40">
                          <span>{nombreMembres} membres</span>
                          <span>{planDowngrade.limite ?? "∞"}</span>
                        </div>
                        <ProgressBar value={nombreMembres} max={planDowngrade.limite ?? nombreMembres} height={5} />
                      </div>
                    </button>
                  )}

                  {/* Upgrade */}
                  {planUpgrade && (
                    <button
                      onClick={() => setSelectedPlan(selectedPlan === "upgrade" ? null : "upgrade")}
                      className="relative rounded-2xl p-4 flex flex-col items-start text-left transition-all duration-200"
                      style={{
                        background: selectedPlan === "upgrade"
                          ? `${planUpgrade.color}22`
                          : `${planUpgrade.color}11`,
                        border: selectedPlan === "upgrade"
                          ? `1.5px solid ${planUpgrade.color}99`
                          : `1px solid ${planUpgrade.color}33`,
                      }}
                    >
                      {pctActuel >= 70 && (
                        <span className="absolute top-2.5 right-2.5 bg-amber-400 text-black text-[10px] font-bold px-2 py-0.5 rounded-full">
                          Recommandé
                        </span>
                      )}
                      <p className="text-amber-300 text-xs uppercase font-semibold tracking-wider mb-2">
                        ↑ Upgrade
                      </p>
                      <span className="text-2xl mb-1">{planUpgrade.emoji}</span>
                      <p className="text-white font-semibold">{planUpgrade.nom}</p>
                      <p className="text-sm font-semibold" style={{ color: planUpgrade.color }}>
                        {planUpgrade.prix}
                      </p>
                      <div className="w-full mt-3 space-y-1">
                        <div className="flex justify-between text-xs text-white/40">
                          <span>{nombreMembres} membres</span>
                          <span>{planUpgrade.limite ?? "∞"}</span>
                        </div>
                        <ProgressBar value={nombreMembres} max={planUpgrade.limite ?? nombreMembres} height={5} />
                      </div>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* ── 3. CONFIRMATION INLINE ── */}
            {selectedPlan && confirmTarget && (
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
                    ⚠️ Vos {nombreMembres} membres dépassent la limite de {planDowngrade?.limite} du plan{" "}
                    {planDowngrade?.nom}. Certains membres pourraient devenir inaccessibles.
                  </div>
                )}

                {!downgradeWarning && selectedPlan === "downgrade" && (
                  <p className="text-white/50 text-sm">
                    Votre plan sera réduit à la fin du cycle actuel.
                  </p>
                )}

                {selectedPlan === "upgrade" && (
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
                    onClick={() => setSelectedPlan(null)}
                    className="px-4 py-2.5 rounded-xl text-sm text-white/50 hover:text-white/80 transition"
                    style={{ border: "1px solid rgba(255,255,255,0.15)" }}
                  >
                    Annuler
                  </button>
                </div>
              </div>
            )}

            {/* Voir tous les plans */}
            <div className="text-center">
              <button
                onClick={() => router.push("/site/pricing")}
                className="text-white/30 hover:text-white/60 text-sm underline underline-offset-4 transition"
              >
                Voir tous les plans
              </button>
            </div>
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
