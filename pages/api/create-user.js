// pages/api/create-user.js
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // ✅ Clé service role côté serveur uniquement
);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const {
    prenom,
    nom,
    email,
    password,
    role,
    telephone,
    cellule_nom,
    cellule_zone,
    eglise_id,
    branche_id
  } = req.body;

  if (!prenom || !nom || !email || !password || !role || !eglise_id || !branche_id) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // 1️⃣ Créer l’utilisateur Auth Supabase
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      user_metadata: { prenom, nom, role, eglise_id, branche_id }
    });
    if (authError) throw authError;

    // 2️⃣ Ajouter dans la table profiles
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .insert([{
        id: authData.user.id,
        prenom,
        nom,
        email,
        telephone: telephone || null,
        role_description: role,
        cellule_nom: cellule_nom || null,
        cellule_zone: cellule_zone || null,
        eglise_id,
        branche_id
      }])
      .select()
      .single();

    if (profileError) throw profileError;

    return res.status(200).json({ user: profile });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}
