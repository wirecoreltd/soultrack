"use client";
import { useState } from "react";
import supabase from "../lib/supabaseClient";

export default function BoutonEnvoyer({ membre, type = "cellule", cible, session, onEnvoyer, onSupprimer, showToast }) {
  const [loading, setLoading] = useState(false);
  const [showDoublonPopup, setShowDoublonPopup] = useState(false);
  const [doublonDetected, setDoublonDetected] = useState(false);

  const statutIds = { envoye: 1, en_attente: 2, integrer: 3, refus: 4 };

  const checkDoublon = async () => {
    if (!membre.telephone) return false;
    const { data, error } = await supabase
      .from("membres_complets")
      .select("id")
      .eq("telephone", membre.telephone)
      .neq("id", membre.id);

    if (error) {
      alert("❌ Erreur lors de la vérification des doublons");
      return false;
    }

    return data.length > 0;
  };

  const handleClick = async () => {
    if (!session) {
      alert("❌ Vous devez être connecté.");
      return;
    }
    const isDoublon = await checkDoublon();
    if (isDoublon) {
      setDoublonDetected(true);
      setShowDoublonPopup(true);
    } else {
      await sendToWhatsapp();
    }
  };

  const sendToWhatsapp = async () => {
    setLoading(true);
    try {
      let responsablePrenom = "";
      let responsableTelephone = "";

      // 🔹 Récupérer responsable
      if (type === "cellule") {
        const { data: cellule } = await supabase
          .from("cellules")
          .select("id, responsable_id, cellule_full")
          .eq("id", cible.id)
          .single();
        const { data: resp } = await supabase
          .from("profiles")
          .select("prenom, telephone")
          .eq("id", cellule.responsable_id)
          .single();
        responsablePrenom = resp.prenom;
        responsableTelephone = resp.telephone;
        cible.cellule_full = cellule.cellule_full;
      }
      if (type === "conseiller") {
        responsablePrenom = cible.prenom;
        responsableTelephone = cible.telephone;
      }

      // 🔹 Mettre à jour le membre
      const { data: updatedMember } = await supabase
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

      if (onEnvoyer) onEnvoyer(updatedMember);
      if (showToast) showToast(`✅ ${membre.prenom} ${membre.nom} envoyé à ${type === "cellule" ? cible.cellule_full : `${cible.prenom} ${cible.nom}`}`);

      // 🔹 Message WhatsApp
      let message = `👋 Bonjour ${responsablePrenom}!\n`;
      message += `👤 Nom: ${membre.prenom} ${membre.nom}\n📱 Téléphone: ${membre.telephone || "—"}\n`;
      const phone = responsableTelephone.replace(/\D/g, "");
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, "_blank");

    } catch (err) {
      console.error(err);
      alert(`❌ ${err.message}`);
    } finally {
      setLoading(false);
      setShowDoublonPopup(false);
      setDoublonDetected(false);
    }
  };

  const handleSupprimer = () => {
  if (onSupprimer) onSupprimer(membre.id);
  setShowDoublonPopup(false);
  setDoublonDetected(false);
};

  return (
    <>
      <button
        onClick={handleClick}
        disabled={loading}
        className={`w-full text-white font-bold px-4 py-2 rounded-lg shadow-lg ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-green-500 hover:bg-green-600"}`}
      >
        {loading ? "Envoi..." : "📤 Envoyer par WhatsApp"}
      </button>

      {/* 🔹 Popup Doublon */}
      {showDoublonPopup && doublonDetected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-80 text-center">
            <h3 className="text-lg font-bold mb-4">⚠️ Doublon détecté</h3>
            <p className="mb-4">Ce numéro ({membre.telephone}) existe déjà dans la base.</p>
            <div className="flex justify-between gap-2">
              <button
                onClick={sendToWhatsapp}
                className="flex-1 bg-green-500 text-white font-bold px-4 py-2 rounded hover:bg-green-600"
              >
                Envoyer quand même
              </button>
              <button
                onClick={() => setShowDoublonPopup(false)}
                className="flex-1 bg-gray-300 text-black font-bold px-4 py-2 rounded hover:bg-gray-400"
              >
                Annuler
              </button>
              <button
                onClick={handleSupprimer}
                className="flex-1 bg-red-500 text-white font-bold px-4 py-2 rounded hover:bg-red-600"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
