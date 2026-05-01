// pages/api/billing/upgrade.js
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  const { eglise_id, new_plan_id } = req.body;

  // Log pour débugger
  console.log("upgrade called with:", { eglise_id, new_plan_id });

  if (!eglise_id || !new_plan_id) {
    return res.status(400).json({ error: "eglise_id et new_plan_id sont requis" });
  }

  try {
    // Vérifier si un abonnement existe déjà
    const { data: existing } = await supabaseAdmin
      .from("subscriptions")
      .select("id")
      .eq("eglise_id", eglise_id)
      .maybeSingle();

    let data, error;

    if (existing) {
      // Mettre à jour l'abonnement existant
      ({ data, error } = await supabaseAdmin
  .from("subscriptions")
  .update({
    plan_id: new_plan_id,
    statut: "active",           // ← statut, pas status
    current_period_start: new Date().toISOString(),
    current_period_end: new_plan_id === "free"
      ? new Date(new Date().setFullYear(new Date().getFullYear() + 10)).toISOString()
      : new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString(),
    updated_at: new Date().toISOString(),
  })
  .eq("eglise_id", eglise_id)
  .select()
  .single());
      
    } else {
      // Créer un nouvel abonnement si inexistant
     ({ data, error } = await supabaseAdmin
  .from("subscriptions")
  .insert([{
    eglise_id,
    plan_id: new_plan_id,
    statut: "active",           // ← statut, pas status
    current_period_start: new Date().toISOString(),
    current_period_end: new_plan_id === "free"
      ? new Date(new Date().setFullYear(new Date().getFullYear() + 10)).toISOString()
      : new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString(),
  }])
  .select()
  .single());
    }

    if (error) {
      console.error("Supabase error:", error);
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json({ message: "Plan mis à jour", subscription: data });

  } catch (err) {
    console.error("Server error:", err);
    return res.status(500).json({ error: err.message });
  }
}
