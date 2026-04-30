"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import supabase from "../../lib/supabaseClient";
import HeaderPages from "../../components/HeaderPages";
import ProtectedRoute from "../../../components/ProtectedRoute";
import Footer from "/../../components/Footer";

const PLANS = [
  { id: "free",       nom: "Départ",     prix: "Gratuit",    limite: 50,   emoji: "🌱" },
  { id: "starter",    nom: "Croissance", prix: "$19/mois",   limite: 200,  emoji: "📈" },
  { id: "vision",     nom: "Vision",     prix: "$39/mois",   limite: 500,  emoji: "🔥" },
  { id: "expansion",  nom: "Expansion",  prix: "$79/mois",   limite: 1500, emoji: "🌍" },
  { id: "enterprise", nom: "Réseaux",    prix: "Sur mesure", limite: null, emoji: "🔗" },
];

function BillingContent() {
  const router = useRouter();

  const [subscription, setSubscription] = useState(null);
  const [nombreMembres, setNombreMembres] = useState(0);
  const [egliseId, setEgliseId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);
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

    if (!profile?.eglise_id) return;
    setEgliseId(profile.eglise_id);

    const { data: sub } = await supabase
      .from("subscriptions")
      .select("*, plans(*)")
      .eq("eglise_id", profile.eglise_id)
      .single();

    setSubscription(sub);

    const { count } = await supabase
      .from("membres_complets")
      .select("*", { count: "exact", head: true })
      .eq("eglise_id", profile.eglise_id)
      .is("raison_supprime", null);

    setNombreMembres(count || 0);
    setLoading(false);
  }

  async function changerPlan(newPlanId) {
    if (newPlanId === subscription?.plan_id) return;
    setUpgrading(true);
    setMessage(null);

    const res = await fetch("/api/billing/upgrade", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eglise_id: egliseId, new_plan_id: newPlanId }),
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage({ type: "error", text: data.message || "Erreur lors du changement de plan." });
    } else {
      setMessage({ type: "success", text: "Plan mis à jour avec succès !" });
      loadData();
    }

    setUpgrading(false);
  }

  if (loading) {
    return <p className="text-center mt-10 text-white">Chargement...</p>;
  }

  const planActuel = PLANS.find(p => p.id === subscription?.plan_id);
  const limiteActuelle = planActuel?.limite;

  return (
    <div className="min-h-screen p-6 bg-[#333699]">
      <HeaderPages />

      <h1 className="text-2xl font-bold mt-4 mb-2 text-white text-center">
        Abonnement <span className="text-emerald-300">SoulTrack</span>
      </h1>

      <div className="max-w-3xl w-full mb-6 text-center mx-auto">
        <p className="italic text-base text-white/90">
          <span className="text-blue-300 font-semibold">Gérez votre plan</span> et suivez
          l'utilisation de votre église. Passez à un plan supérieur pour{" "}
          <span className="text-blue-300 font-semibold">accueillir plus de membres</span>.
        </p>
      </div>

      <div className="max-w-3xl mx-auto space-y-4">

        {/* Plan actuel */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-5 border-l-4 border-amber-400">
          <p className="text-xs text-white/50 uppercase mb-3 font-semibold tracking-wider">
            Plan actuel
          </p>
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <span className="text-white text-xl font-bold">
                {planActuel?.emoji} {planActuel?.nom}
              </span>
              <span className="ml-3 bg-amber-400/20 text-amber-300 px-3 py-1 rounded-full text-sm font-semibold">
                {planActuel?.prix}
              </span>
            </div>
            <div className="text-right">
              <p className="text-sm text-white/60">Membres utilisés</p>
              <p className="text-2xl font-bold text-white">
                {nombreMembres}
                <span className="text-white/40 text-base font-normal">
                  {" "}/ {limiteActuelle ?? "∞"}
                </span>
              </p>
              {limiteActuelle && (
                <div className="w-40 h-1.5 bg-white/10 rounded-full mt-2">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min(100, (nombreMembres / limiteActuelle) * 100)}%`,
                      background: nombreMembres / limiteActuelle > 0.9 ? "#ef4444" : "#fbbf24",
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

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

        {/* Header desktop */}
        <div className="hidden sm:flex text-sm font-semibold text-white border-b border-white/20 pb-2 px-2">
          <div className="flex-[2]">Plan</div>
          <div className="flex-[2]">Limite</div>
          <div className="flex-[1] text-center">Prix</div>
          <div className="flex-[1] text-center">Action</div>
        </div>

        {/* Liste des plans */}
        {PLANS.map((plan) => {
          const estActuel = plan.id === subscription?.plan_id;
          return (
            <div
              key={plan.id}
              className="sm:hidden bg-white/10 backdrop-blur-md rounded-xl p-4 border-l-4 mb-2"
              style={{ borderLeftColor: estActuel ? "#fbbf24" : "rgba(255,255,255,0.2)" }}
            >
              {/* Mobile card */}
              <div className="text-white font-semibold text-lg">{plan.emoji} {plan.nom}</div>
              <div className="text-white/70 text-sm mt-1">
                👥 {plan.limite ? `Jusqu'à ${plan.limite} membres` : "Illimité"}
              </div>
              <div className="flex justify-between items-center mt-3">
                <span className="text-amber-300 font-bold">{plan.prix}</span>
                {estActuel ? (
                  <span className="bg-amber-400/20 text-amber-300 px-3 py-1 rounded-full text-sm font-semibold">
                    Actuel
                  </span>
                ) : (
                  <button
                    onClick={() => changerPlan(plan.id)}
                    disabled={upgrading}
                    className="bg-white text-[#333699] font-semibold px-4 py-1.5 rounded-lg text-sm shadow disabled:opacity-50"
                  >
                    {upgrading ? "..." : "Choisir"}
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {/* Desktop rows */}
        {PLANS.map((plan) => {
          const estActuel = plan.id === subscription?.plan_id;
          return (
            <div
              key={`desk-${plan.id}`}
              className={`hidden sm:flex flex-row items-center px-4 py-3 rounded-lg gap-2 border-l-4 ${
                estActuel ? "bg-amber-400/10 border-amber-400" : "bg-white/10 border-white/20"
              }`}
            >
              <div className="flex-[2] text-white font-semibold text-sm">
                {plan.emoji} {plan.nom}
              </div>
              <div className="flex-[2] text-white/70 text-sm">
                {plan.limite ? `Jusqu'à ${plan.limite} membres` : "Illimité"}
              </div>
              <div className="flex-[1] text-center text-amber-300 font-bold text-sm">
                {plan.prix}
              </div>
              <div className="flex-[1] flex justify-center">
                {estActuel ? (
                  <span className="bg-amber-400/20 text-amber-300 px-3 py-1 rounded-full text-sm font-semibold">
                    Actuel
                  </span>
                ) : (
                  <button
                    onClick={() => changerPlan(plan.id)}
                    disabled={upgrading}
                    className="bg-white text-[#333699] font-semibold px-4 py-1.5 rounded-lg text-sm shadow disabled:opacity-50"
                  >
                    {upgrading ? "..." : "Choisir"}
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {/* Renouvellement */}
        {subscription?.current_period_end && (
          <p className="text-center text-sm text-white/35 mt-4">
            Prochain renouvellement :{" "}
            {new Date(subscription.current_period_end).toLocaleDateString("fr-FR")}
          </p>
        )}
      </div>

      <Footer />
    </div>
  );
}

export default function BillingPage() {
  return (
    <ProtectedRoute allowedRoles={["Administrateur"]}>
      <BillingContent />
    </ProtectedRoute>
  );
}
