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

      // Vérifier si le membre existe déjà
      const { data: existing, error: selectError } = await supabase
        .from("suivis_membres")
        .select("*")
        .eq("telephone", membre.telephone || "");
      if (selectError) throw selectError;
      console.log("DEBUG: Existing suivis_membres:", existing);

      if (existing.length > 0) {
        alert(`⚠️ Le contact ${membre.prenom} ${membre.nom} est déjà suivi.`);
        setLoading(false);
        return;
      }

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
      } else if (type === "conseiller") {
        suiviData.conseiller_id = cible?.id || null;
        suiviData.responsable = `${cible?.prenom || ""} ${cible?.nom || ""}`.trim() || "—";
      }

      console.log("DEBUG: Données à insérer:", suiviData);

      const { data: insertedData, error: insertError } = await supabase.from("suivis_membres").insert([suiviData]).select().single();
      if (insertError) throw insertError;
      console.log("DEBUG: Inserted Data:", insertedData);

      const { data: updatedMember, error: updateMemberError } = await supabase
        .from("membres")
        .update({ statut: "ancien" })
        .eq("id", membre.id)
        .select()
        .single();
      if (updateMemberError) throw updateMemberError;
      console.log("DEBUG: Membre mis à jour:", updatedMember);

      if (onEnvoyer) onEnvoyer(updatedMember);

      if (showToast) showToast(`✅ ${membre.prenom} ${membre.nom} envoyé à ${type === "cellule" ? cible.cellule : `${cible.prenom} ${cible.nom}`}`);

      const phone = (cible?.telephone || "").replace(/\D/g, "");
      if (phone) {
        let message = `👋 Bonjour ${cible?.responsable || (cible?.prenom || "")} !\n\n`;
        message += `✨ Un nouveau membre est placé sous tes soins pour être accompagné et encouragé.\n\n`;
        message += `- 👤 Nom: ${membre.prenom} ${membre.nom}\n`;
        message += `- 📱 Téléphone: ${membre.telephone || "—"}\n`;
        message += `- 🏙 Ville: ${membre.ville || "—"}\n`;
        message += `- 🙏 Besoin: ${Array.isArray(membre.besoin) ? membre.besoin.join(", ") : membre.besoin || "—"}\n\n`;
        message += "Merci pour ton accompagnement";
        message += `Ton engagement fait une vraie différence ! ❤️`;

        window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, "_blank");
      }

    } catch (err) {
      console.error("❌ Erreur sendToWhatsapp:", err);
      alert(`❌ Une erreur est survenue lors de l'envoi. Détails dans console.`);
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
