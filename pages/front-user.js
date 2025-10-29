export default function handler(req, res) {
  // Vérifie la méthode POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  try {
    const { prenom, nom, email, role } = req.body;

    // Vérifie les champs requis
    if (!prenom || !nom || !email || !role) {
      return res.status(400).json({ error: "Tous les champs sont obligatoires !" });
    }

    // Simulation succès
    return res.status(200).json({
      message: "✅ API POST test fonctionnel !",
      data: { prenom, nom, email, role }
    });
  } catch (err) {
    console.error("❌ Erreur serveur :", err);
    return res.status(500).json({ error: err.message || "Erreur serveur inconnue" });
  }
}
