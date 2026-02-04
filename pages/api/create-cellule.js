import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  const { nom, zone, responsable_id, responsable_nom, telephone } = req.body;

  if (!nom || !zone || !responsable_id || !responsable_nom || !telephone) {
    return res.status(400).json({ error: "Tous les champs sont obligatoires !" });
  }

  try {
    // 🔥 1. Récupérer l’église et la branche du responsable
    const { data: responsable, error: respError } = await supabaseAdmin
      .from("profiles")
      .select("eglise_id, branche_id")
      .eq("id", responsable_id)
      .single();

    if (respError || !responsable) {
      return res.status(400).json({ error: "Responsable introuvable" });
    }

    // 🔥 2. Insérer la cellule AVEC eglise_id et branche_id
    const { error } = await supabaseAdmin.from("cellules").insert({
      cellule: nom,
      ville: zone,
      responsable: responsable_nom,
      responsable_id,
      telephone,
      eglise_id: responsable.eglise_id,
      branche_id: responsable.branche_id,
      created_at: new Date(),
    });

    if (error) throw error;

    return res.status(200).json({ message: "Cellule créée avec succès ✅" });
  } catch (err) {
    console.error("Erreur création cellule:", err);
    return res.status(500).json({ error: err.message });
  }
}
