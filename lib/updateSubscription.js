// lib/updateSubscription.js
// Utilitaire partagé entre les webhooks Paddle et PayPal
// Met à jour la table subscriptions dans Supabase + envoie l'email de confirmation

import { createClient } from "@supabase/supabase-js";
import { sendConfirmationEmail } from "./sendConfirmationEmail";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const PLAN_DETAILS = {
  free:       { nom: "Départ",     prix: "Gratuit" },
  starter:    { nom: "Croissance", prix: "$19/mois" },
  vision:     { nom: "Vision",     prix: "$39/mois" },
  expansion:  { nom: "Expansion",  prix: "$79/mois" },
  enterprise: { nom: "Réseaux",    prix: "Sur mesure" },
};

/**
 * @param {object} params
 * @param {string} params.egliseId
 * @param {string} params.planId
 * @param {string} params.statut        — "active" | "cancelled" | "past_due"
 * @param {string} params.provider      — "paddle" | "paypal"
 * @param {string|null} params.paddleSubscriptionId
 * @param {string|null} params.paypalSubscriptionId
 * @param {Date|null}   params.periodEnd
 */
export async function updateSubscription({
  egliseId,
  planId,
  statut,
  provider,
  paddleSubscriptionId = null,
  paypalSubscriptionId = null,
  periodEnd = null,
}) {
  const now = new Date();
  const nextMonth = periodEnd ?? new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());

  const updatePayload = {
    plan_id:               planId,
    statut,
    current_period_start:  now.toISOString(),
    current_period_end:    nextMonth.toISOString(),
    updated_at:            now.toISOString(),
    started_at:            now.toISOString(),
    ...(paddleSubscriptionId ? { paddle_subscription_id: paddleSubscriptionId } : {}),
    ...(paypalSubscriptionId ? { paypal_subscription_id: paypalSubscriptionId } : {}),
  };

  const { error, data } = await supabaseAdmin
  .from("subscriptions")
  .update(updatePayload)
  .eq("eglise_id", egliseId)
  .select();

console.log("[updateSubscription] data:", data);
console.log("[updateSubscription] error:", error);

  if (error) {
    console.error("[updateSubscription] Supabase error:", error);
    throw error;
  }

  console.log(`[updateSubscription] eglise ${egliseId} → plan ${planId} (${statut}) via ${provider}`);

  // Envoie l'email de confirmation uniquement quand le plan est activé
  if (statut === "active") {
    const plan = PLAN_DETAILS[planId] ?? { nom: planId, prix: "—" };
    await sendConfirmationEmail({
      egliseId,
      planId,
      planNom:  plan.nom,
      planPrix: plan.prix,
      provider,
    });
  }
}
