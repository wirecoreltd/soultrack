"use client";

import { useState } from "react";

export default function SendAppLink({ label, buttonColor }) {
  const [loading, setLoading] = useState(false);

  const handleSendApp = async () => {
    setLoading(true);
    try {
      // 🔹 Lien de ton formulaire d’inscription
      const link = `${window.location.origin}/add-member`;
      const message = `Salut 👋 Clique sur ce lien pour remplir ta fiche d'inscription : ${link}`;

      // 🔹 Ouvre WhatsApp
      window.open(
        `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`,
        "_blank"
      );
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'envoi du lien WhatsApp");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleSendApp}
      className={`w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r ${buttonColor} hover:opacity-90 transition`}
      disabled={loading}
    >
      {loading ? "Envoi..." : label}
    </button>
  );
}
