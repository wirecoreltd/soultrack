"use client";
import { useState } from "react";
import supabase from "../lib/supabaseClient";

export default function BoutonEnvoyer({
  membre,
  type = "cellule",
  cible,
  session,
  onEnvoyer,
  showToast
}) {
  const [loading, setLoading] = useState(false);
  const [showDoublonPopup, setShowDoublonPopup] = useState(false);
  const [doublonDetected, setDoublonDetected] = useState(false);

  const [showWhatsappPopup, setShowWhatsappPopup] = useState(false);
  const [manualPhone, setManualPhone] = useState("");
  const [messageToSend, setMessageToSend] = useState("");

  const statutIds = { envoye: 1, en_attente: 2, integrer: 3, refus: 4 };

  // Vérification doublon
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

  // Construction message + responsable
  const buildData = async () => {
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
      responsableTelephone = cible;
    }

    let message = `👋 Bonjour ${responsablePrenom}!\n\n`;
    message += `👤 Nom: ${membre.prenom} ${membre.nom}\n`;
    message += `🎗️ Sexe: ${membre.sexe || "—"}\n`;
    message += `⏳ Age: ${membre.age || "—"}\n`;
    message += `📱 Téléphone: ${membre.telephone || "—"}\n`;
    message += `💬 WhatsApp: ${membre.is_whatsapp ? "Oui" : "Non"}\n`;
    message += `🏙️ Ville: ${membre.ville || "—"}\n`;
    message += `✨ Raison de la venue: ${membre.statut_initial || "—"}\n`;
    message += `🙏 Prière du salut: ${membre.priere_salut || "—"}\n`;
    message += `❓Besoin: ${
      membre.besoin
        ? (() => {
            try {
              const besoins =
                typeof membre.besoin === "string"
                  ? JSON.parse(membre.besoin)
                  : membre.besoin;
              return Array.isArray(besoins)
                ? besoins.join(", ")
                : besoins;
            } catch {
              return membre.besoin;
            }
          })()
        : "—"
    }\n`;
    message += `📝 Infos supplémentaires: ${
      membre.infos_supplementaires || "—"
    }\n\n`;
    message += "Merci pour ton accompagnement ❤️";

    return {
      message,
      responsablePrenom,
      responsableTelephone
    };
  };

  const handleClick = async () => {
    if (!session) {
      alert("❌ Vous devez être connecté.");
      return;
    }

    try {
      setLoading(true);

      const { message, responsablePrenom, responsableTelephone } =
        await buildData();

      // 🔹 Vérification doublon
      if (await checkDoublon()) {
        setDoublonDetected(true);
        setShowDoublonPopup(true);
        setMessageToSend(message);
        setManualPhone(responsableTelephone || "");
        setLoading(false);
        return;
      }

      setMessageToSend(message);
      setManualPhone(responsableTelephone || "");
      setShowWhatsappPopup(true);
      setLoading(false);
    } catch (err) {
      console.error(err);
      alert(`❌ ${err.message}`);
      setLoading(false);
    }
  };

  // Envoi WhatsApp
  const sendToWhatsapp = async () => {
    const phone = manualPhone?.replace(/\D/g, "");

   const sendToWhatsapp = async () => {
  const phone = manualPhone?.replace(/\D/g, "");

  let whatsappLink;

  // ✅ Si numéro fourni → envoi direct
  if (phone) {
    whatsappLink = `https://wa.me/${phone}?text=${encodeURIComponent(
      messageToSend
    )}`;
  } else {
    // ✅ Si vide → ouvrir WhatsApp sans contact (choix manuel)
    whatsappLink = `https://wa.me/?text=${encodeURIComponent(
      messageToSend
    )}`;
  }

  window.open(whatsappLink, "_blank");

  try {
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from("membres_complets")
      .update({
        statut: "actif",
        statut_suivis: statutIds.envoye,
        cellule_id: type === "cellule" ? cible.id : null,
        conseiller_id: type === "conseiller" ? cible.id : null,
        suivi_cellule_nom:
          type === "cellule" ? cible.cellule_full : null,
        suivi_responsable:
          type === "conseiller"
            ? `${cible.prenom} ${cible.nom}`
            : null,
        suivi_responsable_id:
          type === "conseiller" ? cible.id : null,
        etat_contact: "Existant",
        date_envoi_suivi: now
      })
      .eq("id", membre.id)
      .select()
      .single();

    if (error) {
      console.error(error);
      alert("❌ Erreur update Supabase");
      return;
    }

    if (onEnvoyer) onEnvoyer(data);

    if (showToast) {
      showToast(`✅ ${membre.prenom} ${membre.nom} envoyé`);
    }
  } catch (err) {
    console.error(err);
  } finally {
    setShowWhatsappPopup(false);
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
          loading
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-green-500 hover:bg-green-600"
        }`}
      >
        {loading ? "Envoi..." : "📤 Envoyer par WhatsApp"}
      </button>

      {/* Popup doublon */}
      {showDoublonPopup && doublonDetected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-96 text-center">
            <h3 className="font-bold text-lg mb-3">⚠️ Doublon détecté</h3>
            <p className="mb-4">
              Ce numéro ({membre.telephone}) existe déjà.
            </p>

            <div className="flex gap-2">
              <button
                onClick={sendToWhatsapp}
                className="flex-1 bg-green-500 text-white py-2 rounded"
              >
                Envoyer quand même
              </button>

              <button
                onClick={() => setShowDoublonPopup(false)}
                className="flex-1 bg-gray-300 py-2 rounded"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Popup WhatsApp */}
      {showWhatsappPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <p className="text-gray-700 mb-4">
              Cliquez sur <b>Envoyer</b> si le contact figure déjà dans WhatsApp,
              ou saisissez un numéro manuellement.
            </p>

            <input
              type="text"
              value={manualPhone}
              onChange={(e) => setManualPhone(e.target.value)}
              placeholder="Numéro WhatsApp"
              className="w-full border p-2 rounded mb-4"
            />

            <div className="flex gap-2">
              <button
                onClick={sendToWhatsapp}
                className="flex-1 bg-green-500 text-white py-2 rounded"
              >
                Envoyer
              </button>

              <button
                onClick={() => setShowWhatsappPopup(false)}
                className="flex-1 bg-gray-300 py-2 rounded"
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
