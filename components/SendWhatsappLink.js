// components/SendLinkPopup.js
"use client";

import { useState } from "react";
import supabase from "../lib/supabaseClient";

export default function SendLinkPopup({ label, type, buttonColor }) {
  const [loading, setLoading] = useState(false);

  const handleSendLink = async () => {
    setLoading(true);
    try {
      // Récupérer l'userId depuis localStorage ou props selon ton cas
      const userId = localStorage.getItem("userId");
      if (!userId) throw new Error("Utilisateur non connecté");

      // Générer un token UUID unique
      const token = crypto.randomUUID();

      // Définir expiration du lien (ici 24h)
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

      // Insérer le token dans Supabase
      const { data, error } = await supabase
        .from("access_tokens")
        .insert([
          {
            user_id: userId,
            token,
            access_type: type,
            expires_at: expiresAt,
          },
        ])
        .select();

      if (error) {
        console.error("Erreur insertion access_token:", error);
        throw error;
      }

      console.log("Token créé avec succès:", data[0]);

      // Construire le lien à envoyer
      const link = `${window.location.origin}/access/${token}`;
      console.log("Lien généré:", link);

      // Ici tu peux envoyer le lien via WhatsApp ou autre méthode
      // Exemple simple :
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(link)}`, "_blank");

      alert("Lien envoyé avec succès !");
    } catch (err) {
      console.error("Erreur lors de l'envoi du lien et création du suivi:", err);
      alert("Erreur lors de l'envoi du lien et création du suivi. Voir console pour détails.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleSendLink}
      className={`w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r ${buttonColor} hover:opacity-90 transition`}
      disabled={loading}
    >
      {loading ? "Envoi..." : label}
    </button>
  );
}
