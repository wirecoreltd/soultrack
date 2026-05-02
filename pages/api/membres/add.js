// pages/api/membres/add.js
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const PLAN_LIMITES = {
  free:       50,
  starter:    200,
  vision:     500,
  expansion:  1500,
  enterprise: null, // illimité
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  const { memberData } = req.body;

  if (!memberData || !memberData.eglise_id) {
    return res.status(400).json({ error: "memberData et eglise_id sont requis" });
  }

  const eglise_id = memberData.eglise_id;

  try {
    // ── 1. Récupérer le plan de l'église ──────────────────────────────────
    const { data: sub, error: subError } = await supabaseAdmin
      .from("subscriptions")
      .select("plan_id")
      .eq("eglise_id", eglise_id)
      .maybeSingle();

    if (subError) {
      console.error("Erreur lecture subscription:", subError);
      return res.status(500).json({ error: "Impossible de vérifier l'abonnement." });
    }

    const planId = sub?.plan_id ?? "free";
    const limite = PLAN_LIMITES[planId] ?? 50;

    // ── 2. Vérifier la limite (sauf enterprise) ───────────────────────────
    if (limite !== null) {
      const { count, error: countError } = await supabaseAdmin
        .from("membres_complets")
        .select("*", { count: "exact", head: true })
        .eq("eglise_id", eglise_id)
        .is("raison_supprime", null);

      if (countError) {
        console.error("Erreur comptage membres:", countError);
        return res.status(500).json({ error: "Impossible de compter les membres." });
      }

      if (count >= limite) {
        const nomPlan = planId.charAt(0).toUpperCase() + planId.slice(1);
        return res.status(403).json({
          error: "limite_atteinte",
          message: `Limite atteinte — votre plan ${nomPlan} est limité à ${limite} membres. Passez au plan supérieur pour continuer.`,
          count,
          limite,
          plan_id: planId,
        });
      }
    }

    // ── 3. Insérer le membre ──────────────────────────────────────────────
    const { besoinLibre, ...dataClean } = memberData; // retirer le champ UI s'il traîne

    const { data: newMember, error: insertError } = await supabaseAdmin
      .from("membres_complets")
      .insert([dataClean])
      .select()
      .single();

    if (insertError) {
      console.error("Erreur insertion membre:", insertError);
      return res.status(400).json({ error: insertError.message });
    }

    return res.status(200).json({ message: "Membre ajouté avec succès", membre: newMember });

  } catch (err) {
    console.error("Erreur serveur:", err);
    return res.status(500).json({ error: err.message });
  }
}
