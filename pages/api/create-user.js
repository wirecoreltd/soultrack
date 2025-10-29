// ✅ /pages/api/create-user.js
import supabaseAdmin from "../../lib/supabaseAdmin";

export default async function handler(req, res) {
  // 🔒 Autorise uniquement les requêtes POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  try {
    const { prenom, nom, email, telephone, role, password } = req.body;

    if (!prenom || !nom || !email || !password || !role) {
      return res.status(400).json({ error: "Tous les champs sont obligatoires !" });
    }

    // ✅ Étape 1 : Créer l'utilisateur dans Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // active directement le compte
    });

    if (authError) {
      console.error("Erreur Auth:", authError);
      throw authError;
    }

    const userId = authData?.user?.id;
    if (!userId) {
      throw new Error("Impossible de récupérer l'ID utilisateur depuis Supabase Auth");
    }

    // ✅ Étape 2 : Créer le profil associé
    const { error: profileError } = await supabaseAdmin.from("profiles").insert([
      {
        id: userId,
        prenom,
        nom,
        email,
        telephone,
        role,
        roles: [role], // pour compatibilité future (multi-rôles)
        created_at: new Date().toISOString(),
      },
    ]);

    if (profileError) {
      console.error("Erreur lors de l'insertion du profil:", profileError);
      throw profileError;
    }

    // ✅ Tout s’est bien passé
    return res.status(200).json({ message: "✅ Utilisateur créé avec succès !" });
  } catch (err) {
    console.error("Erreur création utilisateur :", err);
    return res.status(500).json({ error: err.message || "Erreur serveur" });
  }
}
