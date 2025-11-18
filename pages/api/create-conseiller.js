import supabase from "../../lib/supabaseClient";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { membre_id, email, password, responsable_id } = req.body;

    if (!membre_id || !email || !password || !responsable_id) {
      return res.status(400).json({ error: "Champs manquants" });
    }

    // ➤ Créer l'utilisateur dans Supabase Auth
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
    });

    if (authError) {
      console.error("Auth Error:", authError);
      return res.status(400).json({ error: authError.message });
    }

    // ➤ Insérer dans profiles
    const { error: profileError } = await supabase
      .from("profiles")
      .insert([{
        id: authUser.user.id,
        email,
        role: "Conseiller",
        responsable_id,
        membre_id,
      }]);

    if (profileError) {
      console.error("Profile Error:", profileError);
      return res.status(400).json({ error: profileError.message });
    }

    // ➤ Mettre à jour le membre avec le conseiller_id
    const { error: membreError } = await supabase
      .from("membres")
      .update({ conseiller_id: authUser.user.id })
      .eq("id", membre_id);

    if (membreError) {
      console.error("Membre Update Error:", membreError);
      return res.status(400).json({ error: membreError.message });
    }

    return res.status(200).json({ message: "✅ Conseiller créé avec succès !" });
  } catch (err) {
    console.error("Unexpected Error:", err);
    return res.status(500).json({ error: err.message });
  }
}
