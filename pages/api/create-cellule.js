import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") 
    return res.status(405).json({ error: "Méthode non autorisée" });

  try {
    const { cellule, ville, responsable_id } = req.body;

    if (!cellule || !ville || !responsable_id) {
      return res.status(400).json({ error: "Tous les champs sont obligatoires !" });
    }

    // ✅ Vérifier si le responsable existe
    const { data: user, error: userError } = await supabaseAdmin
      .from("profiles")
      .select("id, prenom, nom")
      .eq("id", responsable_id)
      .single();

    if (userError || !user) {
      return res.status(400).json({ error: "Responsable introuvable" });
    }

    // ✅ Créer la cellule
    const { error: insertError } = await supabaseAdmin
      .from("cellules")
      .insert([{
        cellule,
        ville,
        responsable_id,
        responsable: `${user.prenom} ${user.nom}`,
        created_at: new Date().toISOString(),
      }]);

    if (insertError) throw insertError;

    return res.status(200).json({ message: "✅ Cellule créée avec succès !" });

  } catch (err) {
    console.error("Erreur création cellule :", err);
    return res.status(500).json({ error: err.message });
  }
}
