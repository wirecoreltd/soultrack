import { createClient } from "@supabase/supabase-js";

// ⚠️ À utiliser uniquement côté serveur
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,       // URL Supabase
  process.env.SUPABASE_SERVICE_ROLE_KEY       // Clé SERVICE_ROLE (privée)
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  const {
    nomEglise,
    nomBranche,
    localisation,
    adminPrenom,
    adminNom,
    adminEmail,
    adminPassword,
  } = req.body;

  try {
    // 1️⃣ Vérifier si l'email existe déjà
    const { data: existing, error: existingError } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("email", adminEmail)
      .single();

    if (existing) {
      return res.status(400).json({ error: "Email déjà utilisé" });
    }

    // 2️⃣ Créer l'église
    const { data: egliseData, error: egliseError } = await supabaseAdmin
      .from("eglises")
      .insert([{ nom: nomEglise }])
      .select()
      .single();

    if (egliseError) return res.status(400).json({ error: egliseError.message });
    const egliseId = egliseData.id;

    // 3️⃣ Créer la branche
    const { data: brancheData, error: brancheError } = await supabaseAdmin
      .from("branches")
      .insert([{ nom: nomBranche, localisation, eglise_id: egliseId }])
      .select()
      .single();

    if (brancheError) return res.status(400).json({ error: brancheError.message });
    const brancheId = brancheData.id;

    // 4️⃣ Créer l’utilisateur admin dans Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
    });

    if (authError) return res.status(400).json({ error: authError.message });
    const adminUserId = authData.user.id;

    // 5️⃣ Créer le profil admin dans profiles
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from("profiles")
      .insert([
        {
          id: adminUserId,
          prenom: adminPrenom,
          nom: adminNom,
          email: adminEmail,
          role: "Administrateur",
          roles: ["Administrateur"],
          eglise_id: egliseId,
          branche_id: brancheId,
          must_change_password: false,
        },
      ])
      .select()
      .single();

    if (profileError) return res.status(400).json({ error: profileError.message });

    // ✅ Tout a été créé
    return res.status(200).json({
      message: "Église, branche et admin créés avec succès !",
      eglise: egliseData,
      branche: brancheData,
      admin: profileData,
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}
