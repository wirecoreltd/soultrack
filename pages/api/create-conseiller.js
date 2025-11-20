import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  if (req.method !== "POST") 
    return res.status(405).json({ error: "Méthode non autorisée" });

  try {
    const { prenom, nom, telephone, email, password, token } = req.body;

    if (!token) return res.status(401).json({ error: "Token manquant" });

    // 🔹 Client Supabase avec token du front
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        global: { headers: { Authorization: `Bearer ${token}` } },
      }
    );

    // 🔹 Récupérer l'utilisateur connecté
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) return res.status(401).json({ error: "Utilisateur non authentifié" });

    // 🔹 Créer le conseiller dans Auth
    const { data: newUser, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });
    if (signUpError) throw signUpError;

    // 🔹 Insert dans profiles avec responsable_id
    const { error: insertError } = await supabase.from("profiles").insert({
      id: newUser.user.id,
      prenom,
      nom,
      telephone,
      role: "Conseiller",
      email,
      responsable_id: user.id, // 🔹 automatiquement le responsable connecté
    });
    if (insertError) throw insertError;

    return res.status(200).json({ message: "Conseiller créé avec succès" });

  } catch (err) {
    console.error("Erreur API:", err);
    return res.status(500).json({ error: err.message });
  }
}
