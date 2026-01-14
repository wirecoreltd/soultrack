import supabase from "../../lib/supabaseClient";
import bcrypt from "bcryptjs";

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
    // 1️⃣ Vérifier que l'email n'existe pas déjà
    const { data: existing, error: existingError } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", adminEmail)
      .single();

    if (existing) {
      return res.status(400).json({ error: "Email déjà utilisé" });
    }

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

    // 4️⃣ Hasher le mot de passe
    const passwordHash = bcrypt.hashSync(adminPassword, 10);

    // 5️⃣ Créer le profil admin
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .insert([
        {
          prenom: adminPrenom,
          nom: adminNom,
          email: adminEmail,
          password_hash: passwordHash,
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
