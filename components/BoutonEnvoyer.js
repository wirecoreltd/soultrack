//components/BoutonEnvoyer.js
"use client";

import { useState } from "react";
import supabase from "../lib/supabaseClient";

export default function BoutonEnvoyer({ membre, cellule, onStatusUpdate }) {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      console.error("Erreur de session:", sessionError.message);
      alert("Erreur de session Supabase");
      return;
    }

    if (!session) {
      alert("❌ Erreur : utilisateur non connecté");
      return;
    }

    if (!cellule) {
      alert("⚠️ Sélectionne une cellule avant d’envoyer !");
      return;
    }

    setLoading(true);

    try {
      // 🔹 Enregistrer dans Supabase
      const { error } = await supabase.from("suivis_membres").insert([
        {
          membre_id: membre.id,
          cellule_id: cellule.id,
          prenom: membre.prenom,
          nom: membre.nom,
          telephone: membre.telephone,
          statut_membre: membre.statut,
          besoin: membre.besoin,
          infos_supplementaires: membre.infos_supplementaires,
          cellule_nom: cellule.cellule,
          responsable: cellule.responsable,
          statut: "envoye",
          created_at: new Date().toISOString(),
        },
      ]);

      if (error) throw error;

      // 🔄 Mise à jour du statut du membre
      if (
        membre.statut === "visiteur" ||
        membre.statut === "veut rejoindre ICC"
      ) {
        await supabase
          .from("membres")
          .update({ statut: "actif" })
          .eq("id", membre.id);

        if (onStatusUpdate) onStatusUpdate(membre.id, "actif");
      }

      // ✅ Message WhatsApp
      const message = `
👋 Salut ${cellule.responsable},

🙏 Dieu nous a envoyé de nouvelles âmes à suivre.
Voici leurs infos :

- 👤 Nom : ${membre.prenom || ""} ${membre.nom || ""}
- 📱 Téléphone : ${membre.telephone || "—"}
- 📲 WhatsApp : Oui
- 🏙 Ville : ${membre.ville || "—"}
- 🙏 Besoin : ${membre.besoin || "—"}
- 📝 Infos supplémentaires : ${membre.infos_supplementaires || "—"}

🙏 Merci pour ton cœur ❤ et ton amour ✨
      `;

      const sanitizedPhone = cellule.telephone
        ? cellule.telephone.replace(/\D/g, "")
        : null;

      if (sanitizedPhone) {
        const whatsappURL = `https://wa.me/${sanitizedPhone}?text=${encodeURIComponent(
          message.trim()
        )}`;
        window.open(whatsappURL, "_blank");
      } else {
        alert("⚠️ Aucun numéro WhatsApp trouvé pour ce responsable.");
      }

      setSent(true);
      alert(`✅ ${membre.prenom} ${membre.nom} a été envoyé au responsable ${cellule.responsable}`);
    } catch (err) {
      console.error("Erreur lors de l’envoi :", err.message);
      alert("Erreur inattendue lors de l’envoi");
    }

    setLoading(false);
  };

  return (
    <button
      onClick={handleSend}
      disabled={loading || sent}
      className={`mt-2 w-full py-2 rounded-lg text-white font-semibold transition duration-300 ${
        sent
          ? "bg-green-500 cursor-not-allowed"
          : loading
          ? "bg-gray-400 cursor-wait"
          : "bg-teal-600 hover:bg-teal-700"
      }`}
    >
      {sent ? "✅ Envoyé" : loading ? "⏳ Envoi..." : "📤 Envoyer au responsable"}
    </button>
  );
}
