// pages/api/create-user.js
import bcrypt from "bcryptjs";
import supabase from "../../lib/supabaseClient";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  try {
    // ================== AUTHENTIFICATION ==================
    const { user } = await supabase.auth.getUserByCookie(req);
    if (!user) return res.status(401).json({ error: "Non authentifié" });

    // ================== RÉCUPÉRATION DES DONNÉES ==================
    const {
      prenom,
      nom,
      email,
      password,
      role,
      telephone,
      cellule_nom,
      cellule_zone,
    } = req.body;

    if (!prenom || !nom || !email || !password || !role) {
      return res.status(400).json({ error: "Champs obligatoires manquants" });
    }

    // ================== HASH DU MOT DE PASSE ==================
    const hashedPassword = await bcrypt.hash(password, 10);

    // ================== RÉCUPÉRATION EGLISE ET BRANCHE ==================
    const { data: currentUserData, error: currentUserError } = await supabase
      .from("profiles")
      .select("eglise_id, branche_id")
      .eq("id", user.id)
      .single();

    if (currentUserError || !currentUserData) {
      return res.status(400).json({ error: "Impossible de récupérer l'église/branche" });
    }

    const eglise_id = currentUserData.eglise_id;
    const branche_id = currentUserData.branche_id;

    // ================== INSERTION UTILISATEUR ==================
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

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ user: newUser });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}
