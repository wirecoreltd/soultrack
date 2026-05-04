// lib/checkLimite.js
import supabase from "./supabaseClient";

export async function checkLimiteAtteinte(eglise_id) {
  // 1. Récupérer le plan et sa limite
  const { data: sub } = await supabase
    .from("subscriptions")
    .select("plan_id")
    .eq("eglise_id", eglise_id)
    .maybeSingle();

  if (!sub) return { atteinte: false }; // pas de subscription = pas de limite

  const { data: plan } = await supabase
    .from("plans")
    .select("limite_membres")
    .eq("id", sub.plan_id)
    .maybeSingle();

  if (!plan || plan.limite_membres === null) return { atteinte: false }; // illimité

  // 2. Compter les membres actifs
  const { count } = await supabase
    .from("membres_complets")
    .select("*", { count: "exact", head: true })
    .eq("eglise_id", eglise_id)
    .neq("etat_contact", "supprime");

  const atteinte = count >= plan.limite_membres;

  return {
    atteinte,
    count,
    limite: plan.limite_membres,
  };
}
