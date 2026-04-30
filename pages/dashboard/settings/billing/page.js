// app/dashboard/settings/billing/page.tsx
"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";

const PLANS = [
  { id: "free",       nom: "Départ",     prix: "Gratuit", limite: 50,   emoji: "🌱" },
  { id: "starter",    nom: "Croissance", prix: "$19/mois", limite: 200,  emoji: "📈" },
  { id: "vision",     nom: "Vision",     prix: "$39/mois", limite: 500,  emoji: "🔥" },
  { id: "expansion",  nom: "Expansion",  prix: "$79/mois", limite: 1500, emoji: "🌍" },
  { id: "enterprise", nom: "Réseaux",    prix: "Sur mesure", limite: null, emoji: "🔗" },
];

export default function BillingPage() {
  const supabase = createClientComponentClient();
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
    // Récupérer l'utilisateur connecté
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return router.push("/login");

    // Récupérer l'église liée à cet utilisateur
    // (adapte selon ta logique : profile, eglise_users, etc.)
    const { data: profile } = await supabase
      .from("profiles")
      .select("eglise_id")
      .eq("id", user.id)
      .single();

    if (!profile?.eglise_id) return;
    setEgliseId(profile.eglise_id);

    // Abonnement actuel
    const { data: sub } = await supabase
      .from("subscriptions")
      .select("*, plans(*)")
      .eq("eglise_id", profile.eglise_id)
      .single();

    setSubscription(sub);

    // Nombre de membres actifs
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

  if (loading) return (
    <div style={{ color: "#fff", padding: "40px", textAlign: "center" }}>
      Chargement...
    </div>
  );

  const planActuel = PLANS.find(p => p.id === subscription?.plan_id);
  const limiteActuelle = planActuel?.limite;

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "40px 24px", color: "#fff" }}>

      <h1 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "8px" }}>
        Abonnement
      </h1>
      <p style={{ color: "rgba(255,255,255,0.5)", marginBottom: "40px", fontSize: "14px" }}>
        Gérez votre plan SoulTrack
      </p>

      {/* Plan actuel */}
      <div style={{
        background: "rgba(255,255,255,0.07)",
        border: "0.5px solid rgba(255,255,255,0.15)",
        borderRadius: "16px",
        padding: "24px",
        marginBottom: "32px",
      }}>
        <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.45)", marginBottom: "8px" }}>
          PLAN ACTUEL
        </p>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <span style={{ fontSize: "20px", fontWeight: 700 }}>
              {planActuel?.emoji} {planActuel?.nom}
            </span>
            <span style={{
              marginLeft: "12px",
              background: "rgba(251,191,36,0.15)",
              color: "#fbbf24",
              padding: "3px 10px",
              borderRadius: "20px",
              fontSize: "13px",
              fontWeight: 600,
            }}>
              {planActuel?.prix}
            </span>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.6)" }}>
              Membres utilisés
            </p>
            <p style={{ fontSize: "18px", fontWeight: 700 }}>
              {nombreMembres}
              <span style={{ color: "rgba(255,255,255,0.4)", fontWeight: 400 }}>
                {" "}/ {limiteActuelle ?? "∞"}
              </span>
            </p>
            {/* Barre de progression */}
            {limiteActuelle && (
              <div style={{
                width: "160px", height: "6px",
                background: "rgba(255,255,255,0.1)",
                borderRadius: "4px", marginTop: "6px",
              }}>
                <div style={{
                  width: `${Math.min(100, (nombreMembres / limiteActuelle) * 100)}%`,
                  height: "100%",
                  background: nombreMembres / limiteActuelle > 0.9 ? "#ef4444" : "#fbbf24",
                  borderRadius: "4px",
                  transition: "width 0.3s",
                }} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Message feedback */}
      {message && (
        <div style={{
          background: message.type === "error" ? "rgba(239,68,68,0.15)" : "rgba(34,197,94,0.15)",
          border: `0.5px solid ${message.type === "error" ? "rgba(239,68,68,0.4)" : "rgba(34,197,94,0.4)"}`,
          borderRadius: "10px",
          padding: "12px 16px",
          marginBottom: "24px",
          fontSize: "14px",
          color: message.type === "error" ? "#fca5a5" : "#86efac",
        }}>
          {message.text}
        </div>
      )}

      {/* Changer de plan */}
      <h2 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "16px", color: "rgba(255,255,255,0.7)" }}>
        Changer de plan
      </h2>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {PLANS.map((plan) => {
          const estActuel = plan.id === subscription?.plan_id;
          return (
            <div key={plan.id} style={{
              background: estActuel ? "rgba(251,191,36,0.08)" : "rgba(255,255,255,0.05)",
              border: estActuel ? "0.5px solid rgba(251,191,36,0.4)" : "0.5px solid rgba(255,255,255,0.1)",
              borderRadius: "12px",
              padding: "16px 20px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "12px",
              flexWrap: "wrap",
            }}>
              <div>
                <span style={{ fontWeight: 600 }}>{plan.emoji} {plan.nom}</span>
                <span style={{ color: "rgba(255,255,255,0.45)", fontSize: "13px", marginLeft: "10px" }}>
                  {plan.limite ? `jusqu'à ${plan.limite} membres` : "Illimité"}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{ color: "#fbbf24", fontWeight: 700 }}>{plan.prix}</span>
                {estActuel ? (
                  <span style={{
                    background: "rgba(251,191,36,0.2)",
                    color: "#fbbf24",
                    padding: "5px 14px",
                    borderRadius: "8px",
                    fontSize: "13px",
                    fontWeight: 600,
                  }}>
                    Actuel
                  </span>
                ) : (
                  <button
                    onClick={() => changerPlan(plan.id)}
                    disabled={upgrading}
                    style={{
                      background: "#fff",
                      color: "#333699",
                      border: "none",
                      padding: "6px 16px",
                      borderRadius: "8px",
                      fontWeight: 600,
                      fontSize: "13px",
                      cursor: upgrading ? "not-allowed" : "pointer",
                      opacity: upgrading ? 0.6 : 1,
                    }}
                  >
                    {upgrading ? "..." : "Choisir"}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Renouvellement */}
      {subscription?.current_period_end && (
        <p style={{ marginTop: "28px", fontSize: "13px", color: "rgba(255,255,255,0.35)", textAlign: "center" }}>
          Prochain renouvellement :{" "}
          {new Date(subscription.current_period_end).toLocaleDateString("fr-FR")}
        </p>
      )}
    </div>
  );
}
