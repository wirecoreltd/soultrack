// pages/api/paypal/create-order.js

import {
  createPayPalOrder,
  createPayPalSubscription,
  PAYPAL_PLAN_IDS,
} from "../../../lib/paypal";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const RECURRING_PLANS = [];

const PLAN_NOMS = {
  starter:    "Croissance",
  vision:     "Vision",
  expansion:  "Expansion",
  enterprise: "Réseaux",
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { egliseId, planId } = req.body;
    console.log("🔥 PAYPAL CREATE ORDER:", { egliseId, planId });

    if (!egliseId || !planId) {
      return res.status(400).json({ error: "Paramètres manquants" });
    }

    // Récupère l'email de l'église
    const { data: eglise, error } = await supabaseAdmin
      .from("eglises")
      .select("email")
      .eq("id", egliseId)
      .maybeSingle();

    if (error) {
      console.error("SUPABASE ERROR:", error);
      return res.status(500).json({ error: "DB error" });
    }

    // Un plan est récurrent si : il est dans RECURRING_PLANS ET a un PAYPAL_PLAN_ID configuré
    const isRecurring =
      RECURRING_PLANS.includes(planId) && !!PAYPAL_PLAN_IDS?.[planId];

    // ── SUBSCRIPTION RÉCURRENTE ────────────────────────────────────────────────
    if (isRecurring) {
      const subscription = await createPayPalSubscription({
        planId,
        egliseId,
        email: eglise?.email || "",
      });

      const approvalUrl = subscription?.links?.find(
        (l) => l.rel === "approve"
      )?.href;

      if (!approvalUrl) {
        throw new Error("Aucune URL d'approbation PayPal reçue");
      }

      return res.status(200).json({
        type: "subscription",
        approvalUrl,
        id: subscription.id,
      });
    }

    // ── PAIEMENT UNIQUE ────────────────────────────────────────────────────────
    const order = await createPayPalOrder({
      planId,
      planNom: PLAN_NOMS[planId] || planId,
      egliseId,
    });

    return res.status(200).json({
      type: "order",
      orderId: order.id,
    });

  } catch (err) {
    console.error("🔥 PAYPAL ERROR:", err);
    return res.status(500).json({
      error: err.message || "Internal error",
    });
  }
}
