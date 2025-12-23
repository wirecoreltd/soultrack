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
        const { data: cellule, error } = await supabase.from("cellules").select("id, responsable_id").eq("id", cible.id).single();
        if (error || !cellule?.responsable_id) throw new Error("Responsable de cellule introuvable");

        const { data: resp, error: respError } = await supabase.from("profiles").select("prenom, telephone").eq("id", cellule.responsable_id).single();
        if (respError || !resp?.telephone) throw new Error("Numéro WhatsApp invalide");
        responsablePrenom = resp.prenom;
        responsableTelephone = resp.telephone;
      }

      if (type === "conseiller") {
        if (!cible.telephone) throw new Error("Numéro WhatsApp invalide");
        responsablePrenom = cible.prenom;
        responsableTelephone = cible.telephone;
      }

      // 🔹 Créer suivi
      const suiviData = {
        membre_id: membre.id,
        prenom: membre.prenom,
        nom: membre.nom,
        telephone: membre.telephone,
        ville: membre.ville,
        besoin: membre.besoin,
        infos_supplementaires: membre.infos_supplementaires,
        statut_suivis: statutIds.envoye,
        is_whatsapp: true,
        cellule_id: type === "cellule" ? cible.id : null,
        conseiller_id: type === "conseiller" ? cible.id : null,
        responsable: responsablePrenom,
        created_at: new Date().toISOString(),
      };

      const { data: insertedSuivi, error: insertError } = await supabase.from("suivis_membres").insert([suiviData]).select().single();
      if (insertError) throw insertError;

      // 🔹 Mettre à jour le membre
      const { data: updatedMember, error: updateError } = await supabase.from("membres_complets")
        .update({ statut: "actif", statut_suivis: statutIds.envoye })
        .eq("id", membre.id)
        .select()
        .single();
      if (updateError) throw updateError;

      if (onEnvoyer) onEnvoyer(updatedMember);

      if (showToast) showToast(`✅ ${membre.prenom} ${membre.nom} envoyé à ${responsablePrenom}`);

      // 🔹 Message WhatsApp
      let message = `👋 Bonjour ${responsablePrenom}!\n\n`;
      message += `✨ Un nouveau membre est placé sous tes soins.\n\n`;
      message += `👤 Nom: ${membre.prenom} ${membre.nom}\n`;
      message += `⚥ Sexe: ${membre.sexe || "—"}\n`;
      message += `📱 Téléphone: ${membre.telephone || "—"}\n`;
      message += `💬 WhatsApp: ${membre.is_whatsapp ? "Oui" : "Non"}\n`;
      message += `🏙 Ville: ${membre.ville || "—"}\n`;
      message += `🙏 Besoin: ${Array.isArray(membre.besoin) ? membre.besoin.join(", ") : membre.besoin || "—"}\n`;
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
      className={`w-full text-white font-bold px-4 py-2 rounded-lg shadow-lg ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-green-500 hover:bg-green-600"}`}
    >
      {loading ? "Envoi..." : "📤 Envoyer par WhatsApp"}
    </button>
  );
}
