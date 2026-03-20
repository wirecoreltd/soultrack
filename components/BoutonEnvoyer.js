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

  // ✅ NOUVEAU (évangélisation)
  const [showWhatsappPopup, setShowWhatsappPopup] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");

  const statutIds = { envoye: 1, en_attente: 2, integrer: 3, refus: 4 };

  // =========================
  // ✅ WhatsApp
  const sendWhatsApp = (phone, message) => {
    if (!phone) {
      alert("❌ Numéro invalide");
      return;
    }

    const num = phone.replace(/\D/g, "");
    const url = `https://wa.me/${num}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  // =========================
  // ✅ Message suivi (responsable)
  const buildMessage = (responsablePrenom) => {
    return `👋 Bonjour ${responsablePrenom},

Nous te confions cette nouvelle personne avec joie 🙏  
Merci pour ton engagement et ton cœur pour le suivi des âmes ✨

📅 Date de Création : ${new Date(membre.created_at).toLocaleString("fr-FR")}
👤 Nom : ${membre.prenom} ${membre.nom}
🏙️ Ville : ${membre.ville || "—"}
🎗️ Sexe : ${membre.sexe || "—"}
⏳ Age : ${membre.age || "—"}
📱 Téléphone : ${membre.telephone || "—"}
💬 WhatsApp : ${membre.is_whatsapp ? "Oui" : "Non"}

✨ Raison de la venue : ${membre.statut_initial || "—"}
🙏 Prière du salut : ${membre.priere_salut ? "Oui" : "Non"}
☀️ Type : ${membre.type_conversion || "—"}

📝 Infos : ${membre.infos_supplementaires || "—"}

Merci pour ton accompagnement ❤️`;
  };

  // =========================
  // ✅ Message évangélisation
  const sendEvangelisation = () => {
    const phone = (phoneNumber || membre.telephone)?.replace(/\D/g, "");

    if (!phone) {
      alert("❌ Numéro invalide");
      return;
    }

    const message = `👋 Bonjour ${membre.prenom || ""},

Nous sommes heureux de t’avoir rencontré 🙏  
Sache que Dieu t’aime et a un plan merveilleux pour ta vie ✨

Si tu as besoin de prière ou d’accompagnement,
nous sommes là pour toi ❤️`;

    sendWhatsApp(phone, message);
  };

  // =========================
  // ✅ Vérification doublon
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

  // =========================
  // ✅ CLICK PRINCIPAL
  const handleClick = async () => {
    if (!session) {
      alert("❌ Vous devez être connecté.");
      return;
    }

    try {
      setLoading(true);

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

      const message = buildMessage(responsablePrenom);
      const phone = responsableTelephone?.replace(/\D/g, "");

      if (!phone) {
        alert("❌ Numéro WhatsApp invalide.");
        return;
      }

      const doublon = await checkDoublon();
      if (doublon) {
        setShowDoublonPopup(true);
        return;
      }

      // ✅ Envoi normal
      sendWhatsApp(phone, message);

      // ✅ Update DB
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

      if (onEnvoyer) onEnvoyer(data);
    } catch (err) {
      console.error(err);
      alert(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  return (
    <>
      {/* ✅ BOUTON PRINCIPAL */}
      <button
        onClick={handleClick}
        disabled={loading}
        className={`w-full text-white font-bold px-4 py-2 rounded-lg ${
          loading ? "bg-gray-400" : "bg-green-500 hover:bg-green-600"
        }`}
      >
        {loading ? "Envoi..." : "📤 Envoyer au responsable"}
      </button>

      {/* ✅ BOUTON EVANGELISATION */}
      <button
        onClick={() => setShowWhatsappPopup(true)}
        className="w-full mt-2 bg-blue-500 text-white font-bold px-4 py-2 rounded-lg"
      >
        ✝️ Évangéliser par WhatsApp
      </button>

      {/* ===================== */}
      {/* ✅ POPUP DOUBLON */}
      {showDoublonPopup && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-96 text-center">
            <h3 className="text-xl font-bold mb-3">
              ⚠️ Doublon détecté
            </h3>

            <p className="mb-6">
              Ce numéro ({membre.telephone}) existe déjà.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  const msg = buildMessage("Responsable");
                  const phone = membre.telephone?.replace(/\D/g, "");
                  sendWhatsApp(phone, msg);
                  setShowDoublonPopup(false);
                }}
                className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg"
              >
                Envoyer quand même
              </button>

              <button
                onClick={() => setShowDoublonPopup(false)}
                className="flex-1 bg-gray-300 px-4 py-2 rounded-lg"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== */}
      {/* ✅ POPUP EVANGELISATION */}
      {showWhatsappPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-xl">

            <h2 className="text-xl font-bold mb-3">
              Envoyer l'évangélisation
            </h2>

            <p className="text-gray-700 mb-4">
              Cliquez sur <b>Envoyer</b> ou saisissez un numéro.
            </p>

            <input
              type="text"
              placeholder="Numéro (ex: +2305xxxxxxx)"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 mb-4"
            />

            <div className="flex gap-3">

              <button
                onClick={() => {
                  setShowWhatsappPopup(false);
                  setPhoneNumber("");
                }}
                className="flex-1 py-3 bg-gray-300 rounded-2xl"
              >
                Annuler
              </button>

              <button
                onClick={() => {
                  sendEvangelisation(); // ✅ CORRIGÉ
                  setShowWhatsappPopup(false);
                  setPhoneNumber("");
                }}
                className="flex-1 py-3 bg-green-500 text-white rounded-2xl"
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
