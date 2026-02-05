// pages/api/create-user.js
import { hash } from "bcryptjs";
import supabase from "../../lib/supabaseClient";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  try {
    // 1️⃣ Récupération de l'utilisateur connecté via le cookie
    const { data: { user } } = await supabase.auth.getUserByCookie(req, res);
    if (!user) return res.status(401).json({ error: "Non authentifié" });

    const {
      prenom,
      nom,
      email,
      password,
      telephone,
      role,
    } = req.body;

    // 2️⃣ Validation minimale
    if (!prenom || !nom || !email || !password || !role) {
      return res.status(400).json({ error: "Champs obligatoires manquants" });
    }

    // 3️⃣ Récupérer eglise_id et branche_id du user connecté
    const { data: currentUserProfile, error: profileError } = await supabase
      .from("profiles")
      .select("eglise_id, branche_id")
      .eq("id", user.id)
      .single();

    if (profileError) throw profileError;

    // 4️⃣ Hash du mot de passe
    const hashedPassword = await hash(password, 10);

    // 5️⃣ Création du nouvel utilisateur
    const { data, error } = await supabase
      .from("profiles")
      .insert([
        {
          prenom,
          nom,
          email,
          password: hashedPassword,
          telephone: telephone || null,
          role_description: role,
          eglise_id: currentUserProfile.eglise_id,
          branche_id: currentUserProfile.branche_id,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(200).json({ message: "Utilisateur créé avec succès", user: data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
