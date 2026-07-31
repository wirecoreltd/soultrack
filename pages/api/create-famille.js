import { createClient } from "@supabase/supabase-js";
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  try {
    const {
      nom,
      zone,
      responsable_id,
      responsable_nom,
      telephone,
      eglise_id,
      superviseur_id,
      famille_mere_id,
    } = req.body;
    if (!nom || !zone || !responsable_id || !responsable_nom || !eglise_id) {
      return res.status(400).json({ error: "Missing fields" });
    }

    let finalSuperviseurId = superviseur_id || null;
    if (famille_mere_id && !finalSuperviseurId) {
      const { data: familleMere } = await supabaseAdmin
        .from("familles")
        .select("responsable_id")
        .eq("id", famille_mere_id)
        .single();
      if (familleMere?.responsable_id) {
        finalSuperviseurId = familleMere.responsable_id;
      }
    }

    const { error } = await supabaseAdmin.from("familles").insert({
      famille: nom,
      ville: zone,
      responsable: responsable_nom,
      responsable_id,
      telephone,
      eglise_id,
      famille_mere_id: famille_mere_id || null,
      superviseur_id: finalSuperviseurId,
      created_at: new Date(),
    });
    if (error) {
      console.error("Insert error:", error);
      return res.status(500).json({ error: error.message });
    }
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Server error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
