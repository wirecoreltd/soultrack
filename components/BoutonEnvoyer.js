"use client";
import { useState } from "react";
import supabase from "../lib/supabaseClient";

export default function BoutonEnvoyer({ membre, type = "cellule", cible, session, onEnvoyer, showToast }) {
  const [loading, setLoading] = useState(false);
  const [showDoublonPopup, setShowDoublonPopup] = useState(false);
  const [doublonDetected, setDoublonDetected] = useState(false);

  const statutIds = { envoye: 1, en_attente: 2, integrer: 3, refus: 4 };

  // ✅ Normaliser téléphone
  const getPhone = (phone) => {
    if (!phone) return null;
    return phone.replace(/\D/g, "");
  };

  // ✅ Envoi WhatsApp
  const sendWhatsApp = (phone, message) => {
    if (!phone) {
      alert("❌ Numéro invalide");
      return;
    }

    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  // ✅ Générer message UNE SEULE FOIS
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

  const handleClick = async () => {
    if (!session) {
      alert("❌ Vous devez être connecté.");
      return;
    }

    setLoading(true);

    try {
      // 🔹 Vérifier doublon
      if (await checkDoublon()) {
        setDoublonDetected(true);
        setShowDoublonPopup(true);
        setLoading(false);
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

      const phone = getPhone(responsableTelephone);
      if (!phone) {
        alert("❌ Numéro invalide");
        return;
      }

      const message = buildMessage(responsablePrenom);

      // 🔹 WhatsApp
      sendWhatsApp(phone, message);

      // 🔹 Update DB
      const now = new Date().toISOString();

      const { data, error } = await supabase
        .from("membres_complets")
        .update({
          statut: "actif",
          statut_suivis: statutIds.envoye,
          cellule_id: type === "cellule" ? cible.id : null,
          conseiller_id: type === "conseiller" ? cible.id : null,
          suivi_cellule_nom: type === "cellule" ? cible.cellule_full : null,
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

      if (error) throw error;

      if (onEnvoyer) onEnvoyer(data);

      if (showToast) {
        showToast(
          `✅ ${membre.prenom} ${membre.nom} envoyé le ${new Date(now).toLocaleString("fr-FR")}`
        );
      }

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
          loading ? "bg-gray-400" : "bg-green-500 hover:bg-green-600"
        }`}
      >
        {loading ? "Envoi..." : "📤 Envoyer par WhatsApp"}
      </button>

      {/* 🔥 POPUP DOUBLON */}
      {showDoublonPopup && doublonDetected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-96 text-center">
            <h3 className="text-xl font-bold mb-3">⚠️ Doublon détecté</h3>
            <p className="mb-6">
              Ce numéro ({membre.telephone}) existe déjà.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  const phone = getPhone(membre.telephone);
                  const message = buildMessage("Responsable");
                  sendWhatsApp(phone, message);
                }}
                className="flex-1 bg-green-500 text-white px-4 py-2 rounded"
              >
                Envoyer quand même
              </button>

              <button
                onClick={() => setShowDoublonPopup(false)}
                className="flex-1 bg-gray-300 px-4 py-2 rounded"
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
