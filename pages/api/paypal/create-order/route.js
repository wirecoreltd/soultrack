import {
  createPayPalOrder,
  createPayPalSubscription,
  PAYPAL_PLAN_IDS,
} from "@/lib/paypal";

import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const RECURRING_PLANS = ["starter", "vision", "expansion"];

const PLAN_NOMS = {
  starter: "Croissance",
  vision: "Vision",
  expansion: "Expansion",
  enterprise: "Réseaux",
};

export async function POST(req) {
  try {
    const { egliseId, planId } = await req.json();

    console.log("🔥 PAYPAL HIT:", { egliseId, planId });

    const { data: eglise } = await supabaseAdmin
      .from("eglises")
      .select("email")
      .eq("id", egliseId)
      .maybeSingle();

    const isRecurring =
      RECURRING_PLANS.includes(planId) &&
      !!PAYPAL_PLAN_IDS?.[planId];

    if (isRecurring) {
      const subscription = await createPayPalSubscription({
        planId,
        egliseId,
        email: eglise?.email || "",
      });

      const approvalUrl = subscription.links?.find(
        (l) => l.rel === "approve"
      )?.href;

      return Response.json({
        type: "subscription",
        approvalUrl,
        id: subscription.id,
      });
    }

    const order = await createPayPalOrder({
      planId,
      planNom: PLAN_NOMS[planId],
      egliseId,
    });

    return Response.json({
      type: "order",
      orderId: order.id,
    });
  } catch (err) {
    console.error("🔥 API ERROR:", err);

    return Response.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
