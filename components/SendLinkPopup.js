// components/SendLinkPopup.js
"use client";

import { useState } from "react";
import supabase from "../lib/supabaseClient";

export default function SendLinkPopup({ label, buttonColor }) {
  const [loading, setLoading] = useState(false);

  // Valeurs que tu m’as donné
  const userId = "58eff16c-f480-4c73-a6e0-aa4423d2069d";
  const token = "33dd234f-8146-4818-976c-af7bfdcefe95";

  const handleSendLink = async () => {
    setLoading(true);

    try {
      // Créer le suivi si pas déjà existant
      const { error } = await supabase
        .from("suivis")
        .upsert(
          {
            user_id: userId,
            token: token,
            created_at: new Date(),
          },
          { onConflict: ["user_id", "token"] }
        );

      if (error) throw error;

      // Générer le lien WhatsApp
      const link = `${window.location.origin}/access/${token}`;
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

