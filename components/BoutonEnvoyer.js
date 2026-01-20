"use client";
import { useState } from "react";
import supabase from "../lib/supabaseClient";

export default function BoutonEnvoyer({ membre, type = "cellule", cible, session, onEnvoyer, showToast }) {
  const [loading, setLoading] = useState(false);
  const [showDuplicatePopup, setShowDuplicatePopup] = useState(false);
  const [duplicateMember, setDuplicateMember] = useState(null);

  const statutIds = { envoye: 1, en_attente: 2, integrer: 3, refus: 4 };

  // 🔹 Vérifie doublon par téléphone
  const checkDuplicate = async () => {
    const { data, error } = await supabase
      .from("membres_complets")
      .select("*")
      .eq("telephone", membre.telephone)
      .single();

    if (error) return false;
    return data ? true : false;
  };

  const handleSendClick = async () => {
    if (!session) {
      alert("❌ Vous devez être connecté.");
      return;
    }
    if (!cible?.id) {
      alert("❌ Cible invalide.");
      return;
    }

    const isDuplicate = await checkDuplicate();

    if (isDuplicate) {
      setDuplicateMember(membre);
      setShowDuplicatePopup(true);
    } else {
      sendToWhatsapp();
    }
  };

  const handleDuplicateAction = (action) => {
    if (action === "send") {
      sendToWhatsapp();
    } else if (action === "remove") {
      if (onEnvoyer) onEnvoyer(null, membre.id); // on indique qu'il faut retirer de la section Nouveau
      if (showToast) showToast(`🗑️ ${membre.prenom} ${membre.nom} retiré de Nouveau`);
    }
    setShowDuplicatePopup(false);
    setDuplicateMember(null);
  };

  const sendToWhatsapp = async () => {
    setLoading(true);
    try {
      let responsablePrenom = "";
      let responsableTelephone = "";

      // 🔹 Récupérer responsable selon type
      if (type === "cellule") {
        const { data: cellule } = await supabase
          .from("cellules")
          .select("id, responsable_id, cellule_full")
          .eq("id", cible.id)
          .single();

        if (!cellule?.responsable_id) throw new Error("Responsable de cellule introuvable");

        const { data: resp } = await supabase
          .from("profiles")
          .select("prenom, telephone")
          .eq("id", cellule.responsable_id)
          .single();

        responsablePrenom = resp?.prenom || "";
        responsableTelephone = resp?.telephone || "";
        cible.cellule_full = cellule.cellule_full;
      }

      if (type === "conseiller") {
        responsablePrenom = cible.prenom;
        responsableTelephone = cible.telephone;
      }

      // 🔹 Mettre à jour le membre
      const { data: updatedMember, error: updateError } = await supabase
        .from("membres_complets")
        .update({
          statut: "actif",
          statut_suivis: statutIds.envoye,
          cellule_id: type === "cellule" ? cible.id : null,
          conseiller_id: type === "conseiller" ? cible.id : null,
          suivi_cellule_nom: type === "cellule" ? cible.cellule_full : null,
          suivi_responsable: type === "conseiller" ? `${cible.prenom} ${cible.nom}` : responsablePrenom,
          suivi_responsable_id: type === "conseiller" ? cible.id : null,
          etat_contact: "Existant"
        })
        .eq("id", membre.id)
        .select()
        .single();
      if (updateError) throw updateError;

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
      message += `💬 WhatsApp: ${membre.is_whatsapp ? "Oui" : "Non"}\n`;
      message += `🏙️ Ville: ${membre.ville || "—"}\n`;
      message += `✨ Raison de la venue: ${membre.statut_initial || "—"}\n`;
      const phone = responsableTelephone.replace(/\D/g, "");
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, "_blank");

    } catch (err) {
      console.error(err);
      alert(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={handleSendClick}
        disabled={loading}
        className={`w-full text-white font-bold px-4 py-2 rounded-lg shadow-lg ${
          loading ? "bg-gray-400 cursor-not-allowed" : "bg-green-500 hover:bg-green-600"
        }`}
      >
        {loading ? "Envoi..." : "📤 Envoyer par WhatsApp"}
      </button>

      {/* Popup doublon */}
      {showDuplicatePopup && duplicateMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 max-w-sm w-full space-y-4">
            <p className="text-red-600 font-semibold">
              ⚠️ Ce numéro existe déjà : {duplicateMember.telephone}
            </p>
            <p className="font-semibold">{duplicateMember.prenom} {duplicateMember.nom}</p>
            <p className="text-sm text-gray-500">Vous pouvez envoyer quand même ou le retirer de la section Nouveau.</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => handleDuplicateAction("send")}
                className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
              >
                Envoyer quand même
              </button>
              <button
                onClick={() => handleDuplicateAction("remove")}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
              >
                Supprimer
              </button>
              <button
                onClick={() => setShowDuplicatePopup(false)}
                className="bg-gray-300 hover:bg-gray-400 text-black px-3 py-1 rounded"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
