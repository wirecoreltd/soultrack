// pages/api/create-admin.js
import { createClient } from "@supabase/supabase-js";

// Création du client admin avec SERVICE_ROLE_KEY (jamais exposée côté client)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  const { prenom, nom, email, password } = req.body;

  if (!prenom || !nom || !email || !password) {
    return res.status(400).json({ error: "Champs requis manquants." });
  }

  try {
    // Création utilisateur Auth
    const { data: userData, error: userError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { prenom, nom, role: "Admin" },
      });

    if (userError) throw userError;

    const user = userData.user;

    // Création profil
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .insert([
        {
          id: user.id,
          prenom,
          nom,
          email,
          role: "Admin",
          created_at: new Date(),
        },
      ]);

    if (profileError) throw profileError;

    return res.status(200).json({ message: "Admin créé avec succès ✅" });
  } catch (err) {
    console.error("Erreur création admin:", err);
    return res.status(500).json({ error: err.message });
  }
}
