// app/api/paypal/create-order/route.js

import {
  createPayPalOrder,
  createPayPalSubscription,
  PAYPAL_PLAN_IDS,
} from "../../../lib/paypal";

import { createClient } from "@supabase/supabase-js";

// Supabase admin
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Plans récurrents
const RECURRING_PLANS = ["starter", "vision", "expansion"];

// Noms des plans
const PLAN_NOMS = {
  starter: "Croissance",
  vision: "Vision",
  expansion: "Expansion",
  enterprise: "Réseaux",
};

// ==============================
// POST handler (App Router)
// ==============================
export async function POST(req) {
  try {
    // 🔥 Parse body
    const { egliseId, planId } = await req.json();

    console.log("🔥 PAYPAL HIT:", { egliseId, planId });

    // 🚨 validation
    if (!egliseId || !planId) {
      return Response.json(
        { error: "Paramètres manquants" },
        { status: 400 }
      );
    }

    // ==============================
    // GET Eglise email
    // ==============================
    const { data: eglise, error } = await supabaseAdmin
      .from("eglises")
      .select("email")
      .eq("id", egliseId)
      .maybeSingle();

    if (error) {
      console.error("❌ Supabase error:", error);
      return Response.json(
        { error: "Erreur Supabase" },
        { status: 500 }
      );
    }

    // ==============================
    // CHECK SUBSCRIPTION
    // ==============================
    const isRecurring =
      RECURRING_PLANS.includes(planId) &&
      !!PAYPAL_PLAN_IDS?.[planId];

    // ==============================
    // SUBSCRIPTION PAYPAL
    // ==============================
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
        return Response.json(
          { error: "Approval URL introuvable" },
          { status: 500 }
        );
      }

      return Response.json({
        type: "subscription",
        approvalUrl,
        id: subscription.id,
      });
    }

    // ==============================
    // ONE-TIME ORDER PAYPAL
    // ==============================
    const order = await createPayPalOrder({
      planId,
      planNom: PLAN_NOMS[planId] || planId,
      egliseId,
    });

    if (!order?.id) {
      return Response.json(
        { error: "Order PayPal invalide" },
        { status: 500 }
      );
    }

    return Response.json({
      type: "order",
      orderId: order.id,
    });

  } catch (err) {
    console.error("🔥 PAYPAL API ERROR:", err);

    return Response.json(
      {
        error: err.message || "Internal Server Error",
      },
      { status: 500 }
    );
  }
}
