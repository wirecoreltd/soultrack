// components/BoutonEnvoyer.js

"use client";
import { useState } from "react";
import supabase from "../lib/supabaseClient";

export default function BoutonEnvoyer({ membre, cellule, onStatusUpdate, session }) {
  const [loading, setLoading] = useState(false);

  const sendToWhatsapp = async () => {
    if (!session) {
      alert("❌ Vous devez être connecté pour envoyer un membre à une cellule.");
      return;
    }

    if (!cellule) {
      alert("❌ Sélectionnez une cellule !");
      return;
    }

    setLoading(true);

    try {
      const now = new Date().toISOString();

      // ✅ Champs correspondant aux colonnes existantes
      const suiviData = {
        prenom: membre.prenom,
        nom: membre.nom,
        telephone: membre.telephone,
        is_whatsapp: true,
        ville: membre.ville,
        besoin: membre.besoin,
        infos_supplementaires: membre.infos_supplementaires,
        cellule_id: cellule.id,
        cellule_nom: cellule.cellule,
        responsable: cellule.responsable, // colonne existante dans suivis_membres
      };

      const { error: insertError } = await supabase
        .from("suivis_membres")
        .insert([suiviData]);

      if (insertError) {
        console.error("Erreur lors de l'insertion du suivi :", insertError.message);
        alert("❌ Une erreur est survenue lors de l’enregistrement du suivi.");
        setLoading(false);
        return;
      }

      // Création du message WhatsApp
      let message = `👋 Salut ${cellule.responsable},\n\n🙏 Nous avons un nouveau membre à suivre :\n\n`;
      message += `- 👤 Nom : ${membre.prenom || ""} ${membre.nom || ""}\n`;
      message += `- 📱 Téléphone : ${membre.telephone || "—"}\n`;
      message += `- 📲 WhatsApp : Oui\n`;
      message += `- 🏙 Ville : ${membre.ville || "—"}\n`;
      message += `- 🙏 Besoin : ${membre.besoin || "—"}\n`;
      message += `- 📝 Infos supplémentaires : ${membre.infos_supplementaires || "—"}\n\n`;
      message += "🙏 Merci pour ton cœur ❤ et ton amour ✨";

      const phone = cellule.telephone.replace(/\D/g, "");
      window.open(
        `https://wa.me/${phone}?text=${encodeURIComponent(message)}`,
        "_blank"
      );

      // Mise à jour du statut si callback fourni
      if (onStatusUpdate) {
        onStatusUpdate(membre.id, membre.statut);
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi WhatsApp :", error.message);
      alert("❌ Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={sendToWhatsapp}
      disabled={loading}
      className={`w-full text-white font-bold px-4 py-2 rounded-lg shadow-lg transition-all ${
        loading ? "bg-gray-400 cursor-not-allowed" : "bg-green-500 hover:bg-green-600"
      }`}
    >
      {loading ? "Envoi..." : "Envoyer par WhatsApp"}
    </button>
  );
}
