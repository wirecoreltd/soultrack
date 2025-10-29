// ✅ pages/api/create-user.js

import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Clé Service Role pour créer des users
);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Méthode non autorisée" });

  const { prenom, nom, email, telephone, password, role } = req.body;

  if (!prenom || !nom || !email || !password || !role) {
    return res.status(400).json({ error: "Champs requis manquants." });
  }

  try {
    // 🔹 Créer l’utilisateur dans Supabase Auth
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { prenom, nom, telephone, role },
    });

    if (userError) throw userError;
    const user = userData.user;

    // 🔹 Enregistrer dans la table profiles
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .insert([
        {
          id: user.id,
          prenom,
          nom,
          email,
          telephone,
          role,
          created_at: new Date(),
        },
      ]);

    if (profileError) throw profileError;

    return res.status(200).json({ message: "Utilisateur créé avec succès ✅" });
  } catch (error) {
    console.error("Erreur création utilisateur:", error);
    return res.status(500).json({ error: error.message });
  }
}
