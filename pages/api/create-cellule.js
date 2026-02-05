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
      branche_id,
    } = req.body;

    if (
      !nom ||
      !zone ||
      !responsable_id ||
      !responsable_nom ||
      !eglise_id ||
      !branche_id
    ) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const { error } = await supabaseAdmin.from("cellules").insert({
      cellule: nom,
      ville: zone,
      responsable: responsable_nom,
      responsable_id,
      telephone,
      eglise_id,
      branche_id,
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
