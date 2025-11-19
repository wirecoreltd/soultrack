"use client";
import { useState } from "react";
import supabase from "../lib/supabaseClient";

export default function BoutonEnvoyer({
  membre,
  cellule,
  conseiller,
  onStatusUpdate,
  session,
  showToast
}) {
  const [loading, setLoading] = useState(false);

  const sendToWhatsapp = async () => {
    if (!session) {
      alert("❌ Vous devez être connecté.");
      return;
    }

    // --- Vérification ---
    if (!cellule && !conseiller) {
      alert("❌ Choisissez une cellule ou un conseiller.");
      return;
    }

    setLoading(true);

    try {
      const destinataire = cellule || conseiller;

      // --- construction du suivi ---
      const suiviData = {
        membre_id: membre.id,
        prenom: membre.prenom,
        nom: membre.nom,
        telephone: membre.telephone,
        is_whatsapp: true,
        ville: membre.ville,
        besoin: membre.besoin,
        infos_supplementaires: membre.infos_supplementaires,
        statut: "envoye",

        // CHAMP DESTINATION :
        cellule_id: cellule ? cellule.id : null,
        cellule_nom: cellule ? cellule.cellule : null,

        conseiller_id: conseiller ? conseiller.id : null,
        conseiller_nom: conseiller ? `${conseiller.prenom} ${conseiller.nom}` : null,

        responsable: destinataire.responsable || null
      };

      const { error: insertError } = await supabase
        .from("suivis_membres")
        .insert([suiviData]);

      if (insertError) {
        console.error("Erreur insertion suivi:", insertError);
        alert("❌ Erreur lors de l'enregistrement du suivi.");
        setLoading(false);
        return;
      }

      // --- Message WhatsApp ---
      const phone = destinataire.telephone.replace(/\D/g, "");

      let message = `👋 Bonjour ${destinataire.prenom || destinataire.responsable},\n\n`;
      message += `🙏 Nouveau contact à suivre :\n`;
      message += `- 👤 ${membre.prenom} ${membre.nom}\n`;
      message += `- 📱 ${membre.telephone}\n`;
      message += `- 🏙 Ville : ${membre.ville || "—"}\n`;
      message += `- 🙏 Besoin : ${membre.besoin || "—"}\n`;
      message += `- 📝 Infos : ${membre.infos_supplementaires || "—"}\n\n`;
      message += `Merci pour ton service ❤️`;

      window.open(
        `https://wa.me/${phone}?text=${encodeURIComponent(message)}`,
        "_blank"
      );

      // --- Mise à jour statut membre ---
      onStatusUpdate({
        ...membre,
        statut: "envoye",
        cellule_id: cellule ? cellule.id : null,
        conseiller_id: conseiller ? conseiller.id : null
      });

      if (showToast) showToast("✅ Message envoyé & suivi enregistré !");
    } catch (e) {
      console.error("Erreur WhatsApp:", e);
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
        loading
          ? "bg-gray-400 cursor-not-allowed"
          : "bg-green-500 hover:bg-green-600"
      }`}
    >
      {loading ? "Envoi..." : "Envoyer par WhatsApp"}
    </button>
  );
}
