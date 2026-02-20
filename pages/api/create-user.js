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
    // 🔐 Vérification auth via token
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ error: "Non authentifié" });
    }

    const {
      data: { user },
      error: authCheckError,
    } = await supabaseAdmin.auth.getUser(token);

    if (authCheckError || !user) {
      return res.status(401).json({ error: "Non authentifié" });
    }

    // 📥 Données reçues
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

    // 🔎 Récupérer eglise / branche de l’admin
    const { data: adminProfile, error: adminError } = await supabaseAdmin
      .from("profiles")
      .select("eglise_id, branche_id")
      .eq("id", user.id)
      .single();

    if (adminError || !adminProfile) {
      return res.status(400).json({ error: "Profil admin introuvable" });
    }

    // 👤 Création utilisateur Auth
    const { data: authUser, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

    if (authError) {
      return res.status(400).json({ error: authError.message });
    }

    const newUserId = authUser.user.id;

    // 📄 Création profile (SANS cellule)
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .insert({
        id: newUserId,
        prenom,
        nom,
        email,
        telephone: telephone || null,
        role: role,  // rôle principal
        roles: [role],  // tableau officiel
        role_description: role,
        eglise_id: adminProfile.eglise_id,
        branche_id: adminProfile.branche_id,
      });

    if (profileError) {
      return res.status(400).json({ error: profileError.message });
    }

    // 🏠 Création cellule UNIQUEMENT si ResponsableCellule
    if (
      role === "ResponsableCellule" &&
      cellule_nom &&
      cellule_zone
    ) {
      const { error: celluleError } = await supabaseAdmin
        .from("cellules")
        .insert({
          cellule: cellule_nom,
          ville: cellule_zone,
          responsable: `${prenom} ${nom}`,
          responsable_id: newUserId,
          telephone: telephone || "",
          eglise_id: adminProfile.eglise_id,
          branche_id: adminProfile.branche_id,
        });

      if (celluleError) {
        return res.status(400).json({ error: celluleError.message });
      }
    }

    return res.status(200).json({
      message: "Utilisateur créé avec succès",
    });

  } catch (err) {
    console.error("create-user API error:", err);
    return res.status(500).json({ error: err.message });
  }
}
