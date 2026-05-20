// pages/api/paypal/create-order.js
// Crée un order PayPal (paiement unique) ou un abonnement récurrent

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

// Plans abonnement
const RECURRING_PLANS = ["starter", "vision", "expansion"];

const PLAN_NOMS = {
  starter: "Croissance",
  vision: "Vision",
  expansion: "Expansion",
  enterprise: "Réseaux",
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // 🔥 DEBUG SAFE (IMPORTANT)
    console.log("🔥 PAYPAL CREATE ORDER HIT");
    console.log("BODY RAW:", req.body);

    const { egliseId, planId } = req.body || {};

    if (!egliseId || !planId) {
      console.error("❌ Missing params:", { egliseId, planId });
      return res.status(400).json({
        error: "Paramètres manquants (egliseId ou planId)",
      });
    }

    // 🔥 FETCH Eglise email
    const { data: eglise, error: egliseError } = await supabaseAdmin
      .from("eglises")
      .select("email")
      .eq("id", egliseId)
      .single();

    if (egliseError) {
      console.error("❌ Supabase error:", egliseError);
      return res.status(500).json({
        error: "Erreur récupération église",
      });
    }

    const isRecurring =
      RECURRING_PLANS.includes(planId) &&
      !!PAYPAL_PLAN_IDS?.[planId];

    // =========================
    // 🔁 SUBSCRIPTION PAYPAL
    // =========================
    if (isRecurring) {
      console.log("🔁 Creating subscription:", planId);

      const subscription = await createPayPalSubscription({
        planId,
        egliseId,
        email: eglise?.email || "",
      });

      const approvalLink = subscription?.links?.find(
        (l) => l.rel === "approve"
      )?.href;

      if (!approvalLink) {
        console.error("❌ No approval link:", subscription);
        return res.status(500).json({
          error: "PayPal subscription approval link missing",
        });
      }

      return res.status(200).json({
        type: "subscription",
        approvalUrl: approvalLink,
        id: subscription.id,
      });
    }

    // =========================
    // 💳 ORDER PAYPAL (ONE TIME)
    // =========================
    console.log("💳 Creating order:", planId);

    const order = await createPayPalOrder({
      planId,
      planNom: PLAN_NOMS[planId] ?? planId,
      egliseId,
    });

    if (!order || !order.id) {
      console.error("❌ Invalid order response:", order);
      return res.status(500).json({
        error: "Order PayPal invalide",
      });
    }

    return res.status(200).json({
      type: "order",
      orderId: order.id,
    });
  } catch (err) {
    // 🔥 IMPORTANT DEBUG
    console.error("🔥 PAYPAL CREATE ORDER ERROR FULL:", err);

    return res.status(500).json({
      error: err.message || "Internal server error",
    });
  }
}
