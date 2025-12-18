1.tu dois mettre l'option, quand je clikc en dehors le petit telephone popup doit fermer.
2. l'option envoyer a ne fonctoinne toujours pas, les cellle ne s'affice pas et sa doit utiliser le meme bouton que carte pour envoyer
"use client";

import { useState } from "react";
import supabase from "../lib/supabaseClient";

export default function BoutonEnvoyer({ membre, type, cible, onEnvoyer, session, showToast }) {
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!type || !cible) return;

    setLoading(true);

    try {
      // Générer le message WhatsApp
      const message = `👋 Bonjour ${cible.prenom || cible.responsable || ""} !\n\n` +
        `✨ Un nouveau membre est placé sous tes soins pour être accompagné et encouragé.\n\n` +
        `📌 Statut: ${membre.statut || "—"}\n\n` +        
        `👤 Nom: ${membre.prenom} ${membre.nom}\n` +
        ` ⚥ Sexe: ${membre.sexe || "—"}\n` +
        `📱 Téléphone: ${membre.telephone || "—"}\n` +
        `💬 WhatsApp: ${membre.is_whatsapp ? "Oui" : "Non"}\n` +
        `🏙 Ville: ${membre.ville || "—"}\n` +
        `🧩 Comment est-il venu : ${membre.venu || "—"}\n` +
        `❓ Besoin: ${Array.isArray(membre.besoin) ? membre.besoin.join(", ") : membre.besoin || "—"}\n` +
        `📝 Infos supplémentaires: ${membre.infos_supplementaires || "—"}\n\n` +
        `Merci pour ton accompagnement et ta bienveillance. Que Dieu te benisse abondament 🙏`;
       
      // Ouvrir WhatsApp
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`, "_blank");

      // Mettre à jour le statut du membre en "actif"
      const { data, error } = await supabase
        .from("membres")
        .update({ statut: "actif" })
        .eq("id", membre.id)
        .select()
        .single();

      if (error) throw error;

      showToast(`✅ ${membre.prenom} ${membre.nom} envoyé à ${cible.prenom || cible.responsable || ""}`);
      onEnvoyer && onEnvoyer(data);

    } catch (err) {
      console.error("Erreur BoutonEnvoyer:", err);
      alert("Erreur lors de l'envoi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleSend}
      className="w-full py-2 rounded-lg font-semibold text-white bg-green-500 hover:bg-green-600 transition"
      disabled={loading}
    >
      {loading ? "Envoi..." : "Envoyer"}
    </button>
  );
}
