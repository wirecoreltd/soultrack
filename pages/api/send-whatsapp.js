export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  const token = process.env.WHATSAPP_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_ID;

  if (!token || !phoneId) {
    return res.status(500).json({ error: "WhatsApp API non configurée" });
  }

  try {
    const { membres, type, cible } = req.body;

    if (!membres || membres.length === 0) {
      return res.status(400).json({ error: "Aucun membre envoyé" });
    }
    if (!cible) {
      return res.status(400).json({ error: "Aucune cible sélectionnée" });
    }

    console.log("📨 Envoi WhatsApp vers :", cible);
    console.log("👥 Membres envoyés :", membres);

    // NUMÉRO DU DESTINATAIRE
    const cibleNumero = (cible.telephone || "").replace(/\D/g, "");

    if (!cibleNumero) {
      return res.status(400).json({ error: "Cible sans numéro valide" });
    }

    // MESSAGE À ENVOYER
    const messageTexte =
      `📥 Nouveau(s) contact(s) reçu(s)\n\n` +
      membres
        .map(
          (m) =>
            `👤 *${m.prenom} ${m.nom}*\n📱 ${m.telephone}\n🏙️ Ville: ${m.ville || "—"}\n📝 Besoin: ${
              m.besoin || "—"
            }\n`
        )
        .join("\n");

    console.log("📄 Message formaté :", messageTexte);

    // ENVOI À WHATSAPP CLOUD API
    const url = `https://graph.facebook.com/v18.0/${phoneId}/messages`;

    const whatsappResponse = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: cibleNumero,
        type: "text",
        text: {
          body: messageTexte
        }
      })
    });

    const data = await whatsappResponse.json();

    if (!whatsappResponse.ok) {
      console.error("❌ Erreur WhatsApp:", data);
      return res.status(400).json({ error: "Erreur en envoyant WhatsApp", details: data });
    }

    console.log("✅ Message WhatsApp envoyé :", data);

    return res.status(200).json({ success: true, message: "Messages envoyés via WhatsApp Cloud API" });
  } catch (error) {
    console.error("❌ Erreur API send-whatsapp:", error);
    return res.status(500).json({ error: "Erreur serveur", details: error });
  }
}
