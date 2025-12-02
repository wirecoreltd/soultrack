"use client";

import { useState } from "react";

export default function BoutonEnvoyerContacts({ membres, type, cible, showToast }) {
  const [loading, setLoading] = useState(false);

  const sendToWhatsapp = () => {
    if (!membres || membres.length === 0) {
      showToast("❌ Aucun contact sélectionné !");
      return;
    }
    if (!cible || !cible.telephone) {
      showToast("❌ Veuillez sélectionner une cible !");
      return;
    }

    setLoading(true);

    // Format numéro cible
    const cibleNumero = cible.telephone.replace(/\D/g, "");

    // Format message
    const message =
      `📥 Nouveau(s) contact(s) reçu(s)\n\n` +
      membres
        .map(
          (m) =>
            `👤 ${m.prenom} ${m.nom}\n📱 ${m.telephone}\n🏙️ ${m.ville || "—"}\n📝 ${m.besoin || "—"}`
        )
        .join("\n\n");

    // Encodage URL
    const encoded = encodeURIComponent(message);

    // Ouverture WhatsApp
    const url = `https://wa.me/${cibleNumero}?text=${encoded}`;

    window.open(url, "_blank");

    setLoading(false);
  };

  return (
    <button
      onClick={sendToWhatsapp}
      disabled={loading}
      className={`bg-green-500 text-white font-semibold px-4 py-2 rounded ${
        loading ? "opacity-50 cursor-not-allowed" : "hover:bg-green-600"
      }`}
    >
      {loading ? "Envoi..." : "📤 Envoyer WhatsApp"}
    </button>
  );
}
