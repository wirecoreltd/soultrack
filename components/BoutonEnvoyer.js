"use client";
import { useState } from "react";
import supabase from "../lib/supabaseClient";

export default function BoutonEnvoyer({ membre, type = "cellule", cible, session, onEnvoyer, removeFromNouveaux, showToast, isDuplicate }) {
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

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

      if (onEnvoyer) onEnvoyer(updatedMember);

      if (showToast) {
        const cibleName = type === "cellule" ? cible.cellule_full : `${cible.prenom} ${cible.nom}`;
        showToast(`✅ ${membre.prenom} ${membre.nom} envoyé à ${cibleName}`);
      }

      // 🔹 Message WhatsApp
      let message = `👋 Bonjour ${responsablePrenom}!\n\n`;
      message += `Une personne précieuse t’est confiée pour l’accompagnement.\n\n`;
      message += `👤 Nom: ${membre.prenom} ${membre.nom}\n📱 Téléphone: ${membre.telephone || "—"}\n🏙️ Ville: ${membre.ville || "—"}\n🙏 Prière du salut: ${membre.priere_salut || "—"}`;
      const phone = responsableTelephone.replace(/\D/g, "");
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, "_blank");

      setShowPopup(false);
    } catch (err) {
      console.error("Erreur sendToWhatsapp:", err.message);
      alert(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isDuplicate) {
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

  // 🔹 Si doublon, afficher le popup
  return (
    <>
      <button
        onClick={() => setShowPopup(true)}
        className="w-full text-white font-bold px-4 py-2 rounded-lg shadow-lg bg-red-500 hover:bg-red-600"
      >
        ⚠️ Doublon détecté
      </button>

      {showPopup && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-4 w-80 shadow-lg space-y-3">
            <p className="text-sm text-gray-800">
              Le numéro <strong>{membre.telephone}</strong> existe déjà dans la base.
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={sendToWhatsapp}
                className="w-full bg-green-500 text-white font-semibold py-2 rounded hover:bg-green-600"
              >
                📤 Envoyer quand même
              </button>
              <button
                onClick={() => {
                  if (removeFromNouveaux) removeFromNouveaux();
                  setShowPopup(false);
                }}
                className="w-full bg-gray-200 text-black font-semibold py-2 rounded hover:bg-gray-300"
              >
                ❌ Retirer de la section Nouveau
              </button>
              <button
                onClick={() => setShowPopup(false)}
                className="w-full bg-blue-500 text-white font-semibold py-2 rounded hover:bg-blue-600"
              >
                ✖ Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
