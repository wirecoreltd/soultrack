import supabaseAdmin from "../../lib/supabaseAdmin";

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Méthode non autorisée" });

  try {
    const { prenom, nom, email, password, role, telephone, responsable_id } = req.body;

    // 🌟 Création utilisateur ADMIN
    const { data: userData, error: createError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

    if (createError) throw createError;
    const user = userData.user;

    // 🌟 Insert profile via ADMIN (ignore RLS)
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .insert({
        id: user.id,
        prenom,
        nom,
        telephone,
        role,
        email,
        responsable_id: responsable_id || null,
      });

    if (profileError) throw profileError;

    return res.status(200).json({ message: "Utilisateur créé avec succès" });
  } catch (err) {
    console.error("Erreur création utilisateur:", err);
    return res.status(500).json({ error: err.message });
  }
}
