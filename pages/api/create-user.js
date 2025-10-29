// pages/api/create-user.js
import supabase from "../../lib/supabaseClient";

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Méthode non autorisée" });

  const { prenom, nom, email, telephone, role, password } = req.body;

  if (!prenom || !nom || !email || !role || !password) {
    return res.status(400).json({ error: "Tous les champs sont obligatoires !" });
  }

  try {
    // 🧩 1. Création dans Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError) throw authError;
    const userId = authData.user?.id;

    // 🧩 2. Vérifie si le profil existe déjà
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email)
      .single();

    if (existingProfile) {
      return res.status(400).json({ error: "Un profil existe déjà avec cet email." });
    }

    // 🧩 3. Création du profil
    const { error: profileError } = await supabase.from("profiles").insert([
      {
        id: userId,
        prenom,
        nom,
        email,
        telephone,
        role,
        responsable: `${prenom} ${nom}`,
        access_pages: JSON.stringify(getAccessPages(role)),
      },
    ]);

    if (profileError) throw profileError;

    // 🧩 4. Si c’est un ResponsableCellule → créer automatiquement une cellule
    if (role === "ResponsableCellule") {
      const { error: cellError } = await supabase.from("cellules").insert([
        {
          nom_cellule: `Cellule de ${prenom} ${nom}`,
          responsable: `${prenom} ${nom}`,
          responsable_id: userId,
          telephone,
        },
      ]);
      if (cellError) throw cellError;
    }

    // ✅ 5. Succès
    return res.status(200).json({ message: "✅ Utilisateur et profil créés avec succès !" });

  } catch (err) {
    console.error("Erreur création utilisateur :", err);
    return res.status(500).json({ error: err.message || "Erreur serveur" });
  }
}

// 🔹 Définition des accès selon les rôles
function getAccessPages(role) {
  switch (role) {
    case "ResponsableCellule":
      return ["/membres"];
    case "ResponsableEvangelisation":
      return ["/evangelisation"];
    case "ResponsableIntegration":
      return ["/integration"];
    case "Administrateur":
    case "Admin": // pour compatibilité
      return ["/admin/create-internal-user", "/membres", "/suivis-membres"];
    default:
      return [];
  }
}
