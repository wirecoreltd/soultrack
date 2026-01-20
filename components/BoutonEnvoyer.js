"use client";
import { useState } from "react";
import supabase from "../lib/supabaseClient";

export default function BoutonEnvoyer({ membre, type = "cellule", cible, session, onEnvoyer, showToast, removeFromNouveaux }) {
  const [loading, setLoading] = useState(false);
  const [showDuplicatePopup, setShowDuplicatePopup] = useState(false);
  const [duplicateMember, setDuplicateMember] = useState(null);

  const statutIds = { envoye: 1, en_attente: 2, integrer: 3, refus: 4 };

  // ---------------- Vérifie et envoie ----------------
  const handleSendClick = async () => {
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
      // 🔹 Vérification doublon par téléphone
      const { data: duplicate, error } = await supabase
        .from("membres_complets")
        .select("id")
        .eq("telephone", membre.telephone)
        .single();

      if (error && error.code !== "PGRST116") throw error; // code 116 = pas trouvé

      if (duplicate) {
        // 🔹 Si doublon, popup
        setDuplicateMember(membre);
        setShowDuplicatePopup(true);
        setLoading(false);
        return;
      }

      // 🔹 Pas de doublon : envoi normal
      await sendToWhatsapp();
    } catch (err) {
      console.error(err);
      alert(`❌ ${err.message}`);
      setLoading(false);
    }
  };

  // ---------------- Fonction envoi WhatsApp ----------------
  const sendToWhatsapp = async () => {
    try {
      let responsablePrenom = "";
      let responsableTelephone = "";

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
        cible.cellule_full = cellule.cellule_full;
      }

      if (type === "conseiller") {
        if (!cible.telephone) throw new Error("Numéro WhatsApp invalide");
        responsablePrenom = cible.prenom;
        responsableTelephone = cible.telephone;
      }

      // 🔹 Met à jour le membre
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

      // 🔹 Callback
      if (onEnvoyer) onEnvoyer(updatedMember);

      if (showToast) {
        const cibleName = type === "cellule" ? cible.cellule_full : `${cible.prenom} ${cible.nom}`;
        showToast(`✅ ${membre.prenom} ${membre.nom} envoyé à ${cibleName}`);
      }

      // 🔹 Message WhatsApp
      let message = `👋 Bonjour ${responsablePrenom}!\n\n`;
      message += `Une personne précieuse t’est confiée pour l’accompagnement.\n\n`;
      message += `👤 Nom: ${membre.prenom} ${membre.nom}\n`;
      message += `🎗️ Sexe: ${membre.sexe || "—"}\n`;
      message += `📱 Téléphone: ${membre.telephone || "—"}\n`;
      message += `💬 WhatsApp: ${membre.is_whatsapp ? "Oui" : "Non"}\n`;
      message += `🏙️ Ville: ${membre.ville || "—"}\n`;
      message += `✨ Raison de la venue: ${membre.statut_initial || "—"}\n`;
      message += `🙏 Prière du salut: ${membre.priere_salut || "—"}\n`;
      message += `☀️ Type de conversion: ${membre.type_conversion || "—"}\n`;
      message += `❓Besoin: ${membre.besoin || "—"}\n`;
      message += `📝 Infos supplémentaires: ${membre.infos_supplementaires || "—"}\n\n`;
      message += "Merci pour ton accompagnement ❤️";

      const phone = responsableTelephone.replace(/\D/g, "");
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, "_blank");

    } catch (err) {
      console.error(err);
      alert(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // ---------------- Supprimer de la section Nouveau ----------------
  const handleRemoveFromNouveau = () => {
    if (removeFromNouveaux) removeFromNouveaux(membre.id);
    setShowDuplicatePopup(false);
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

      {/* ---------------- Popup doublon ---------------- */}
      {showDuplicatePopup && duplicateMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 w-80 text-center space-y-4">
            <p className="font-semibold">⚠️ Ce contact existe déjà dans la base !</p>
            <p className="text-sm text-gray-600">Voulez-vous l'envoyer quand même ou le retirer de la section Nouveau ?</p>
            <div className="flex justify-between gap-2 mt-2">
              <button
                onClick={async () => { setShowDuplicatePopup(false); await sendToWhatsapp(); }}
                className="flex-1 bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
              >
                Envoyer quand même
              </button>
              <button
                onClick={handleRemoveFromNouveau}
                className="flex-1 bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
              >
                Retirer de la section Nouveau
              </button>
              <button
                onClick={() => setShowDuplicatePopup(false)}
                className="flex-1 bg-gray-300 text-black px-2 py-1 rounded hover:bg-gray-400"
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
