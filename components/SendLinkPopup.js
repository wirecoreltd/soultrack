// components/SendLinkPopup.js
"use client";

import { useState } from "react";
import supabase from "../lib/supabaseClient";

export default function SendLinkPopup({ label, type, buttonColor, userId }) {
  const [loading, setLoading] = useState(false);

  const handleSendLink = async () => {
    if (!userId) return;

    setLoading(true);

    try {
      // Récupérer le token existant pour ce userId et type
      const { data: tokenData } = await supabase
        .from("access_tokens")
        .select("*")
        .eq("user_id", userId)
        .eq("access_type", type)
        .single();

      if (!tokenData) {
        alert("Aucun token trouvé pour cet utilisateur et ce type");
        return;
      }

      // Créer le suivi
      await supabase
        .from("suivis")
        .upsert(
          {
            user_id: userId,
            token: tokenData.token,
            created_at: new Date(),
          },
          { onConflict: ["token", "user_id"] }
        );

      // Générer lien WhatsApp
      const link = `${window.location.origin}/access/${tokenData.token}`;
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(link)}`, "_blank");
    } catch (err) {
      console.error("Erreur SendLinkPopup :", err);
      alert("Erreur lors de l'envoi du lien et création du suivi.");
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
