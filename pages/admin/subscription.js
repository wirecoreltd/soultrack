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

function SubscriptionContent() {
  const router = useRouter();

  const [subscription, setSubscription] = useState(null);
  const [nombreMembres, setNombreMembres] = useState(0);
  const [egliseId, setEgliseId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    loadData();
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
      .is("raison_supprime", null);

    setNombreMembres(count || 0);
    setLoading(false);
  }

  const planActuelIndex = PLANS.findIndex(p => p.id === subscription?.plan_id);
  const planActuel = PLANS[planActuelIndex];
  const planDowngrade = planActuelIndex > 0 ? PLANS[planActuelIndex - 1] : null;
  const planUpgrade = planActuelIndex < PLANS.length - 1 ? PLANS[planActuelIndex + 1] : null;

  function handleChangePlan(plan) {
    // Redirection vers Stripe avec le plan choisi en paramètre
    router.push(`/site/pricing?plan=${plan.id}&eglise_id=${egliseId}`);
  }

  const pctUtilise = planActuel?.limite
    ? Math.min(100, (nombreMembres / planActuel.limite) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-[#333699]">
      <HeaderPages />

      <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">

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
            {/* Message feedback */}
            {message && (
              <div className={`rounded-xl px-4 py-3 text-sm font-medium border ${
                message.type === "error"
                  ? "bg-red-500/15 border-red-500/40 text-red-300"
                  : "bg-emerald-500/15 border-emerald-500/40 text-emerald-300"
              }`}>
                {message.text}
              </div>
            )}

            {/* Plan actuel */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <p className="text-xs text-white/40 uppercase font-semibold tracking-wider mb-4">
                Plan actuel
              </p>

              <div className="flex items-center gap-4 mb-6">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ background: `${planActuel?.color}22`, border: `1.5px solid ${planActuel?.color}55` }}
                >
                  {planActuel?.emoji}
                </div>
                <div>
                  <h2 className="text-white text-xl font-bold">{planActuel?.nom ?? "Aucun plan"}</h2>
                  <span
                    className="text-sm font-semibold px-3 py-0.5 rounded-full"
                    style={{ background: `${planActuel?.color}22`, color: planActuel?.color }}
                  >
                    {planActuel?.prix}
                  </span>
                </div>
              </div>

              {/* Utilisation membres */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Membres actifs</span>
                  <span className="text-white font-semibold">
                    {nombreMembres}
                    <span className="text-white/40 font-normal"> / {planActuel?.limite ?? "∞"}</span>
                  </span>
                </div>
                {planActuel?.limite && (
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${pctUtilise}%`,
                        background: pctUtilise > 90 ? "#ef4444" : pctUtilise > 70 ? "#f59e0b" : "#10b981",
                      }}
                    />
                  </div>
                )}
                {pctUtilise > 90 && planActuel?.limite && (
                  <p className="text-red-400 text-xs">
                    ⚠️ Vous approchez de la limite — pensez à upgrader
                  </p>
                )}
              </div>

              {/* Renouvellement */}
              {subscription?.current_period_end && (
                <p className="text-white/30 text-xs mt-4">
                  Renouvellement le{" "}
                  {new Date(subscription.current_period_end).toLocaleDateString("fr-FR", {
                    day: "numeric", month: "long", year: "numeric"
                  })}
                </p>
              )}
            </div>

            {/* Boutons Downgrade / Upgrade */}
            <div className={`grid gap-4 ${planDowngrade && planUpgrade ? "grid-cols-2" : "grid-cols-1"}`}>

              {/* Downgrade */}
              {planDowngrade && (
                <button
                  onClick={() => handleChangePlan(planDowngrade)}
                  className="group bg-white/10 hover:bg-white/15 border border-white/20 rounded-2xl p-5 text-left transition-all duration-200"
                >
                  <p className="text-white/40 text-xs uppercase font-semibold tracking-wider mb-3">
                    ↓ Downgrade
                  </p>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{planDowngrade.emoji}</span>
                    <div>
                      <p className="text-white font-semibold">{planDowngrade.nom}</p>
                      <p className="text-white/50 text-sm">{planDowngrade.prix}</p>
                    </div>
                  </div>
                  <p className="text-white/30 text-xs mt-3">
                    Limite : {planDowngrade.limite ? `${planDowngrade.limite} membres` : "Illimité"}
                  </p>
                </button>
              )}

              {/* Upgrade */}
              {planUpgrade && (
                <button
                  onClick={() => handleChangePlan(planUpgrade)}
                  className="group relative overflow-hidden rounded-2xl p-5 text-left transition-all duration-200"
                  style={{
                    background: `linear-gradient(135deg, ${planUpgrade.color}22, ${planUpgrade.color}11)`,
                    border: `1.5px solid ${planUpgrade.color}44`,
                  }}
                >
                  {pctUtilise > 70 && (
                    <span className="absolute top-3 right-3 bg-amber-400 text-black text-[10px] font-bold px-2 py-0.5 rounded-full">
                      Recommandé
                    </span>
                  )}
                  <p className="text-white/40 text-xs uppercase font-semibold tracking-wider mb-3">
                    ↑ Upgrade
                  </p>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{planUpgrade.emoji}</span>
                    <div>
                      <p className="text-white font-semibold">{planUpgrade.nom}</p>
                      <p className="text-sm font-semibold" style={{ color: planUpgrade.color }}>
                        {planUpgrade.prix}
                      </p>
                    </div>
                  </div>
                  <p className="text-white/30 text-xs mt-3">
                    Limite : {planUpgrade.limite ? `${planUpgrade.limite} membres` : "Illimité"}
                  </p>
                </button>
              )}
            </div>

            {/* Voir tous les plans */}
            <div className="text-center">
              <button
                onClick={() => router.push("/site/pricing")}
                className="text-white/40 hover:text-white/70 text-sm underline underline-offset-4 transition"
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
