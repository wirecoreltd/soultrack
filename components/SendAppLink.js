//components/SendAppLink.js
"use client";

import { useState } from "react";

export default function SendAppLink({ label, linkPage }) {
  const [loading, setLoading] = useState(false);

  const handleSendLink = async () => {
    setLoading(true);

    try {
      // On peut générer un token côté serveur si nécessaire
      const token = Math.random().toString(36).substring(2, 12); // simple token temporaire

      // Crée le lien complet
      const link = `${window.location.origin}/${linkPage}?token=${token}`;

      // Ouvre WhatsApp
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(link)}`, "_blank");
    } catch (err) {
      console.error("Erreur SendAppLink :", err);
      alert("Erreur lors de l'envoi du lien.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleSendLink}
      className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-[#09203F] to-[#537895] hover:opacity-90 transition"
      disabled={loading}
    >
      {loading ? "Envoi..." : label}
    </button>
  );
}

