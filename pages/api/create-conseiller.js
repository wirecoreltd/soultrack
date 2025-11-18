import supabase from "../../lib/supabaseClient";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { membre_id, email, password, responsable_id } = req.body;

    if (!membre_id || !email || !password || !responsable_id)
      return res.status(400).json({ error: "Champs manquants" });

    // Récupérer les infos du membre depuis la table membres
    const { data: memberData, error: memberError } = await supabase
      .from("membres")
      .select("prenom, nom, telephone")
      .eq("id", membre_id)
      .single();

    if (memberError || !memberData)
      return res.status(400).json({ error: "Impossible de récupérer le membre" });

    const { prenom, nom, telephone } = memberData;

    // Créer l'utilisateur dans Supabase Auth
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
    });

    if (authError) return res.status(400).json({ error: authError.message });

    // Ajouter dans profiles
    const { error: profileError } = await supabase
      .from("profiles")
      .insert([{
        id: authUser.user.id,
        email,
        prenom,
        nom,
        telephone,
        role: "Conseiller",
        responsable_id,
        membre_id,
        created_at: new Date().toISOString(),
      }]);

    if (profileError) return res.status(400).json({ error: profileError.message });

    // Mettre à jour le membre pour lier le conseiller
    const { error: updateMemberError } = await supabase
      .from("membres")
      .update({ conseiller_id: authUser.user.id })
      .eq("id", membre_id);

    if (updateMemberError) return res.status(400).json({ error: updateMemberError.message });

    return res.status(200).json({ message: "✅ Conseiller créé avec succès !" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}
