// components/SendAppLinkPopup.js
"use client";

import { useState } from "react";

export default function SendAppLinkPopup({ label, type, defaultNumber = "+2305xxxxxx" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState(defaultNumber);
  const [loading, setLoading] = useState(false);

  // Définir le lien selon le type
  const getLink = () => {
    if (type === "ajouter_membre") return `${window.location.origin}/add-member`;
    if (type === "ajouter_evangelise") return `${window.location.origin}/add-evangelise`;
    return window.location.origin;
  };

  const handleSend = () => {
    setLoading(true);
    try {
      const whatsappLink = `https://api.whatsapp.com/send?phone=${phoneNumber.replace(/\D/g, '')}&text=${encodeURIComponent(getLink())}`;
      window.open(whatsappLink, "_blank");
      setIsOpen(false);
    } catch (err) {
      console.error("Erreur en envoyant le lien :", err);
      alert("Erreur lors de l'envoi du lien.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-[#09203F] to-[#537895] hover:opacity-90 transition"
      >
        {label}
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-sm relative">
            <h2 className="text-xl font-bold mb-3 text-center">{label}</h2>
            <p className="text-gray-600 mb-4 text-center">
              Cliquez sur <strong>Envoyer</strong> si le contact figure déjà dans votre liste WhatsApp.
            </p>

            <input
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-4 text-center focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />

            <div className="flex justify-between gap-4">
              <button
                onClick={() => setIsOpen(false)}
                className="flex-1 py-2 bg-gray-300 hover:bg-gray-400 rounded-lg font-semibold transition"
              >
                Annuler
              </button>
              <button
                onClick={handleSend}
                disabled={loading}
                className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition"
              >
                {loading ? "Envoi..." : "Envoyer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
