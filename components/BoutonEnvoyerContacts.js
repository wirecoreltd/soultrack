"use client";

import { useState } from "react";

export default function BoutonEnvoyerContacts({ membres, type, cible, session, showToast, onSuccess }) {
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
      // 🔹 Formate les numéros
      const membresFormatted = membres.map(m => ({
        ...m,
        telephone: (m.telephone || "").replace(/\D/g, "")
      }));

      console.log("📨 Envoi WhatsApp vers cible :", cible);
      console.log("👥 Membres à envoyer :", membresFormatted);

      // 🔹 Vérifie que le numéro existe
      const cibleNumero = (cible.telephone || "").replace(/\D/g, "");
      if (!cibleNumero) {
        showToast("❌ Numéro de cible invalide !");
        setLoading(false);
        return;
      }
      console.log("📞 Numéro cible formaté :", cibleNumero);

      // 🔹 Appel API
      const response = await fetch("/api/send-whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ membres: membresFormatted, type, cible })
      });

      const data = await response.json().catch(() => null);
      console.log("📝 Réponse API send-whatsapp :", response.status, data);

      if (!response.ok) {
        console.error("❌ Erreur lors de l'envoi WhatsApp :", data);
        showToast("❌ Une erreur est survenue lors de l'envoi WhatsApp");
        setLoading(false);
        return;
      }

      showToast("✅ Messages envoyés avec succès !");
      
      // 🔹 Optionnel : callback pour retirer contacts de la page evangelisation
      if (onSuccess) onSuccess(membresFormatted.map(m => m.id));
    } catch (err) {
      console.error("❌ Erreur catch sendToWhatsapp :", err);
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
