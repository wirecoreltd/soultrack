// pages/api/paddle/create-checkout.js
import { PADDLE_PRICE_IDS } from "../../../lib/paddle";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { egliseId, planId } = req.body;

  if (!egliseId || !planId) {
    return res.status(400).json({ error: "egliseId et planId sont requis" });
  }

  const priceId = PADDLE_PRICE_IDS[planId];
  if (!priceId) {
    return res.status(400).json({ error: "Ce plan ne nécessite pas de paiement Paddle" });
  }

  try {
    const { data: eglise } = await supabaseAdmin
      .from("eglises")
      .select("paddle_customer_id")
      .eq("id", egliseId)
      .single();
    
    // Email depuis profiles
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("email")
      .eq("eglise_id", egliseId)
      .single();
    
    return res.status(200).json({
      priceId,
      email: profile?.email ?? "",
      customerId: eglise?.paddle_customer_id ?? null,
    });
        
  } catch (err) {
    console.error("[paddle/create-checkout]", err);
    return res.status(500).json({ error: err.message });
  }
}
