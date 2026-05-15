// pages/api/paypal/create-order.js
// Crée un order PayPal (paiement unique) ou un abonnement récurrent

import { createPayPalOrder, createPayPalSubscription, PAYPAL_PLAN_IDS } from "../../../lib/paypal";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Plans qui utilisent l'abonnement récurrent PayPal
const RECURRING_PLANS = ["starter", "vision", "expansion"];

const PLAN_NOMS = {
  starter:    "Croissance",
  vision:     "Vision",
  expansion:  "Expansion",
  enterprise: "Réseaux",
};

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { egliseId, planId } = req.body;
  if (!egliseId || !planId) return res.status(400).json({ error: "Paramètres manquants" });

  try {
    const { data: eglise } = await supabaseAdmin
      .from("eglises")
      .select("email")
      .eq("id", egliseId)
      .single();

    const isRecurring = RECURRING_PLANS.includes(planId) && !!PAYPAL_PLAN_IDS[planId];

    if (isRecurring) {
      // Abonnement récurrent PayPal
      const subscription = await createPayPalSubscription({
        planId,
        egliseId,
        email: eglise?.email ?? "",
      });

      // L'URL d'approbation est dans les liens
      const approvalLink = subscription.links?.find((l) => l.rel === "approve")?.href;
      return res.status(200).json({ type: "subscription", approvalUrl: approvalLink, id: subscription.id });

    } else {
      // Paiement unique
      const order = await createPayPalOrder({
        planId,
        planNom: PLAN_NOMS[planId] ?? planId,
        egliseId,
      });

      return res.status(200).json({ type: "order", orderId: order.id });
    }

  } catch (err) {
    console.error("[paypal/create-order]", err);
    return res.status(500).json({ error: err.message });
  }
}
