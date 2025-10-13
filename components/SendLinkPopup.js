// components/SendLinkPopup.js
"use client";

import { useState } from "react";

export default function SendAppLinkPopup({ label, buttonColor, type, token }) {
  const [loading, setLoading] = useState(false);
  const [manualNumber, setManualNumber] = useState("");

  const handleSendLink = () => {
    setLoading(true);

    try {
      // Déterminer la page selon le type
      const page = type === "ajouter_membre" ? "add-member" : "add-evangelise";

      // Construire le lien complet avec le token
      const link = `${window.location.origin}/${page}?token=${token}`;

      // Message chaleureux selon le type
      const message =
        type === "ajouter_membre"
          ? `🌟 Cliquez sur ce lien pour enregistrer un nouveau membre et lui souhaiter la bienvenue dans notre communauté : ${link}`
          : `🌟 Cliquez sur ce lien pour enregistrer un nouvel évangélisé et l'accompagner dans sa démarche : ${link}`;

      // Si un numéro est renseigné manuellement, envoyer à ce numéro sinon ouvrir WhatsApp
      const finalLink = manualNumber
        ? `https://api.whatsapp.com/send?phone=${manualNumber}&text=${encodeURIComponent(message)}`
        : `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;

      window.open(finalLink, "_blank");
    } catch (err) {
      console.error("Erreur SendAppLinkPopup :", err);
      alert("Erreur lors de l'envoi du lien. Vérifiez votre connexion ou essayez de nouveau.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 w-full max-w-md">
      <p className="text-sm text-gray-700">
        Cliquez sur "Envoyer" si le contact figure déjà dans votre liste WhatsApp, ou saisissez un numéro manuellement.
      </p>

      <input
        type="text"
        placeholder="Saisir le numéro manuellement (ex: +2305xxxxxx)"
        value={manualNumber}
        onChange={(e) => setManualNumber(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
      />

      <button
        onClick={handleSendLink}
        disabled={loading}
        className={`w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r ${buttonColor} hover:opacity-90 transition`}
      >
        {loading ? "Envoi..." : label}
      </button>
    </div>
  );
}
