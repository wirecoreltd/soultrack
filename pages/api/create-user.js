
import supabase from "../../lib/supabaseClient";
import bcrypt from "bcrypt";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
      prenom,
      nom,
      email,
      password,
      role,
      telephone,
      cellule_nom,
      cellule_zone,
    } = req.body;

    // 🔹 Vérification obligatoire
    if (!prenom || !nom || !email || !password || !role) {
      return res.status(400).json({ error: "Champs requis manquants" });
    }

    // 🔹 Récupérer l'utilisateur connecté pour prendre son eglise_id et branche_id
    // Ici on suppose que l'utilisateur connecté est identifié par le token Bearer de Supabase
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Non authentifié" });

    const { data: currentUser, error: userError } = await supabase
      .from("profiles")
      .select("id, eglise_id, branche_id")
      .eq("id", req.headers.userid) // ⚠️ à adapter selon comment tu passes l'ID utilisateur connecté
      .single();

    if (userError || !currentUser) {
      return res.status(401).json({ error: "Utilisateur connecté introuvable" });
    }

    // 🔹 Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // 🔹 Préparer les données à insérer
    const newUser = {
      prenom,
      nom,
      email,
      password: hashedPassword,
      role_description: role,
      telephone: telephone || null,
      cellule_nom: cellule_nom || null,
      cellule_zone: cellule_zone || null,
      eglise_id: currentUser.eglise_id, // ✅ récupéré automatiquement
      branche_id: currentUser.branche_id, // ✅ récupéré automatiquement
      created_at: new Date().toISOString(),
    };

    // 🔹 Insérer le nouvel utilisateur
    const { data, error } = await supabase
      .from("profiles")
      .insert([newUser])
      .select()
      .single();

    if (error) throw error;

    return res.status(200).json({ message: "Utilisateur créé avec succès", user: data });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || "Erreur serveur" });
  }
}
