"use client";

import { useState } from "react";
import supabase from "../lib/supabaseClient";

export default function BoutonEnvoyer({ membre, type = "cellule", cible, session, onEnvoyer, showToast }) {
  const [loading, setLoading] = useState(false);

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
      // 🔹 Vérification si déjà envoyé
      const { data: existing, error: selectError } = await supabase
        .from("suivis_membres")
        .select("*")
        .eq("membre_id", membre.id);

      if (selectError) throw selectError;

      if (existing.length > 0 && !force) {
        alert(`⚠️ Le contact ${membre.prenom} ${membre.nom} est déjà dans la liste des suivis.`);
        setLoading(false);
        return;
      }

      // 🔹 Préparer le suivi avec protections
      const suiviData = {
        membre_id: membre.id,
        prenom: membre.prenom || null,
        nom: membre.nom || null,
        telephone: membre.telephone || null,
        is_whatsapp: true,
        ville: membre.ville || null,
        besoin: membre.besoin || null,
        infos_supplementaires: membre.infos_supplementaires || null,
        statut_suivis: 1, // 1 = "envoye"
        created_at: new Date().toISOString(),
      };

      if (type === "cellule") {
        suiviData.cellule_id = cible.id || null;
        suiviData.cellule_nom = cible.cellule || null;
        suiviData.responsable = typeof cible.responsable === "string" ? cible.responsable : null;
      } else if (type === "conseiller") {
        suiviData.conseiller_id = cible.id || null;
        const fullName = `${cible.prenom || ""} ${cible.nom || ""}`.trim();
        suiviData.responsable = fullName.length > 0 ? fullName : null;
      }

      // 🔹 Insérer le suivi
      const { error: insertError } = await supabase.from("suivis_membres").insert([suiviData]);
      if (insertError) throw insertError;

      // 🔹 Mettre à jour le membre
      const { error: updateMemberError } = await supabase
        .from("membres")
        .update({ statut: "actif" })
        .eq("id", membre.id);
      if (updateMemberError) throw updateMemberError;

      // 🔹 Callback pour mise à jour locale
      if (onEnvoyer) onEnvoyer(membre.id, type, cible, "actif");

      // 🔹 Préparer le message WhatsApp
      const phoneRaw = cible.telephone || "";
      const phone = phoneRaw.replace(/\D/g, "");
      if (!phone) {
        alert("❌ La cible n'a pas de numéro valide.");
      } else {
        let message = `👋 Salut ${suiviData.responsable || ""}!\n\n`;
        message += `🙏 Nouveau membre à suivre :\n`;
        message += `- 👤 Nom : ${membre.prenom || "—"} ${membre.nom || "—"}\n`;
        message += `- 📱 Téléphone : ${membre.telephone || "—"}\n`;
        message += `- 🏙 Ville : ${membre.ville || "—"}\n`;
        message += `- 🙏 Besoin : ${membre.besoin || "—"}\n\n🙏 Merci !`;
        window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, "_blank");
      }

      if (showToast) showToast(`✅ ${membre.prenom || "Le membre"} a été envoyé à ${type === "cellule" ? cible.cellule : `${cible.prenom || ""} ${cible.nom || ""}`.trim()} !`);

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
