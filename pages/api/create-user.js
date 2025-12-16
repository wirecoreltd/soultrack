import supabaseAdmin from "../../lib/supabaseAdmin";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Méthode non autorisée" });

  try {
    const { prenom, nom, email, password, role, telephone } = req.body;

    if (!prenom || !nom || !email || !password || !role) {
      return res.status(400).json({ error: "Champs obligatoires manquants." });
    }

    // 1️⃣ Création auth
    const { data, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (authError) throw authError;

    const user = data.user;

    // 2️⃣ Création profil
    const { error: profileError } = await supabaseAdmin.from("profiles").insert({
      id: user.id,
      prenom,
      nom,
      email,
      telephone,
      role,
      must_change_password: true,
    });
    if (profileError) throw profileError;

    return res.status(200).json({ message: "Utilisateur créé avec succès", user_id: user.id });
  } catch (err) {
    console.error("Erreur création utilisateur:", err);
    return res.status(500).json({ error: err.message });
  }
}
