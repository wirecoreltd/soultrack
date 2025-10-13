// components/SendAppLinkEvangelise.js

"use client";

import { useState } from "react";

export default function SendAppLinkEvangelise({ label }) {
  const [loading, setLoading] = useState(false);

  // Valeur du token (tu peux le générer dynamiquement si besoin)
  const token = "33dd234f-8146-4818-976c-af7bfdcefe95";

  const handleSendLink = () => {
    setLoading(true);

    try {
      // Générer le lien pour add-evangelise.js
      const link = `${window.location.origin}/add-evangelise?token=${token}`;
      // Ouvrir WhatsApp avec le lien
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(link)}`, "_blank");
    } catch (err) {
      console.error("Erreur SendAppLinkEvangelise :", err);
      alert("Erreur lors de l'envoi du lien vers l'évangélisé.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleSendLink}
      className={`w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-[#09203F] to-[#537895] hover:opacity-90 transition`}
      disabled={loading}
    >
      {loading ? "Envoi..." : label || "Envoyer l'appli – Évangélisé"}
    </button>
  );
}
