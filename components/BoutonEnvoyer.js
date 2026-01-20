"use client";
import { useState } from "react";
import supabase from "../lib/supabaseClient";

export default function BoutonEnvoyer({
  membre,
  type = "cellule",
  cible,
  session,
  onEnvoyer,
  showToast,
  filteredNouveaux,
  setFilteredNouveaux
}) {
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [isDuplicate, setIsDuplicate] = useState(false);

  const statutIds = { envoye: 1, en_attente: 2, integrer: 3, refus: 4 };

  const checkDuplicate = async () => {
    if (!membre.telephone) return false;

    const { data, error } = await supabase
      .from("membres_complets")
      .select("id")
      .eq("telephone", membre.telephone)
      .single();

    return !!data; // true si doublon
  };

  const handleSend = async () => {
    setShowPopup(false);
    setLoading(true);

    try {
      if (!session) throw new Error("Vous devez être connecté.");
      if (!cible?.id) throw new Error("Cible invalide.");

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
        cible.cellule_full = cellule.cellule_full;
      }

      if (type === "conseiller") {
        if (!cible.telephone) throw new Error("Numéro WhatsApp invalide");
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

      // 🔹 Retirer instantanément de la section Nouveau
      if (setFilteredNouveaux) {
        setFilteredNouveaux(prev => prev.filter(m => m.id !== membre.id));
      }

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
      console.error("Erreur sendToWhatsapp:", err.message);
      alert(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = () => {
    // Retirer de la section Nouveau uniquement
    if (setFilteredNouveaux) {
      setFilteredNouveaux(prev => prev.filter(m => m.id !== membre.id));
    }
    showToast?.(`❌ ${membre.prenom} ${membre.nom} retiré de la section Nouveau`);
    setShowPopup(false);
  };

  const handleClick = async () => {
    const duplicate = await checkDuplicate();
    if (duplicate) {
      setIsDuplicate(true);
      setShowPopup(true);
    } else {
      handleSend();
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        disabled={loading}
        className={`w-full text-white font-bold px-4 py-2 rounded-lg shadow-lg ${
          loading ? "bg-gray-400 cursor-not-allowed" : "bg-green-500 hover:bg-green-600"
        }`}
      >
        {loading ? "Envoi..." : "📤 Envoyer par WhatsApp"}
      </button>

      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-4 w-80 shadow-lg">
            <h2 className="font-semibold text-lg mb-2">Doublon détecté</h2>
            <p className="mb-4 text-sm">
              Ce contact existe déjà dans la base ({membre.telephone}).<br/>
              Que souhaitez-vous faire ?
            </p>
            <div className="flex justify-between gap-2">
              <button
                onClick={handleSend}
                className="flex-1 bg-green-500 text-white py-2 rounded hover:bg-green-600"
              >
                Envoyer quand même
              </button>
              <button
                onClick={handleRemove}
                className="flex-1 bg-red-500 text-white py-2 rounded hover:bg-red-600"
              >
                Retirer
              </button>
              <button
                onClick={() => setShowPopup(false)}
                className="flex-1 bg-gray-300 text-black py-2 rounded hover:bg-gray-400"
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
