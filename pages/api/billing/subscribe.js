// pages/api/billing/subscribe.ts

import type { NextApiRequest, NextApiResponse } from "next";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { addMonths } from "date-fns";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const supabase = createServerSupabaseClient({ req, res });
  const { eglise_id, plan_id } = req.body;

  if (!eglise_id || !plan_id) {
    return res.status(400).json({ error: "Paramètres manquants" });
  }

  // Vérifier que le plan existe
  const { data: plan, error: planError } = await supabase
    .from("plans")
    .select("*")
    .eq("id", plan_id)
    .single();

  if (planError || !plan) {
    return res.status(404).json({ error: "Plan introuvable" });
  }

  // Créer l'abonnement
  const { error } = await supabase.from("subscriptions").insert({
    eglise_id,
    plan_id,
    statut: "active",
    current_period_start: new Date().toISOString(),
    current_period_end: addMonths(new Date(), 1).toISOString(),
  });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  // Logger l'événement
  await supabase.from("subscription_events").insert({
    eglise_id,
    event_type: "created",
    plan_from: null,
    plan_to: plan_id,
  });

  return res.status(200).json({ success: true });
}
