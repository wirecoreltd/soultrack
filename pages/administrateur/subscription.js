"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import supabase from "../../lib/supabaseClient";
import HeaderPages from "../../components/HeaderPages";
import ProtectedRoute from "../../components/ProtectedRoute";
import Footer from "../../components/Footer";

const PLANS = [
  { id: "free",       nom: "Départ",     prix: "Gratuit",    limite: 50,   emoji: "🌱", color: "#10b981" },
  { id: "starter",    nom: "Croissance", prix: "$19/mois",   limite: 200,  emoji: "📈", color: "#3b82f6" },
  { id: "vision",     nom: "Vision",     prix: "$39/mois",   limite: 500,  emoji: "🔥", color: "#f59e0b" },
  { id: "expansion",  nom: "Expansion",  prix: "$79/mois",   limite: 1500, emoji: "🌍", color: "#8b5cf6" },
  { id: "enterprise", nom: "Réseaux",    prix: "Sur mesure", limite: null, emoji: "🔗", color: "#ec4899" },
];

function barColor(pct) {
  if (pct < 33) return "#10b981";
  if (pct < 66) return "#f59e0b";
  return "#ef4444";
}

function SubscriptionContent() {
  const router = useRouter();
  const [subscription, setSubscription] = useState(null);
  const [nombreMembres, setNombreMembres] = useState(0);
  const [egliseId, setEgliseId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

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

    console.log("eglise_id:", profile.eglise_id); // debug

    const { data: sub, error: subErr } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("eglise_id", profile.eglise_id)
      .maybeSingle();

    console.log("subscription:", sub, subErr); // debug

    setSubscription(sub);

    const { count } = await supabase
      .from("membres_complets")
      .select("*", { count: "exact", head: true })
      .eq("eglise_id", profile.eglise_id)
      .is("raison_supprime", null);

    setNombreMembres(count || 0);
    setLoading(false);
  }

  const planIndex    = PLANS.findIndex(p => p.id === subscription?.plan_id);
  const planActuel   = planIndex >= 0 ? PLANS[planIndex] : null;
  const planDowngrade = planIndex > 0 ? PLANS[planIndex - 1] : null;
  const planUpgrade  = planIndex >= 0 && planIndex < PLANS.length - 1 ? PLANS[planIndex + 1] : null;

  const limite = planActuel?.limite ?? null;
  const pct    = limite ? Math.min(100, (nombreMembres / limite) * 100) : 0;

  function handleChangePlan(plan) {
    router.push(`/site/pricing?plan=${plan.id}&eglise_id=${egliseId}`);
  }

  return (
    <div className="min-h-screen bg-[#333699]">
      <HeaderPages />

      <div className="max-w-xl mx-auto px-4 py-10 space-y-5">

        {/* Titre */}
        <div className="text-center mb-2">
          <h1 className="text-2xl font-bold text-white mb-1">
            Mon <span className="text-emerald-300">Abonnement</span>
          </h1>
          <p className="text-white/50 text-sm">Gérez votre plan et suivez votre utilisation</p>
        </div>

        {loading ? (
          <p className="text-center text-white/60 py-20">Chargement...</p>
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

            {/* ── CARD PLAN ACTUEL ── */}
            {planActuel ? (
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 text-center">

                {/* Emoji + nom */}
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-3"
                  style={{ background: `${planActuel.color}22`, border: `1.5px solid ${planActuel.color}55` }}
                >
                  {planActuel.emoji}
                </div>
                <h2 className="text-white text-2xl font-bold">{planActuel.nom}</h2>
                <span
                  className="inline-block mt-1 text-sm font-semibold px-3 py-0.5 rounded-full"
                  style={{ background: `${planActuel.color}22`, color: planActuel.color }}
                >
                  {planActuel.prix}
                </span>

                {/* Barre utilisation */}
                <div className="mt-6 space-y-2">
                  <div className="flex justify-between text-sm px-1">
                    <span className="text-white/60">Membres actifs</span>
                    <span className="text-white font-bold text-base">
                      {nombreMembres}
                      <span className="text-white/40 font-normal text-sm"> / {limite ?? "∞"}</span>
                    </span>
                  </div>
                  {limite && (
                    <>
                      <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${pct}%`, background: barColor(pct) }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-white/30 px-1">
                        <span>0</span>
                        <span>{Math.round(pct)}% utilisé</span>
                        <span>{limite}</span>
                      </div>
                    </>
                  )}
                  {pct > 90 && (
                    <p className="text-red-400 text-xs text-center pt-1">
                      ⚠️ Limite presque atteinte — pensez à upgrader
                    </p>
                  )}
                </div>

                {/* Renouvellement */}
                {subscription?.current_period_end && (
                  <p className="text-white/25 text-xs mt-4">
                    Renouvellement le{" "}
                    {new Date(subscription.current_period_end).toLocaleDateString("fr-FR", {
                      day: "numeric", month: "long", year: "numeric"
                    })}
                  </p>
                )}
              </div>
            ) : (
              <div className="bg-white/10 rounded-2xl p-6 text-center text-white/50 text-sm">
                Aucun abonnement trouvé pour cette église.
              </div>
            )}

            {/* ── BOUTONS DOWNGRADE / UPGRADE ── */}
            <div className={`grid gap-4 ${planDowngrade && planUpgrade ? "grid-cols-2" : "grid-cols-1"}`}>

              {planDowngrade && (
                <button
                  onClick={() => handleChangePlan(planDowngrade)}
                  className="bg-white/10 hover:bg-white/15 border border-white/20 rounded-2xl p-5 text-center transition-all duration-200"
                >
                  <p className="text-white/40 text-xs uppercase font-semibold tracking-wider mb-3">↓ Downgrade</p>
                  <div className="text-2xl mb-2">{planDowngrade.emoji}</div>
                  <p className="text-white font-semibold">{planDowngrade.nom}</p>
                  <p className="text-white/50 text-sm mt-0.5">{planDowngrade.prix}</p>
                  <p className="text-white/30 text-xs mt-3">
                    {planDowngrade.limite ? `${planDowngrade.limite} membres` : "Illimité"}
                  </p>
                </button>
              )}

              {planUpgrade && (
                <button
                  onClick={() => handleChangePlan(planUpgrade)}
                  className="rounded-2xl p-5 text-center transition-all duration-200 relative overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${planUpgrade.color}22, ${planUpgrade.color}11)`,
                    border: `1.5px solid ${planUpgrade.color}55`,
                  }}
                >
                  {pct > 70 && (
                    <span className="absolute top-3 right-3 bg-amber-400 text-black text-[10px] font-bold px-2 py-0.5 rounded-full">
                      Recommandé
                    </span>
                  )}
                  <p className="text-amber-300 text-xs uppercase font-semibold tracking-wider mb-3">↑ Upgrade</p>
                  <div className="text-2xl mb-2">{planUpgrade.emoji}</div>
                  <p className="text-white font-semibold">{planUpgrade.nom}</p>
                  <p className="text-sm font-semibold mt-0.5" style={{ color: planUpgrade.color }}>
                    {planUpgrade.prix}
                  </p>
                  <p className="text-white/30 text-xs mt-3">
                    {planUpgrade.limite ? `${planUpgrade.limite} membres` : "Illimité"}
                  </p>
                </button>
              )}
            </div>

            {/* Voir tous les plans */}
            <div className="text-center pt-2">
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
