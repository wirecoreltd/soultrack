// pages/api/billing/upgrade.ts

import type { NextApiRequest, NextApiResponse } from "next";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { addMonths } from "date-fns";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const supabase = createServerSupabaseClient({ req, res });
  const { eglise_id, new_plan_id } = req.body;

  // 1. Abonnement actuel
  const { data: sub } = await supabase
    .from("subscriptions")
    .select("*, plans(*)")
    .eq("eglise_id", eglise_id)
    .single();

  if (!sub) {
    return res.status(404).json({ error: "Abonnement introuvable" });
  }

  // 2. Nouveau plan
  const { data: newPlan } = await supabase
    .from("plans")
    .select("*")
    .eq("id", new_plan_id)
    .single();

  if (!newPlan) {
    return res.status(404).json({ error: "Plan introuvable" });
  }

  // 3. Bloquer downgrade si trop de membres
  if (newPlan.limite_membres !== null) {
    const { count } = await supabase
      .from("membres_complets")
      .select("*", { count: "exact", head: true })
      .eq("eglise_id", eglise_id)
      .is("raison_supprime", null);

    if (count && count > newPlan.limite_membres) {
      return res.status(400).json({
        error: "DOWNGRADE_BLOCKED",
        message: `Vous avez ${count} membres actifs. La limite du plan "${newPlan.nom}" est ${newPlan.limite_membres}.`,
      });
    }
  }

  // 4. Mettre à jour
  await supabase
    .from("subscriptions")
    .update({
      plan_id: new_plan_id,
      current_period_start: new Date().toISOString(),
      current_period_end: addMonths(new Date(), 1).toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("eglise_id", eglise_id);

  // 5. Logger
  const ordre = ["free", "starter", "vision", "expansion", "enterprise"];
  const eventType =
    ordre.indexOf(new_plan_id) > ordre.indexOf(sub.plan_id)
      ? "upgraded"
      : "downgraded";

  await supabase.from("subscription_events").insert({
    eglise_id,
    event_type: eventType,
    plan_from: sub.plan_id,
    plan_to: new_plan_id,
  });

  return res.status(200).json({ success: true });
}
