// components/SendAppLinkEvangelise.js
"use client";

import { useState } from "react";
import supabase from "../lib/supabaseClient";
import { v4 as uuidv4 } from "uuid";

export default function SendAppLinkEvangelise({ label, buttonColor, userId }) {
  const [loading, setLoading] = useState(false);

  const handleSendLink = async () => {
    setLoading(true);

    try {
      const token = uuidv4(); // Génère un token unique pour chaque envoi

      // Créer le suivi
      const { error } = await supabase
        .from("suivis")
        .insert({
          user_id: userId,
          token,
          created_at: new Date(),
        });

      if (error) throw error;

      // Générer le lien pour add-evangelise
      const link = `${window.location.origin}/add-evangelise?token=${token}`;
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(link)}`, "_blank");
    } catch (err) {
      console.error("Erreur SendAppLinkEvangelise :", err);
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
