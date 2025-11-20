// /pages/api/create-conseiller.js

import { createClient } from "@supabase/supabase-js";

// ❗ ICI ON UTILISE L’ANON KEY (OBLIGATOIRE pour que auth.uid() marche)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Méthode non autorisée" });

  try {
    const { prenom, nom, telephone, email, password } = req.body;

    // 👉 1. Vérifier si un responsable est connecté
    const {
      data: { user: responsable },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !responsable) {
      return res.status(401).json({ error: "Utilisateur non authentifié" });
    }

    // 👉 2. Créer l’utilisateur dans Auth
    const {
      data: newUser,
      error: createError,
    } = await supabase.auth.signUp({
      email,
      password,
    });

    if (createError) throw createError;

    // 👉 3. Insert dans profiles
    // ❗ ATTENTION : on n’envoie PLUS responsable_id
    // Le trigger SQL dans Supabase va le remplir automatiquement via auth.uid()
    const { error: insertError } = await supabase.from("profiles").insert({
      id: newUser.user.id,
      prenom,
      nom,
      telephone,
      role: "Conseiller",
      email,
    });

    if (insertError) throw insertError;

    return res.status(200).json({
      message: "Conseiller créé avec succès",
    });
  } catch (err) {
    console.error("Erreur API:", err);
    return res.status(500).json({ error: err.message });
  }
}
