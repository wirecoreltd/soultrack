import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) return res.status(401).json({ error: "Non authentifié" });

    const { data: { user } } = await supabaseAdmin.auth.getUser(token);
    if (!user) return res.status(401).json({ error: "Non authentifié" });

    const { prenom, nom, email, password, telephone, roles, cellule_nom, cellule_zone } = req.body;

    // ✅ Validation multi-roles
    if (!prenom || !nom || !email || !password || !roles || roles.length === 0) {
      return res.status(400).json({ error: "Champs obligatoires manquants" });
    }

    // 🔎 Profil admin pour eglise/branche
    const { data: adminProfile } = await supabaseAdmin
      .from("profiles")
      .select("eglise_id, branche_id")
      .eq("id", user.id)
      .single();

    // 👤 Création Auth
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (authError) return res.status(400).json({ error: authError.message });

    // 📄 Création profile avec tableau roles
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .insert({
        id: authUser.user.id,
        prenom,
        nom,
        email,
        telephone: telephone || null,
        roles, // <-- tableau de rôles
        role: roles[0], // <-- conserver role principal pour compatibilité
        must_change_password: true,
        eglise_id: adminProfile.eglise_id,
        branche_id: adminProfile.branche_id,
      });

    if (profileError) return res.status(400).json({ error: profileError.message });

    // 🏠 Création cellule si rôle ResponsableCellule
    if (roles.includes("ResponsableCellule") && cellule_nom && cellule_zone) {
      const { error: celluleError } = await supabaseAdmin
        .from("cellules")
        .insert({
          cellule: cellule_nom,
          ville: cellule_zone,
          responsable: `${prenom} ${nom}`,
          responsable_id: authUser.user.id,
          telephone: telephone || "",
          eglise_id: adminProfile.eglise_id,
          branche_id: adminProfile.branche_id,
        });
      if (celluleError) return res.status(400).json({ error: celluleError.message });
    }

    return res.status(200).json({ message: "Utilisateur créé avec succès" });
  } catch (err) {
    console.error("create-user API error:", err);
    return res.status(500).json({ error: err.message });
  }
}

