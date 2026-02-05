import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ error: "Non authentifié" });
    }

    const {
      data: { user },
      error,
    } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: "Non authentifié" });
    }

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

    const { data: adminProfile, error: adminError } = await supabaseAdmin
      .from("profiles")
      .select("eglise_id, branche_id")
      .eq("id", user.id)
      .single();

    if (adminError || !adminProfile) {
      return res.status(400).json({ error: "Profil admin introuvable" });
    }

    const { data: authUser, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

    if (authError) {
      return res.status(400).json({ error: authError.message });
    }

    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .insert([{
        id: authUser.user.id,
        prenom,
        nom,
        email,
        telephone: telephone || null,
        role_description: role,
        cellule_nom: cellule_nom || null,
        cellule_zone: cellule_zone || null,
        eglise_id: adminProfile.eglise_id,
        branche_id: adminProfile.branche_id,
      }]);

    if (profileError) {
      return res.status(400).json({ error: profileError.message });
    }

    return res.status(200).json({ message: "Utilisateur créé avec succès" });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}
