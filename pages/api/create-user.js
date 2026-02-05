// pages/api/create-user.js
import supabase from "../../lib/supabaseClient";
import bcrypt from "bcryptjs";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  try {
    const {
      prenom,
      nom,
      email,
      password,
      telephone,
      role,
      cellule_nom,
      cellule_zone,
      eglise_id,
      branche_id,
    } = req.body;

    if (!prenom || !nom || !email || !password || !role) {
      return res.status(400).json({ error: "Champs obligatoires manquants" });
    }

    // ✅ Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer l'utilisateur
    const { data, error } = await supabase
      .from("profiles")  // ou "users" selon ta table
      .insert([
        {
          prenom,
          nom,
          email,
          password: hashedPassword,
          telephone: telephone || null,
          role,
          cellule_nom: role === "ResponsableCellule" ? cellule_nom || null : null,
          cellule_zone: role === "ResponsableCellule" ? cellule_zone || null : null,
          eglise_id: eglise_id || null,
          branche_id: branche_id || null,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ user: data });
  } catch (err) {
    console.error("Server error:", err);
    return res.status(500).json({ error: err.message });
  }
}
