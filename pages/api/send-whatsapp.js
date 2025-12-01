export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { membres, type, cible } = req.body;

    if (!membres || membres.length === 0) {
      return res.status(400).json({ error: "Aucun membre fourni" });
    }

    if (!cible) {
      return res.status(400).json({ error: "Aucune cible sélectionnée" });
    }

    console.log("📨 Réception des données API /send-whatsapp");
    console.log("Membres :", membres);
    console.log("Type :", type);
    console.log("Cible :", cible);

    // Ici tu pourras appeler une vraie API WhatsApp

    return res.status(200).json({
      success: true,
      message: "Simulation d'envoi WhatsApp réussie",
    });
  } catch (error) {
    console.error("❌ Erreur API send-whatsapp:", error);
    return res.status(500).json({ error: "Erreur interne du serveur" });
  }
}
