"use client";
import { useState } from "react";
import supabase from "../lib/supabaseClient";

export default function BoutonEnvoyer({ membre, type = "cellule", cible, session, onEnvoyer, showToast }) {
  const [loading, setLoading] = useState(false);

  const statutIds = { envoye: 1, "en attente": 2, integrer: 3, refus: 4 };

  const sendToWhatsapp = async (force = false) => {
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
      // Vérification par numéro de téléphone
      const { data: existing, error: selectError } = await supabase
        .from("suivis_membres")
        .select("*")
        .eq("telephone", membre.telephone || "");

      if (selectError) throw selectError;

      if (existing.length > 0 && !force) {
        alert(`⚠️ Le contact ${membre.prenom} ${membre.nom} est déjà dans la liste des suivis.`);
        setLoading(false);
        return;
      }

      // Préparer l'objet de suivi
      const suiviData = {
        membre_id: membre.id,
        prenom: membre.prenom,
        nom: membre.nom,
        telephone: membre.telephone,
        is_whatsapp: true,
        ville: membre.ville,
        besoin: membre.besoin,
        infos_supplementaires: membre.infos_supplementaires,
        statut_suivis: statutIds["envoye"],
        created_at: new Date().toISOString(),
      };

      if (type === "cellule") {
        suiviData.cellule_id = cible.id;
        suiviData.cellule_nom = cible.cellule;
        suiviData.responsable = cible.responsable || null;
        cible.telephone = cible.telephone || membre.telephone || "";
      } else if (type === "conseiller") {
        suiviData.conseiller_id = cible.id;
        suiviData.responsable = `${cible.prenom || ""} ${cible.nom || ""}`.trim();
        cible.telephone = cible.telephone || membre.telephone || "";
      }

      // Insérer le suivi et récupérer l'objet complet avec id
      const { data: insertedData, error: insertError } = await supabase
        .from("suivis_membres")
        .insert([suiviData])
        .select()
        .single();
      if (insertError) throw insertError;

      // Mettre à jour le membre pour qu’il devienne actif
      const { error: updateMemberError } = await supabase
        .from("membres")
        .update({ statut: "actif" })
        .eq("id", membre.id);
      if (updateMemberError) throw updateMemberError;

      // Callback pour mise à jour locale
      if (onEnvoyer) onEnvoyer(insertedData);

      // Préparer message WhatsApp
      let message = `👋 Salut ${cible.responsable || (cible.prenom ? `${cible.prenom} ${cible.nom}` : "")}!\n\n`;
      message += `🙏 Nouveau membre à suivre :\n`;
      message += `- 👤 Nom : ${membre.prenom} ${membre.nom}\n`;
      message += `- 📱 Téléphone : ${membre.telephone || "—"}\n`;
      message += `- 🏙 Ville : ${membre.ville || "—"}\n`;
      message += `- 🙏 Besoin : ${Array.isArray(membre.besoin) ? membre.besoin.join(", ") : membre.besoin || "—"}\n\n🙏 Merci !`;

      const phone = (cible.telephone || "").replace(/\D/g, "");
      if (!phone) {
        alert("❌ La cible n'a pas de numéro WhatsApp valide !");
      } else {
        window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, "_blank");
        if (showToast)
          showToast(`✅ ${membre.prenom} ${membre.nom} a été envoyé à ${type === "cellule" ? cible.cellule : `${cible.prenom} ${cible.nom}`} !`);
      }

    } catch (err) {
      console.error("Erreur sendToWhatsapp:", err);
      alert("❌ Une erreur est survenue lors de l'envoi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={() => sendToWhatsapp()}
      disabled={loading}
      className={`w-full text-white font-bold px-4 py-2 rounded-lg shadow-lg transition-all ${
        loading ? "bg-gray-400 cursor-not-allowed" : "bg-green-500 hover:bg-green-600"
      }`}
    >
      {loading ? "Envoi..." : "📤 Envoyer par WhatsApp"}
    </button>
  );
}
