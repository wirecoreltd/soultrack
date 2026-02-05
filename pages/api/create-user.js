import supabase from "../../lib/supabaseClient";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Méthode non autorisée" });

  // ✅ Récupère l'utilisateur connecté
  const { user } = await supabase.auth.getUserByCookie(req, res);
  if (!user) return res.status(401).json({ error: "Non authentifié" });

  const { prenom, nom, email, password, telephone, role } = req.body;

  try {
    // 1️⃣ Crée l'utilisateur dans Supabase Auth
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { prenom, nom, telephone, role }
    });
    if (authError) throw authError;

    // 2️⃣ Récupère l'eglise_id et branche_id automatiquement depuis l'utilisateur connecté
    const { data: currentProfile, error: profileError } = await supabase
      .from("profiles")
      .select("eglise_id, branche_id")
      .eq("auth_id", user.id)
      .single();
    if (profileError) throw profileError;

    // 3️⃣ Crée le profil dans `profiles`
    const { data, error } = await supabase
      .from("profiles")
      .insert([{
        auth_id: authUser.id,
        prenom,
        nom,
        email,
        telephone,
        role,
        eglise_id: currentProfile.eglise_id,
        branche_id: currentProfile.branche_id
      }])
      .select()
      .single();
    if (error) throw error;

    res.status(200).json({ message: "Utilisateur créé avec succès", user: data });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}
