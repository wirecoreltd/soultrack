// pages/api/billing/subscribe.js
import { createClient } from "@supabase/supabase-js";
import { addMonths } from "date-fns";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  const { userId, plan } = req.body;

  try {
    const now = new Date();
    const expiresAt = addMonths(now, 1);

    const { data, error } = await supabaseAdmin
      .from("subscriptions")
      .upsert([{
        user_id: userId,
        plan,
        status: "active",
        started_at: now.toISOString(),
        expires_at: expiresAt.toISOString(),
      }])
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });

    return res.status(200).json({ message: "Abonnement créé avec succès", subscription: data });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}
