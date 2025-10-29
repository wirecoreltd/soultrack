// ✅ /pages/api/create-user.js

import supabaseAdmin from "../../lib/supabaseAdmin";

export default async function handler(req, res) {
  try {
    // 🔒 On autorise uniquement les requêtes POST
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Méthode non autorisée" });
    }

    const { prenom, nom, email, telephone, role, password } = req.body;

    if (!prenom || !nom || !email || !password || !role) {
      return res.status(400).json({ error: "Tous les champs sont obligatoires !" });
    }

    // ✅ Étape 1 — Création de l'utilisateur dans Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError) {
      console.error("❌ Erreur Auth:", authError);
      return res.status(400).json({ error: authError.message });
    }

    const userId = authData?.user?.id;
    if (!userId) {
      return res.status(500).json({ error: "Impossible de récupérer l'ID utilisateur" });
    }

    // ✅ Étape 2 — Insertion dans la table profiles
    const { error: profileError } = await supabaseAdmin.from("profiles").insert([
      {
        id: userId,
        prenom,
        nom,
        email,
        telephone,
        role,
        roles: [role],
        created_at: new Date().toISOString(),
      },
    ]);

    if (profileError) {
      console.error("❌ Erreur Profile:", profileError);
      return res.status(400).json({ error: profileError.message });
    }

    console.log("✅ Utilisateur créé:", email);
    return res.status(200).json({ message: "✅ Utilisateur créé avec succès !" });

  } catch (err) {
    console.error("❌ Erreur serveur:", err);
    // ⚠️ Toujours renvoyer une réponse JSON
    return res.status(500).json({ error: err.message || "Erreur serveur inconnue" });
  }
}
