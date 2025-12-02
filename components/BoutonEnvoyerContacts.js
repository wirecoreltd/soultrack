"use client";

import { useState } from "react";

export default function BoutonEnvoyerContacts({ membres, type, cible, session, showToast }) {
  const [loading, setLoading] = useState(false);

  const sendToWhatsapp = async () => {
    if (!membres || membres.length === 0) {
      showToast("❌ Aucun contact sélectionné !");
      return;
    }
    if (!cible) {
      showToast("❌ Veuillez sélectionner une cible !");
      return;
    }

    setLoading(true);

    try {
      // Formatage simple des numéros
      const membresFormatted = membres.map(m => ({
        ...m,
        telephone: m.telephone.replace(/\D/g, "") // supprime tout sauf chiffres
      }));

      console.log("Envoi WhatsApp:", { membres: membresFormatted, cible });

      const response = await fetch("/api/send-whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          membres: membresFormatted,
          cible,
          type
        })
      });

      const json = await response.json().catch(() => null);
      console.log("Réponse API:", json);

      if (!response.ok) {
        console.error("Erreur sendToWhatsapp:", json);
        showToast("❌ Une erreur est survenue lors de l'envoi.");
        setLoading(false);
        return;
      }

      showToast("✅ Messages envoyés avec succès !");
    } catch (err) {
      console.error("Erreur sendToWhatsapp catch:", err);
      showToast("❌ Une erreur est survenue lors de l'envoi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={sendToWhatsapp}
      disabled={loading}
      className={`bg-green-500 text-white font-semibold px-4 py-2 rounded ${
        loading ? "opacity-50 cursor-not-allowed" : "hover:bg-green-600"
      }`}
    >
      {loading ? "Envoi en cours..." : "📤 Envoyer WhatsApp"} 
    </button>
  );
}
