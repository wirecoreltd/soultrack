import supabase from "../../lib/supabaseClient";
import bcrypt from "bcryptjs";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const {
      prenom,
      nom,
      email,
      password,
      role,
      telephone,
      cellule_nom,
      cellule_zone,
    } = req.body;

    if (!prenom || !nom || !email || !password || !role) {
      return res.status(400).json({ error: "Champs requis manquants" });
    }

    // 🔹 Récupérer l'utilisateur connecté via Supabase Auth
    const { data: { user }, error: authError } = await supabase.auth.getUserByCookie(req);

    if (authError || !user) return res.status(401).json({ error: "Non authentifié" });

    // 🔹 Récupérer eglise_id et branche_id depuis l'utilisateur connecté
    const { data: currentUser, error: userError } = await supabase
      .from("profiles")
      .select("eglise_id, branche_id")
      .eq("id", user.id)
      .single();

    if (userError || !currentUser) return res.status(401).json({ error: "Utilisateur introuvable" });

    // 🔹 Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // 🔹 Préparer l'utilisateur à insérer
    const newUser = {
      prenom,
      nom,
      email,
      password: hashedPassword,
      role_description: role,
      telephone: telephone || null,
      cellule_nom: cellule_nom || null,
      cellule_zone: cellule_zone || null,
      eglise_id: currentUser.eglise_id,
      branche_id: currentUser.branche_id,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("profiles")
      .insert([newUser])
      .select()
      .single();

    if (error) throw error;

    return res.status(200).json({ message: "Utilisateur créé avec succès", user: data });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || "Erreur serveur" });
  }
}
