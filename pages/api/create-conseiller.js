import { createClient } from "@supabase/supabase-js";

// ❗ Utilisation de la SERVICE ROLE KEY pour créer un utilisateur dans Auth
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Méthode non autorisée" });

  try {
    const { prenom, nom, telephone, email, password, responsable_id } = req.body;

    if (!responsable_id) return res.status(400).json({ error: "Responsable non trouvé" });

    // 1️⃣ Créer l'utilisateur dans Auth
    const { data: userData, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (createError) throw createError;
    const user = userData.user;

    // 2️⃣ Insert dans profiles avec responsable_id
    const { error: profileError } = await supabase.from("profiles").insert({
      id: user.id,
      prenom,
      nom,
      telephone,
      role: "Conseiller",
      email,
      responsable_id,
    });

    if (profileError) throw profileError;

    return res.status(200).json({ message: "Conseiller créé avec succès" });
  } catch (err) {
    console.error("Erreur création conseiller:", err);
    return res.status(500).json({ error: err.message });
  }
}
