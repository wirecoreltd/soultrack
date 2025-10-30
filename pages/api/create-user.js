// ✅ pages/api/create-user.js

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Méthode non autorisée" });

  try {
    const { prenom, nom, email, password, role, telephone, cellule_nom, cellule_zone } = req.body;

    // ✅ Crée un utilisateur dans Auth
    const { data: userData, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (createError) throw createError;
    const user = userData.user;

    // ✅ Ajoute dans la table profiles
    const { error: profileError } = await supabase.from("profiles").insert({
      id: user.id,
      prenom,
      nom,
      telephone,
      role,
      email,
    });

    if (profileError) throw profileError;

    // ✅ Si c’est un responsable, crée la cellule en même temps
    if (role === "ResponsableCellule" && cellule_nom) {
      const { error: celluleError } = await supabase.from("cellules").insert({
        cellule: cellule_nom,
        ville: cellule_zone || null,
        responsable: `${prenom} ${nom}`,
        responsable_id: user.id,
        telephone: telephone || "",
      });

      if (celluleError) throw celluleError;
    }

    return res.status(200).json({ message: "Utilisateur créé avec succès" });
  } catch (err) {
    console.error("Erreur création utilisateur:", err);
    return res.status(500).json({ error: err.message });
  }
}
