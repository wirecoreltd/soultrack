// /pages/api/create-conseiller.js

import supabase from "../../lib/supabaseClient";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { email, password, prenom, nom, telephone, responsable_id } = req.body;

    // ✅ Vérification des champs
    if (!email || !password || !prenom || !nom || !responsable_id) {
      return res.status(400).json({ error: "Champs manquants" });
    }

    // 1️⃣ Créer l'utilisateur dans Supabase Auth
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
    });

    if (authError) {
      console.error("Auth Error:", authError);
      return res.status(400).json({ error: authError.message });
    }

    // 2️⃣ Insérer dans profiles
    const { error: profileError } = await supabase
      .from("profiles")
      .insert([{
        id: authUser.user.id,   // ID généré par Auth
        email,
        prenom,
        nom,
        telephone,
        role: "Conseiller",
        responsable_id,
      }]);

    if (profileError) {
      console.error("Profile Error:", profileError);
      return res.status(400).json({ error: profileError.message });
    }

    return res.status(200).json({ message: "✅ Conseiller créé avec succès !" });

  } catch (err) {
    console.error("Unexpected Error:", err);
    return res.status(500).json({ error: err.message });
  }
}

