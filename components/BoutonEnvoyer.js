"use client";
import { useState } from "react";
import supabase from "../lib/supabaseClient";

export default function BoutonEnvoyer({ membre, type = "cellule", cible, session, onEnvoyer, showToast }) {
  const [loading, setLoading] = useState(false);

  const statutIds = { envoye: 1, en_attente: 2, integrer: 3, refus: 4 };

  const sendToWhatsapp = async () => {
    if (!session) {
      alert("❌ Vous devez être connecté.");
      return;
    }
    if (!cible?.id) {
      alert("❌ Cible invalide.");
      return;
    }

    setLoading(true);

    try {
      let responsablePrenom = "";
      let responsableTelephone = "";

      // 🔹 Récupérer responsable selon type
      if (type === "cellule") {
        const { data: cellule, error } = await supabase
          .from("cellules")
          .select("id, responsable_id, cellule_full")
          .eq("id", cible.id)
          .single();
        if (error || !cellule?.responsable_id) throw new Error("Responsable de cellule introuvable");

        const { data: resp, error: respError } = await supabase
          .from("profiles")
          .select("prenom, telephone")
          .eq("id", cellule.responsable_id)
          .single();
        if (respError || !resp?.telephone) throw new Error("Numéro WhatsApp invalide");

        responsablePrenom = resp.prenom;
        responsableTelephone = resp.telephone;
        cible.cellule_full = cellule.cellule_full; // garantir que cellule_full est disponible
      }

      if (type === "conseiller") {
        if (!cible.telephone) throw new Error("Numéro WhatsApp invalide");
        responsablePrenom = cible.prenom;
        responsableTelephone = cible.telephone;
      }

      // 🔹 Mettre à jour le membre dans membres_complets
      const { data: updatedMember, error: updateError } = await supabase
        .from("membres_complets")
        .update({
          statut: "actif",
          statut_suivis: statutIds.envoye,
          cellule_id: type === "cellule" ? cible.id : null,
          conseiller_id: type === "conseiller" ? cible.id : null,
          suivi_cellule_nom: type === "cellule" ? cible.cellule_full : null,
          suivi_responsable: type === "conseiller" ? `${cible.prenom} ${cible.nom}` : responsablePrenom,
          suivi_responsable_id: type === "conseiller" ? cible.id : null
        })
        .eq("id", membre.id)
        .select()
        .single();
      if (updateError) throw updateError;

      // 🔹 Callback après envoi
      if (onEnvoyer) onEnvoyer(updatedMember);

      if (showToast) {
        const cibleName = type === "cellule" ? cible.cellule_full : `${cible.prenom} ${cible.nom}`;
        showToast(`✅ ${membre.prenom} ${membre.nom} envoyé à ${cibleName}`);
      }

      // 🔹 Message WhatsApp
      let message = `👋 Bonjour ${responsablePrenom}!\n\n`;
      message += `Une personne précieuse t’est confiée pour l’accompagnement.\n\n`;
      message += `👤 Nom: ${membre.prenom} ${membre.nom}\n`;
      message += `📱 Téléphone: ${membre.telephone || "—"}\n`;
      message += `🏙️ Ville: ${membre.ville || "—"}\n`;
      message += `✨ Raison de la venue: ${membre.statut_initial || "—"}\n`;
      message += `💬 WhatsApp: ${membre.is_whatsapp ? "Oui" : "Non"}\n`;
      message += `🎗️ Sexe: ${membre.sexe || "—"}\n`; 
      message += `❓Besoin: ${
      membre.besoin
        ? (() => {
            try {
              const besoins = typeof membre.besoin === "string" ? JSON.parse(membre.besoin) : membre.besoin;
              return Array.isArray(besoins) ? besoins.join(", ") : besoins;
            } catch (e) {
              return membre.besoin; // au cas où ce n'est pas du JSON
            }
          })()
        : "—"
    }\n`;
      message += `📝 Infos supplémentaires: ${membre.infos_supplementaires || "—"}\n\n`;
      message += "Merci pour ton accompagnement ❤️";

      const phone = responsableTelephone.replace(/\D/g, "");
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, "_blank");

    } catch (err) {
      console.error("Erreur sendToWhatsapp:", err.message);
      alert(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={sendToWhatsapp}
      disabled={loading}
      className={`w-full text-white font-bold px-4 py-2 rounded-lg shadow-lg ${
        loading ? "bg-gray-400 cursor-not-allowed" : "bg-green-500 hover:bg-green-600"
      }`}
    >
      {loading ? "Envoi..." : "📤 Envoyer par WhatsApp"}
    </button>
  );
}
