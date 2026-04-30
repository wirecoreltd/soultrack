// app/api/billing/upgrade/route.ts

import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { addMonths } from "date-fns";

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { eglise_id, new_plan_id } = await req.json();

  // 1. Récupérer abonnement actuel
  const { data: sub } = await supabase
    .from("subscriptions")
    .select("*, plans(*)")
    .eq("eglise_id", eglise_id)
    .single();

  if (!sub) {
    return NextResponse.json({ error: "Abonnement introuvable" }, { status: 404 });
  }

  // 2. Récupérer le nouveau plan
  const { data: newPlan } = await supabase
    .from("plans")
    .select("*")
    .eq("id", new_plan_id)
    .single();

  if (!newPlan) {
    return NextResponse.json({ error: "Plan introuvable" }, { status: 404 });
  }

  // 3. Vérifier downgrade : compter les membres actuels
  if (newPlan.limite_membres !== null) {
    const { count } = await supabase
      .from("membres_complets")
      .select("*", { count: "exact", head: true })
      .eq("eglise_id", eglise_id)
      .is("raison_supprime", null);

    if (count && count > newPlan.limite_membres) {
      return NextResponse.json({
        error: "DOWNGRADE_BLOCKED",
        message: `Vous avez ${count} membres, la limite du plan est ${newPlan.limite_membres}.`,
      }, { status: 400 });
    }
  }

  // 4. Mettre à jour l'abonnement
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
  const oldPlanOrder = ["free","starter","vision","expansion","enterprise"];
  const eventType = oldPlanOrder.indexOf(new_plan_id) > oldPlanOrder.indexOf(sub.plan_id)
    ? "upgraded" : "downgraded";

  await supabase.from("subscription_events").insert({
    eglise_id,
    event_type: eventType,
    plan_from: sub.plan_id,
    plan_to: new_plan_id,
  });

  return NextResponse.json({ success: true });
}
