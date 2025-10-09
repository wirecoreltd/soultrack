// pages/api/create-user.js
import supabase from "../../lib/supabaseClient";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Méthode non autorisée" });

  const { username, email, nomComplet, role, password } = req.body;

  if (!username || !email || !nomComplet || !role || !password) {
    return res.status(400).json({ error: "Tous les champs sont obligatoires !" });
  }

  try {
    // 🔹 Créer utilisateur via Supabase Auth admin
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError) throw authError;
    const userId = authData.id;

    // 🔹 Ajouter profil
    const { error: profileError } = await supabase.from("profiles").insert([{
      id: userId,
      username,
      email,
      role,
      responsable: nomComplet,
      access_pages: JSON.stringify(getAccessPages(role)),
    }]);

    if (profileError) throw profileError;

    res.status(200).json({ message: "Utilisateur créé avec succès !" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "Erreur serveur" });
  }
}

function getAccessPages(role) {
  switch (role) {
    case "ResponsableCelluleCpe": return ["/suivis-membres"];
    case "ResponsableCellule": return ["/membres"];
    case "ResponsableEvangelisation": return ["/evangelisation"];
    case "Admin": return ["/admin/creation-utilisateur", "/suivis-membres", "/membres"];
    default: return [];
  }
}
