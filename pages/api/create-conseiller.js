import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Méthode non autorisée" });

  try {
    const { prenom, nom, email, password, role, telephone, responsable_id } = req.body;

    // Création utilisateur Auth
    const { data: userData, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (createError) throw createError;
    const user = userData.user;

    // Création profile avec responsable_id
    const { error: profileError } = await supabase.from("profiles").insert({
      id: user.id,
      prenom,
      nom,
      email,
      telephone,
      role,
      responsable_id: responsable_id || null,
    });
    if (profileError) throw profileError;

    return res.status(200).json({ message: "Conseiller créé avec succès" });
  } catch (err) {
    console.error("Erreur création utilisateur:", err);
    return res.status(500).json({ error: err.message });
  }
}
