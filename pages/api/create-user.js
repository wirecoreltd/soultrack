// ✅ /pages/api/create-user.js

import supabaseAdmin from "../../lib/supabaseAdmin";


export default async function handler(req, res) {
  console.log("📥 Body reçu :", req.body);

  try {
    if (req.method !== "POST") {
      console.log("❌ Mauvaise méthode :", req.method);
      return res.status(405).json({ error: "Méthode non autorisée" });
    }

    const { prenom, nom, email, telephone, role, password } = req.body;
    console.log("🔹 Création utilisateur :", { prenom, nom, email, role });

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError) {
      console.error("❌ Erreur Auth :", authError);
      return res.status(400).json({ error: authError.message });
    }

    const userId = authData?.user?.id;
    console.log("✅ User ID créé :", userId);

    return res.status(200).json({ message: "✅ Utilisateur créé !" });

  } catch (err) {
    console.error("❌ Erreur serveur :", err);
    return res.status(500).json({ error: err.message || "Erreur serveur inconnue" });
  }
}

