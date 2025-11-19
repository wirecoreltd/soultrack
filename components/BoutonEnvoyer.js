"use client";
import { useState } from "react";
import supabase from "../lib/supabaseClient";

export default function BoutonEnvoyer({ membre, type = "cellule", cible, onEnvoyer, session, showToast }) {
  const [loading, setLoading] = useState(false);

  const sendToWhatsapp = async () => {
    if (!session) {
      alert("❌ Vous devez être connecté pour envoyer un membre.");
      return;
    }
    if (!cible) {
      alert("❌ Sélectionnez une cible !");
      return;
    }

    setLoading(true);
    try {
      const suiviData = {
        membre_id: membre.id,
        prenom: membre.prenom,
        nom: membre.nom,
        telephone: membre.telephone,
        is_whatsapp: true,
        ville: membre.ville,
        besoin: membre.besoin,
        infos_supplementaires: membre.infos_supplementaires,
        statut_suivis: "envoye",
        created_at: new Date().toISOString(),
      };

      if (type === "cellule") {
        suiviData.cellule_id = cible.id;
        suiviData.cellule_nom = cible.cellule;
        suiviData.responsable = cible.responsable || null;
      } else {
        suiviData.responsable = `${cible.prenom || ""} ${cible.nom || ""}`.trim();
      }

      const { error: insertError } = await supabase.from("suivis_membres").insert([suiviData]);
      if (insertError) {
        console.error("Erreur insertion suivi:", insertError);
        alert("❌ Erreur lors de l'enregistrement du suivi.");
        setLoading(false);
        return;
      }

      // Message WhatsApp
      let message = `👋 Salut ${cible.responsable || (cible.prenom ? `${cible.prenom} ${cible.nom}` : "")},\n\n`;
      message += `🙏 Nouveau membre à suivre :\n`;
      message += `- 👤 Nom : ${membre.prenom} ${membre.nom}\n`;
      message += `- 📱 Téléphone : ${membre.telephone || "—"}\n`;
      message += `- 🏙 Ville : ${membre.ville || "—"}\n`;
      message += `- 🙏 Besoin : ${membre.besoin || "—"}\n\n🙏 Merci !`;

      const phoneRaw = cible.telephone || "";
      const phone = phoneRaw.replace(/\D/g, "");
      if (!phone) alert("❌ La cible n'a pas de numéro valide.");
      else window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, "_blank");

      // Callback côté parent pour déplacer le membre
      if (onEnvoyer) onEnvoyer(membre.id);

      if (showToast) showToast("✅ Message WhatsApp ouvert et suivi enregistré");
    } catch (err) {
      console.error("Erreur sendToWhatsapp:", err);
      alert("❌ Une erreur est survenue lors de l'envoi.");
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
