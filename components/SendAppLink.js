// components/SendAppLinkPopup.js
"use client";

import { useState } from "react";

export default function SendAppLinkPopup({ label, type, token }) {
  const [isOpen, setIsOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);

  // Détermine le lien selon le type et ajoute le token
  const getLink = () => {
    let path = "/";
    if (type === "ajouter_membre") path = "/add-member";
    if (type === "ajouter_evangelise") path = "/add-evangelise";

    return `${window.location.origin}${path}?token=${token}`;
  };

  const handleSend = () => {
    setLoading(true);
    try {
      const linkToSend = getLink();
      let whatsappLink = "";

      if (phoneNumber.trim() === "") {
        // Champ vide → ouvrir WhatsApp pour choisir un contact
        whatsappLink = `https://api.whatsapp.com/send?text=${encodeURIComponent(linkToSend)}`;
      } else {
        // Numéro saisi → envoie directement
        const sanitizedNumber = phoneNumber.replace(/\D/g, "");
        whatsappLink = `https://api.whatsapp.com/send?phone=${sanitizedNumber}&text=${encodeURIComponent(linkToSend)}`;
      }

      window.open(whatsappLink, "_blank");
      setIsOpen(false);
      setPhoneNumber("");
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
        disabled={loading}
      >
        {loading ? "Envoi..." : label}
      </button>

      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-lg flex flex-col gap-4">
            <h2 className="text-xl font-bold text-gray-800">{label}</h2>
            <p className="text-gray-600 text-sm">
              Cliquez sur "Envoyer" si le contact figure déjà dans votre liste WhatsApp.
            </p>
            <input
              type="text"
              placeholder="Saisir un numéro manuellement"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="border border-gray-300 rounded-xl p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <div className="flex justify-between gap-3 mt-2">
              <button
                onClick={() => setIsOpen(false)}
                className="flex-1 py-2 bg-gray-300 text-gray-800 font-semibold rounded-xl hover:bg-gray-400 transition"
              >
                Annuler
              </button>
              <button
                onClick={handleSend}
                className="flex-1 py-2 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition"
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
