// pages/api/paddle/create-checkout.js
// Crée une session de paiement Paddle et retourne l'URL de checkout

import { createPaddleTransaction, PADDLE_PRICE_IDS } from "../../../lib/paddle";
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
    // Récupère l'email de l'église
    const { data: eglise } = await supabaseAdmin
      .from("eglises")
      .select("email, paddle_customer_id")
      .eq("id", egliseId)
      .single();

    const transaction = await createPaddleTransaction({
      priceId,
      customerId: eglise?.paddle_customer_id ?? null,
      egliseId,
      planId,
      email: eglise?.email ?? "",
    });

    // L'URL de checkout est dans transaction.data.checkout.url
    const checkoutUrl = transaction?.data?.checkout?.url;
    if (!checkoutUrl) throw new Error("Paddle n'a pas retourné d'URL de checkout");

    return res.status(200).json({ checkoutUrl });
  } catch (err) {
    console.error("[paddle/create-checkout]", err);
    return res.status(500).json({ error: err.message });
  }
}
