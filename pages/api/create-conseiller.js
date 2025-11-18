import supabase from "../../lib/supabaseClient";

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Méthode non autorisée" });

  try {
    const { membre_id, email, password, responsable_id } = req.body;

    if (!membre_id || !email || !password || !responsable_id) {
      return res.status(400).json({ error: "Champs manquants" });
    }

    // ➤ Récupère le membre pour prendre nom, prenom, téléphone
    const { data: membre, error: membreError } = await supabase
      .from("membres")
      .select("prenom, nom, telephone")
      .eq("id", membre_id)
      .single();

    if (membreError || !membre) {
      return res.status(400).json({ error: "Membre introuvable" });
    }

    // ➤ Crée l'utilisateur dans Supabase Auth
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError) {
      return res.status(400).json({ error: authError.message });
    }

    // ➤ Insère dans profiles
    const { error: profileError } = await supabase.from("profiles").insert({
      id: authUser.user.id,
      prenom: membre.prenom,
      nom: membre.nom,
      telephone: membre.telephone,
      role: "Conseiller",
      email,
      responsable_id,
      membre_id,
    });

    if (profileError) {
      return res.status(400).json({ error: profileError.message });
    }

    // ➤ Met à jour le membre pour assigner le conseiller
    const { error: membreUpdateError } = await supabase
      .from("membres")
      .update({ conseiller_id: authUser.user.id })
      .eq("id", membre_id);

    if (membreUpdateError) {
      return res.status(400).json({ error: membreUpdateError.message });
    }

    return res.status(200).json({ message: "✅ Conseiller créé avec succès !" });
  } catch (err) {
    console.error("Erreur inattendue:", err);
    return res.status(500).json({ error: err.message });
  }
}
