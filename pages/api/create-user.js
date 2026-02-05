// pages/api/create-user.js
import supabase from "../../lib/supabaseClient";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

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

  // ================== Validation simple ==================
  if (!prenom || !nom || !email || !password || !role || !eglise_id || !branche_id) {
    return res.status(400).json({ error: "Champs obligatoires manquants" });
  }

  try {
    // ================== Créer l'utilisateur dans Supabase Auth ==================
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: {
        prenom,
        nom,
        telephone,
        role,
        cellule_nom: cellule_nom || null,
        cellule_zone: cellule_zone || null,
        eglise_id,
        branche_id,
      },
    });

    if (authError) throw authError;

    const userId = authData.user.id;

    // ================== Créer l'entrée dans la table profiles ==================
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .insert([
        {
          id: userId,
          prenom,
          nom,
          email,
          telephone: telephone || null,
          role_description: role,
          cellule_nom: cellule_nom || null,
          cellule_zone: cellule_zone || null,
          eglise_id,
          branche_id,
        },
      ])
      .select()
      .single();

    if (profileError) throw profileError;

    return res.status(200).json({ user: profileData });
  } catch (err) {
    console.error("Erreur création utilisateur :", err);
    return res.status(500).json({ error: err.message });
  }
}
