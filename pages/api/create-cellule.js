// pages/api/create-cellule.js

// pages/api/create-cellule.js
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
    const { error } = await supabaseAdmin.from("cellules").insert({
      cellule: nom,
      ville: zone,
      responsable: responsable_nom,
      responsable_id,
      telephone,
      created_at: new Date(),
    });

    if (error) throw error;

    return res.status(200).json({ message: "Cellule créée avec succès ✅" });
  } catch (err) {
    console.error("Erreur création cellule:", err);
    return res.status(500).json({ error: err.message });
  }
}

