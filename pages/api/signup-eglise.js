import supabase from "../../lib/supabaseClient";

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
    // 1️⃣ Créer l'utilisateur admin dans Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
    });

    if (authError) {
      return res.status(400).json({ error: authError.message });
    }

    const adminUserId = authData.user.id;

    // 2️⃣ Créer l'église
    const { data: egliseData, error: egliseError } = await supabase
      .from("eglises")
      .insert([{ nom: nomEglise }])
      .select()
      .single();

    if (egliseError) {
      return res.status(400).json({ error: egliseError.message });
    }

    const egliseId = egliseData.id;

    // 3️⃣ Créer la branche
    const { data: brancheData, error: brancheError } = await supabase
      .from("branches")
      .insert([{ nom: nomBranche, localisation, eglise_id: egliseId }])
      .select()
      .single();

    if (brancheError) {
      return res.status(400).json({ error: brancheError.message });
    }

    const brancheId = brancheData.id;

    // 4️⃣ Créer le profile admin
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .insert([
        {
          id: adminUserId, // correspond à Supabase Auth
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

    if (profileError) {
      return res.status(400).json({ error: profileError.message });
    }

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
