import supabaseAdmin from "../../lib/supabaseAdmin";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  try {
    const { prenom, nom, email, telephone, role, password } = req.body;

    // ✅ Vérification des champs obligatoires
    if (!prenom || !nom || !email || !role || !password) {
      return res.status(400).json({ error: "Tous les champs sont obligatoires !" });
    }

    // 1️⃣ Créer l'utilisateur dans Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError) return res.status(400).json({ error: authError.message });

    const userId = authData?.user?.id;
    if (!userId) return res.status(500).json({ error: "Impossible de récupérer l'ID utilisateur" });

    // 2️⃣ Créer le profil dans la table profiles
    const { error: profileError } = await supabaseAdmin.from("profiles").insert([
      {
        id: userId,
        prenom,
        nom,
        email,
        telephone: telephone || null,
        role,
        roles: [role],
        created_at: new Date().toISOString(),
      },
    ]);

    if (profileError) return res.status(400).json({ error: profileError.message });

    // 3️⃣ Créer automatiquement une cellule si ResponsableCellule
    if (role === "ResponsableCellule") {
      const { error: cellError } = await supabaseAdmin.from("cellules").insert([
        {
          cellule: `Cellule de ${prenom} ${nom}`,
          responsable: `${prenom} ${nom}`,
          responsable_id: userId,
          telephone: telephone || null,
          created_at: new Date().toISOString(),
        },
      ]);

      if (cellError) return res.status(400).json({ error: cellError.message });
    }

    return res.status(200).json({ message: "✅ Utilisateur créé avec succès !" });
  } catch (err) {
    console.error("❌ Erreur serveur :", err);
    return res.status(500).json({ error: err.message || "Erreur serveur inconnue" });
  }
}
