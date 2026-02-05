import supabase from "../../lib/supabaseClient";

export default async function handler(req, res) {
  // ✅ Vérifie la méthode POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  try {
    // ✅ Vérifie l'utilisateur admin connecté
    const { data: { user } } = await supabase.auth.getUserByCookie(req, res);
    if (!user) return res.status(401).json({ error: "Non authentifié" });

    const {
      prenom,
      nom,
      email,
      password,
      telephone,
      role,
      cellule_nom,
      cellule_zone,
    } = req.body;

    if (!prenom || !nom || !email || !password || !role) {
      return res.status(400).json({ error: "Champs obligatoires manquants" });
    }

    // ✅ Récupération de l'eglise et branche de l'utilisateur admin connecté
    const { data: adminProfile, error: profileError } = await supabase
      .from("profiles")
      .select("eglise_id, branche_id")
      .eq("id", user.id)
      .single();

    if (profileError || !adminProfile) {
      return res.status(400).json({ error: "Impossible de récupérer l'église / branche" });
    }

    // ✅ Création de l'utilisateur dans auth.users
    const { data: newAuthUser, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError) return res.status(400).json({ error: authError.message });

    // ✅ Création du profil dans la table "profiles"
    const { data: newProfile, error: profileInsertError } = await supabase
      .from("profiles")
      .insert([{
        id: newAuthUser.id,       // même id que dans auth.users
        prenom,
        nom,
        email,
        telephone,
        role_description: role,
        cellule_nom: cellule_nom || null,
        cellule_zone: cellule_zone || null,
        eglise_id: adminProfile.eglise_id,
        branche_id: adminProfile.branche_id,
      }])
      .select()
      .single();

    if (profileInsertError) return res.status(400).json({ error: profileInsertError.message });

    return res.status(200).json({ message: "Utilisateur créé avec succès", profile: newProfile });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || "Erreur serveur" });
  }
}
