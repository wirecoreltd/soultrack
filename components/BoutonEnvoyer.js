"use client";
import { useState } from "react";
import supabase from "../lib/supabaseClient";

export default function BoutonEnvoyer({ membre, type = "cellule", cible, session, onEnvoyer, showToast }) {
  const [loading, setLoading] = useState(false);
  const [showDoublonPopup, setShowDoublonPopup] = useState(false);
  const [doublonDetected, setDoublonDetected] = useState(false);

  const statutIds = { envoye: 1, en_attente: 2, integrer: 3, refus: 4 };

  // Vérification de doublon
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

      if (type === "numero") {
        responsablePrenom = "Responsable";
        responsableTelephone = cible; // numéro saisi
      }

      // 🔹 Message WhatsApp complet
      let message = `👋 Bonjour ${responsablePrenom}!\n\n`;
      message += `Une personne précieuse t’est confiée pour l’accompagnement.\n\n`;
      message += `👤 Nom: ${membre.prenom} ${membre.nom}\n`;
      message += `🎗️ Sexe: ${membre.sexe || "—"}\n`; 
      message += `⏳ Age: ${membre.age || "—"}\n`; 
      message += `📱 Téléphone: ${membre.telephone || "—"}\n`;
      message += `💬 WhatsApp: ${membre.is_whatsapp ? "Oui" : "Non"}\n`;
      message += `🏙️ Ville: ${membre.ville || "—"}\n`;
      message += `✨ Raison de la venue: ${membre.statut_initial || "—"}\n`;   
      message += `🙏 Prière du salut: ${membre.priere_salut || "—"}\n`; 
      message += `☀️ Type de conversion: ${membre.type_conversion || "—"}\n`;
      message += `❓Besoin: ${
        membre.besoin
          ? (() => {
              try {
                const besoins = typeof membre.besoin === "string" ? JSON.parse(membre.besoin) : membre.besoin;
                return Array.isArray(besoins) ? besoins.join(", ") : besoins;
              } catch {
                return membre.besoin;
              }
            })()
          : "—"
      }\n`;
      message += `📝 Infos supplémentaires: ${membre.infos_supplementaires || "—"}\n\n`;
      message += "Merci pour ton accompagnement ❤️";

      const phone = responsableTelephone?.replace(/\D/g, "");
      if (!phone) {
        alert("❌ Le numéro WhatsApp est invalide.");
        setLoading(false);
        return;
      }

      // Ouvrir WhatsApp avant l'update pour éviter le blocage
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, "_blank");

      // 🔹 Mettre à jour le membre dans Supabase
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
          etat_contact: "Existant",
          date_envoi_suivi: new Date().toISOString() 
        })
        .eq("id", membre.id)
        .select()
        .single();

      if (onEnvoyer) onEnvoyer(updatedMember);
      if (showToast) showToast(`✅ ${membre.prenom} ${membre.nom} envoyé à ${
        type === "cellule" ? cible.cellule_full : type === "conseiller" ? `${cible.prenom} ${cible.nom}` : cible
      }`);
      
    } catch (err) {
      console.error(err);
      alert(`❌ ${err.message}`);
    } finally {
      setLoading(false);
      setShowDoublonPopup(false);
      setDoublonDetected(false);
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

      {showDoublonPopup && doublonDetected && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity">
          <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-xl p-6 w-96 max-w-[90%] text-center animate-fadeIn">
            <h3 className="text-xl font-bold mb-3 text-gray-800">⚠️ Doublon détecté</h3>
            <p className="mb-6 text-gray-700">Ce numéro ({membre.telephone}) existe déjà dans la base.</p>
            <div className="flex justify-center gap-3">
              <button
                onClick={sendToWhatsapp}
                className="flex-1 bg-green-500 text-white font-semibold px-4 py-2 rounded-lg hover:bg-green-600 transition"
              >
                Envoyer quand même
              </button>
              <button
                onClick={() => setShowDoublonPopup(false)}
                className="flex-1 bg-gray-300 text-gray-800 font-semibold px-4 py-2 rounded-lg hover:bg-gray-400 transition"
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
