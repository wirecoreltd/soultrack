import supabase from "../../lib/supabaseClient";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  try {
    const {
      nomEglise,
      nomBranche,
      localisation,
      adminPrenom,
      adminNom,
      adminEmail,
      adminPassword,
    } = req.body;

    // 🔹 Ici tu feras la création réelle
    // Pour l'instant juste tester la réception des données
    return res.status(200).json({ message: "Données reçues", data: req.body });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}
