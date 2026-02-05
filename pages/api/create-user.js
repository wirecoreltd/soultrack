import supabase from "../../lib/supabaseClient";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const {
    prenom, nom, email, password, telephone, role,
    cellule_nom, cellule_zone, creatorId
  } = req.body;

  if (!prenom || !nom || !email || !password || !role || !creatorId) {
    return res.status(400).json({ error: "Champs obligatoires manquants" });
  }

  try {
    // 🔹 récupérer l'utilisateur créateur pour eglise_id et branche_id
    const { data: creator, error: errCreator } = await supabase
      .from("profiles")
      .select("eglise_id, branche_id")
      .eq("id", creatorId)
      .single();

    if (errCreator || !creator) {
      return res.status(400).json({ error: "Impossible de récupérer l'utilisateur créateur" });
    }

    const { data, error } = await supabase.from("profiles").insert([{
      prenom,
      nom,
      email,
      password, // 🔹 tu peux hasher ici si nécessaire
      telephone,
      role_description: role,
      cellule_nom: cellule_nom || null,
      cellule_zone: cellule_zone || null,
      eglise_id: creator.eglise_id,
      branche_id: creator.branche_id,
      creator_id: creatorId
    }]).select().single();

    if (error) throw error;

    return res.status(200).json({ data });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}
