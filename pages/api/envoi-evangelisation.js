// pages/api/envoi-evangelisation.js

import supabase from "../../lib/supabaseClient";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  try {
    const { membres, cible, type } = req.body;

    if (!membres?.length) {
      return res.status(400).json({ error: "Aucun membre envoyé" });
    }
    if (!cible) {
      return res.status(400).json({ error: "Aucune cible sélectionnée" });
    }

    // --- 1️⃣ ENVOI WHATSAPP ---
    const messageTexte =
      `📥 Nouveau(s) contact(s) reçu(s)\n\n` +
      membres
        .map(
          (m) =>
            `👤 *${m.prenom} ${m.nom}*\n📱 ${m.telephone}\n🏙️ Ville: ${
              m.ville || "—"
            }\n📝 Besoin: ${m.besoin || "—"}\n`
        )
        .join("\n");

    const url = `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_ID}/messages`;

    const whatsappResponse = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: cible.telephone.replace(/\D/g, ""),
        type: "text",
        text: { body: messageTexte },
      }),
    });

    const data = await whatsappResponse.json();
    if (!whatsappResponse.ok) {
      console.error("Erreur WhatsApp:", data);
      return res.status(400).json({ error: "Erreur WhatsApp", details: data });
    }

    // --- 2️⃣ TRANSFERT DES CONTACTS SUPABASE ---
    for (const m of membres) {
      const insertion = {
        prenom: m.prenom,
        nom: m.nom,
        telephone: m.telephone,
        is_whatsapp: m.is_whatsapp || false,
        ville: m.ville,
        besoin: m.besoin,
        infos_supplementaires: m.infos_supplementaires,
        status_suivis_evangelises: "En suivis",
        commentaire_evangelises: null,
      };

      if (type === "cellule") {
        insertion.cellule_id = cible.id;
        insertion.responsable_cellule = cible.responsable;
      }

      if (type === "conseiller") {
        insertion.responsable_cellule = `${cible.prenom} ${cible.nom}`;
      }

      const { error: insertError } = await supabase
        .from("suivis_des_evangelises")
        .insert(insertion);

      if (insertError) console.log("Erreur insertion:", insertError);

      // Supprimer le contact de la table évangélisation
      await supabase.from("evangelises").delete().eq("id", m.id);
    }

    return res.status(200).json({ success: true });
  } catch (e) {
    console.error("Erreur serveur:", e);
    return res.status(500).json({ error: "Erreur serveur" });
  }
}
