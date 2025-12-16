"use client";

import { useState } from "react";
import supabase from "../lib/supabaseClient";

export default function BoutonEnvoyer({
  membre,
  cible,
  session,
  prenomResponsable,
  onEnvoyer,
  showToast,
}) {
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");

  const statutIds = {
    envoye: 1,
    "en attente": 2,
    integrer: 3,
    refus: 4,
  };

  const handleEnvoyer = async () => {
    if (!session) {
      alert("❌ Vous devez être connecté.");
      return;
    }

    setLoading(true);

    try {
      // Vérifier si déjà suivi
      const { data: existing, error: selectError } = await supabase
        .from("suivis_membres")
        .select("id")
        .eq("telephone", membre.telephone || "");

      if (selectError) throw selectError;

      if (existing.length > 0) {
        alert(`⚠️ ${membre.prenom} ${membre.nom} est déjà suivi.`);
        setLoading(false);
        return;
      }

      // Insérer suivi dans Supabase
      const suiviData = {
        membre_id: membre.id,
        prenom: membre.prenom,
        nom: membre.nom,
        telephone: membre.telephone,
        is_whatsapp: true,
        ville: membre.ville,
        besoin: membre.besoin,
        infos_supplementaires: membre.infos_supplementaires,
        statut_suivis: statutIds.envoye,
        conseiller_id: cible?.id || null,
        responsable: prenomResponsable || cible?.responsable || "—",
        created_at: new Date().toISOString(),
      };

      const { error: insertError } = await supabase
        .from("suivis_membres")
        .insert([suiviData]);

      if (insertError) throw insertError;

      // 🔹 MESSAGE LIGNE PAR LIGNE COMME DEMANDÉ
      let message = `🌿 Salut ${prenomResponsable || cible?.responsable || ""} 👋,\n\n`;
      message += `Un nouveau contact t’est confié pour le suivi. Voici les informations :\n\n`;
      message += `👤 Nom: ${membre.prenom} ${membre.nom}\n`;
      message += `⚥ Sexe: ${membre.sexe || "—"}\n`;
      message += `📱 Téléphone: ${membre.telephone || "—"}\n`;
      message += `💬 WhatsApp: ${membre.is_whatsapp ? "Oui" : "Non"}\n`;
      message += `🏙 Ville: ${membre.ville || "—"}\n`;
      message += `🙏 Besoin(s): ${
        Array.isArray(membre.besoin)
          ? membre.besoin.join(", ")
          : membre.besoin || "—"
      }\n`;
      message += `📝 Infos supplémentaires: ${membre.infos_supplementaires || "—"}\n\n`;
      message += `Merci pour ton engagement, ta disponibilité et ton cœur.\n`;
      message += `Nous prions que Dieu te fortifie et t’inspire dans cet accompagnement.\n\n`;
      message += `Que le Seigneur te bénisse abondamment 🙌`;

      // 🔹 WHATSAPP
      const phone = phoneNumber ? phoneNumber.replace(/\D/g, "") : "";
      const whatsappLink = phone
        ? `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(
            message
          )}`
        : `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;

      window.open(whatsappLink, "_blank");

      if (onEnvoyer) onEnvoyer();
      if (showToast)
        showToast(`✅ ${membre.prenom} ${membre.nom} envoyé avec succès`);

      setShowPopup(false);
      setPhoneNumber("");
    } catch (err) {
      console.error("Erreur WhatsApp :", err);
      alert("❌ Une erreur est survenue. Voir la console.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* BOUTON PRINCIPAL */}
      <button
        onClick={() => setShowPopup(true)}
        disabled={loading}
        className="
          w-full
          py-2.5
          rounded-xl
          font-semibold
          text-white
          bg-gradient-to-r
          from-green-600
          to-green-400
          hover:opacity-90
          transition
        "
      >
        {loading ? "Envoi..." : "Envoyer par WhatsApp"}
      </button>

      {/* POPUP */}
      {showPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-xl">
            <h2 className="text-xl font-bold mb-3 text-green-700">
              Envoyer par WhatsApp
            </h2>

            <p className="text-gray-700 mb-4">
              Laisse vide pour choisir un contact dans WhatsApp ou saisis un
              numéro manuellement.
            </p>

            <input
              type="text"
              placeholder="Numéro WhatsApp (ex: +2305xxxxxx)"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-green-400"
            />

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowPopup(false);
                  setPhoneNumber("");
                }}
                className="flex-1 py-2.5 bg-gray-200 hover:bg-gray-300 rounded-2xl font-semibold"
              >
                Annuler
              </button>

              <button
                onClick={handleEnvoyer}
                className="flex-1 py-2.5 rounded-2xl font-semibold text-white bg-gradient-to-r from-green-600 to-green-500 hover:opacity-90 transition"
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
