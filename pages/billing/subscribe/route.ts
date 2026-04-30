// app/api/billing/subscribe/route.ts

import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { addMonths } from "date-fns";

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { eglise_id, plan_id } = await req.json();

  if (!eglise_id || !plan_id) {
    return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });
  }

  // Vérifier que le plan existe
  const { data: plan, error: planError } = await supabase
    .from("plans")
    .select("*")
    .eq("id", plan_id)
    .single();

  if (planError || !plan) {
    return NextResponse.json({ error: "Plan introuvable" }, { status: 404 });
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
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Logger l'événement
  await supabase.from("subscription_events").insert({
    eglise_id,
    event_type: "created",
    plan_from: null,
    plan_to: plan_id,
  });

  return NextResponse.json({ success: true });
}
