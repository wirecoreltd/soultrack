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
}) {
  const [loading, setLoading] = useState(false);
  const [showDoublonPopup, setShowDoublonPopup] = useState(false);
  const [doublonDetected, setDoublonDetected] = useState(false);

  const [showWhatsappPopup, setShowWhatsappPopup] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [currentMessage, setCurrentMessage] = useState("");

  const statutIds = { envoye: 1, en_attente: 2, integrer: 3, refus: 4 };

  // 🔹 Envoi WhatsApp
  const sendWhatsApp = (phone, message) => {
    if (!phone) {
      alert("❌ Numéro invalide");
      return;
    }

    const num = phone.replace(/\D/g, "");
    const url = `https://wa.me/${num}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  // 🔹 Vérification doublon
  const checkDoublon = async () => {
    if (!membre.telephone) return false;

    const { data, error } = await supabase
      .from("membres_complets")
      .select("id")
      .eq("telephone", membre.telephone)
      .neq("id", membre.id);

    if (error) {
      alert("❌ Erreur vérification doublon");
      return false;
    }

    return data.length > 0;
  };

  // 🔹 Envoi final WhatsApp
  const sendToWhatsapp = () => {
    if (!phoneNumber) {
      alert("❌ Numéro invalide");
      return;
    }

    sendWhatsApp(phoneNumber, currentMessage);
  };

  const handleClick = async () => {
    if (!session) {
      alert("❌ Vous devez être connecté.");
      return;
    }

    try {
      // 🔹 Doublon
      if (await checkDoublon()) {
        setDoublonDetected(true);
        setShowDoublonPopup(true);
        return;
      }

      // 🔹 Responsable
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

      // 🔹 Message
      const message = `👋 Bonjour ${responsablePrenom},

Nous te confions cette nouvelle personne avec joie 🙏  
Merci pour ton engagement et ton cœur pour le suivi des âmes ✨

📅 Date de Création : ${new Date(
        membre.created_at
      ).toLocaleString("fr-FR")}

👤 Nom : ${membre.prenom} ${membre.nom}
🏙️ Ville : ${membre.ville || "—"}
🎗️ Sexe : ${membre.sexe || "—"}
⏳ Age : ${membre.age || "—"}
📱 Téléphone : ${membre.telephone || "—"}
💬 WhatsApp : ${membre.is_whatsapp ? "Oui" : "Non"}

✨ Raison : ${membre.statut_initial || "—"}
🙏 Prière du salut : ${membre.priere_salut ? "Oui" : "Non"}
☀️ Type : ${membre.type_conversion || "—"}

📝 Infos : ${membre.infos_supplementaires || "—"}

Merci pour ton accompagnement ❤️`;

      // 🔹 Afficher popup WhatsApp
      setCurrentMessage(message);
      setPhoneNumber(responsableTelephone || "");
      setShowWhatsappPopup(true);

      // 🔹 Mise à jour DB
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
              : responsablePrenom,
          suivi_responsable_id:
            type === "conseiller" ? cible.id : null,
          etat_contact: "Existant",
          date_envoi_suivi: now,
        })
        .eq("id", membre.id)
        .select()
        .single();

      if (error) {
        console.error(error);
        alert("❌ Erreur mise à jour");
        return;
      }

      if (onEnvoyer) onEnvoyer(data);

      if (showToast)
        showToast(
          `✅ ${membre.prenom} ${membre.nom} prêt à être envoyé`
        );
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setShowDoublonPopup(false);
      setDoublonDetected(false);
    }
  };

  return (
    <>
      {/* 🔹 Bouton principal */}
      <button
        onClick={handleClick}
        disabled={loading}
        className={`w-full text-white font-bold px-4 py-2 rounded-lg shadow-lg ${
          loading
            ? "bg-gray-400"
            : "bg-green-500 hover:bg-green-600"
        }`}
      >
        📤 Envoyer par WhatsApp
      </button>

      {/* 🔹 Popup Doublon */}
      {showDoublonPopup && doublonDetected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-96 text-center">
            <h3 className="font-bold mb-3">
              ⚠️ Doublon détecté
            </h3>
            <p className="mb-4">
              Ce numéro existe déjà.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDoublonPopup(false)}
                className="flex-1 bg-gray-300 py-2 rounded"
              >
                Annuler
              </button>

              <button
                onClick={() => {
                  setShowDoublonPopup(false);
                  setShowWhatsappPopup(true);
                }}
                className="flex-1 bg-green-500 text-white py-2 rounded"
              >
                Envoyer quand même
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🔹 Popup WhatsApp */}
      {showWhatsappPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-xl">
            <h2 className="text-xl font-bold mb-3">
              Envoyer le membre
            </h2>

            <p className="mb-4 text-gray-700">
              Vérifiez ou modifiez le numéro avant envoi.
            </p>

            <input
              type="text"
              value={phoneNumber}
              onChange={(e) =>
                setPhoneNumber(e.target.value)
              }
              className="w-full border rounded-xl px-4 py-3 mb-4"
            />

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowWhatsappPopup(false);
                  setPhoneNumber("");
                }}
                className="flex-1 bg-gray-300 py-3 rounded-xl"
              >
                Annuler
              </button>

              <button
                onClick={() => {
                  sendToWhatsapp();
                  setShowWhatsappPopup(false);
                  setPhoneNumber("");
                }}
                className="flex-1 bg-green-500 text-white py-3 rounded-xl"
              >
                Envoyer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
