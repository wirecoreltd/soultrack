//components/BoutonEnvoyer.js✅

"use client";
import { useState } from "react";
import supabase from "../lib/supabaseClient";

export default function BoutonEnvoyer({ membre, type = "cellule", cible, session, onEnvoyer, showToast }) {
  const [loading, setLoading] = useState(false);
  const statutIds = { envoye: 1, "en attente": 2, integrer: 3, refus: 4 };

  const sendToWhatsapp = async () => {
    if (!session) return alert("❌ Vous devez être connecté.");
    if (!cible) return alert("❌ Sélectionnez une cible !");

    setLoading(true);
    try {
      console.log("DEBUG: Membre à envoyer:", membre);
      console.log("DEBUG: Type:", type, "Cible:", cible);

      // Vérifier si le membre existe déjà dans suivis_membres
      const { data: existing, error: selectError } = await supabase
        .from("suivis_membres")
        .select("*")
        .eq("telephone", membre.telephone || "");
      if (selectError) throw selectError;

      if (existing.length > 0) {
        alert(`⚠️ Le contact ${membre.prenom} ${membre.nom} est déjà suivi.`);
        setLoading(false);
        return;
      }

      // ================================
      // INSERTION DANS suivis_membres
      // ================================
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
        suiviData.cellule_id = cible?.id || null;
        suiviData.cellule_nom = cible?.cellule || "—";
        suiviData.responsable = cible?.responsable || "—";
      } else {
        suiviData.conseiller_id = cible?.id || null;
        suiviData.responsable = `${cible?.prenom || ""} ${cible?.nom || ""}`.trim() || "—";
      }

      await supabase.from("suivis_membres").insert([suiviData]);

      // ============================================
      // 🔥 MISE À JOUR DU MEMBRE DANS "membres"
      // AJOUT cellule_id OU conseiller_id
      // ============================================
      const updateData = { statut: "ancien" };

      if (type === "cellule") {
        updateData.cellule_id = cible?.id || null;
      } else {
        updateData.conseiller_id = cible?.id || null;
      }

      const { data: updatedMember, error: updateMemberError } = await supabase
        .from("membres")
        .update(updateData)
        .eq("id", membre.id)
        .select()
        .single();

      if (updateMemberError) throw updateMemberError;

      console.log("DEBUG: Membre mis à jour:", updatedMember);

      // Remonter la mise à jour au composant liste
      if (onEnvoyer) onEnvoyer(updatedMember);

      if (showToast)
        showToast(
          `✅ ${membre.prenom} ${membre.nom} envoyé à ${
            type === "cellule" ? cible.cellule : `${cible.prenom} ${cible.nom}`
          }`
        );

      // ======================
      // MESSAGE WHATSAPP
      // ======================
      const phone = (cible?.telephone || "").replace(/\D/g, "");
      if (phone) {
        let message = `👋 Bonjour ${cible?.responsable || cible?.prenom}! \n\n`;
        message += `✨ Un nouveau membre est placé sous tes soins.\n\n`;          
        message += `👤 Nom: ${membre.prenom} ${membre.nom}\n`;
        message += `📱 Téléphone: ${membre.telephone || "—"}\n`;
        message += `🏙 Ville: ${membre.ville || "—"}\n`;
        message += `🙏 Besoin: ${Array.isArray(membre.besoin) ? membre.besoin.join(", ") : membre.besoin || "—"}\n\n`;
        message += `Merci pour ton accompagnement ❤️`;

        window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, "_blank");
      }

    } catch (err) {
      console.error("❌ Erreur sendToWhatsapp:", err);
      alert(`❌ Une erreur est survenue lors de l'envoi.`);
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
