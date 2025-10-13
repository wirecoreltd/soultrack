// components/SendAppLinkPopup.js
"use client";

import { useState } from "react";

export default function SendAppLinkPopup({ label, type, buttonColor, token }) {
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");

  // Détermine la page selon le type
  const getLinkPath = () => {
    if (type === "ajouter_membre") return "/add-member";
    if (type === "ajouter_evangelise") return "/add-evangelise";
    return "/";
  };

  const handleSendLink = () => {
    setLoading(true);
    const link = `${window.location.origin}${getLinkPath()}?token=${token}`;

    if (phoneNumber.trim() === "") {
      // Si pas de numéro saisi, ouvrir WhatsApp pour sélectionner un contact
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(link)}`, "_blank");
    } else {
      // Sinon envoyer vers le numéro saisi
      const formattedNumber = phoneNumber.replace(/\D/g, ""); // supprime tout sauf les chiffres
      window.open(
        `https://api.whatsapp.com/send?phone=${formattedNumber}&text=${encodeURIComponent(link)}`,
        "_blank"
      );
    }

    setLoading(false);
    setShowPopup(false);
    setPhoneNumber("");
  };

  return (
    <>
      <button
        onClick={() => setShowPopup(true)}
        className={`w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r ${buttonColor} hover:opacity-90 transition`}
        disabled={loading}
      >
        {loading ? "Envoi..." : label}
      </button>

      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-lg flex flex-col gap-4">
            <h2 className="text-lg font-bold text-gray-800">{label}</h2>
            <p className="text-gray-600 text-sm">
              Cliquez sur "Envoyer" si le contact figure déjà dans votre liste WhatsApp.
            </p>

            <input
              type="text"
              placeholder="Numéro de téléphone (optionnel)"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />

            <div className="flex gap-3 justify-end mt-2">
              <button
                onClick={() => {
                  setShowPopup(false);
                  setPhoneNumber("");
                }}
                className="px-4 py-2 rounded-xl bg-gray-300 hover:bg-gray-400 font-semibold transition"
              >
                Annuler
              </button>
              <button
                onClick={handleSendLink}
                className="px-4 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold transition"
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
