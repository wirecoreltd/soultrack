import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcrypt";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Méthode non autorisée" });

  const { prenom, nom, email, password, telephone, role } = req.body;

  if (!prenom || !nom || !email || !password || !role) {
    return res.status(400).json({ error: "Champs obligatoires manquants" });
  }

  try {
    // 🔹 Récupère l'utilisateur actuel pour connaître église et branche
    const authUserId = req.headers["x-user-id"]; // ou récupère depuis cookie/session
    if (!authUserId) return res.status(401).json({ error: "Non authentifié" });

    const { data: currentUser, error: errUser } = await supabase
      .from("profiles")
      .select("eglise_id, branche_id")
      .eq("id", authUserId)
      .single();

    if (errUser || !currentUser) return res.status(500).json({ error: "Impossible de récupérer l'utilisateur créateur" });

    // 🔹 Crée l'utilisateur dans auth.users
    const hashedPassword = await bcrypt.hash(password, 10);
    const { data: newUser, error: errAuth } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (errAuth) return res.status(500).json({ error: errAuth.message });

    // 🔹 Crée le profil
    const { data: profile, error: errProfile } = await supabase
      .from("profiles")
      .insert([{
        id: newUser.user.id,
        prenom,
        nom,
        telephone,
        role_description: role,
        eglise_id: currentUser.eglise_id,
        branche_id: currentUser.branche_id
      }])
      .select()
      .single();

    if (errProfile) return res.status(500).json({ error: errProfile.message });

    res.status(200).json({ message: "Utilisateur créé", profile });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
