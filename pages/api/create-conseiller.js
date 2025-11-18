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

    // ➤ Récupérer infos du membre sélectionné
    const { data: membre, error: membreError } = await supabase
      .from("membres")
      .select("*")
      .eq("id", membre_id)
      .single();

    if (membreError || !membre) {
      return res.status(400).json({ error: "Membre introuvable" });
    }

    // 1️⃣ Créer l'utilisateur dans Supabase Auth
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
    });

    if (authError) {
      console.error("Auth Error:", authError);
      return res.status(400).json({ error: authError.message });
    }

    // 2️⃣ Ajouter dans profiles
    const { error: profileError } = await supabase
      .from("profiles")
      .insert([{
        id: authUser.user.id,
        email,
        prenom: membre.prenom,
        nom: membre.nom,
        telephone: membre.telephone,
        role: "Conseiller",
        responsable_id,
        membre_id,
      }]);

    if (profileError) {
      console.error("Profile Error:", profileError);
      return res.status(400).json({ error: profileError.message });
    }

    // 3️⃣ Mettre à jour membre.conseiller_id
    const { error: membreUpdateError } = await supabase
      .from("membres")
      .update({ conseiller_id: authUser.user.id })
      .eq("id", membre_id);

    if (membreUpdateError) {
      console.error("Membre Update Error:", membreUpdateError);
      return res.status(400).json({ error: membreUpdateError.message });
    }

    return res.status(200).json({ message: "✅ Conseiller créé avec succès !" });
  } catch (err) {
    console.error("Unexpected Error:", err);
    return res.status(500).json({ error: err.message });
  }
}
