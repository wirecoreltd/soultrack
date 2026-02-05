// pages/api/create-user.js
import bcrypt from "bcryptjs";
import supabase from "../../lib/supabaseClient";

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
      role,
      telephone,
      cellule_nom,
      cellule_zone,
      creatorId, // 🔹 ID de l'utilisateur qui crée le nouveau compte
    } = req.body;

    if (!prenom || !nom || !email || !password || !role || !creatorId) {
      return res.status(400).json({ error: "Champs obligatoires manquants" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // 🔹 On récupère automatiquement eglise_id et branche_id depuis le créateur
    const { data: creatorData, error: creatorError } = await supabase
      .from("profiles")
      .select("eglise_id, branche_id")
      .eq("id", creatorId)
      .single();

    if (creatorError || !creatorData) {
      return res.status(400).json({ error: "Impossible de récupérer l'église/branche" });
    }

    const eglise_id = creatorData.eglise_id;
    const branche_id = creatorData.branche_id;

    // 🔹 Création du nouvel utilisateur
    const { data: newUser, error } = await supabase
      .from("profiles")
      .insert([
        {
          prenom,
          nom,
          email,
          password: hashedPassword,
          role_description: role,
          telephone: telephone || null,
          cellule_nom: cellule_nom || null,
          cellule_zone: cellule_zone || null,
          eglise_id,
          branche_id,
        },
      ])
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });

    return res.status(200).json({ user: newUser });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}
