//components/SendAppLink.js

"use client";

import { useState } from "react";
import supabase from "../lib/supabaseClient";
import { v4 as uuidv4 } from "uuid";

export default function SendAppLink({ label, buttonColor, type }) {
  const [loading, setLoading] = useState(false);

  // ID de l'utilisateur connecté (plus tard à récupérer depuis le localStorage)
  const userId = "58eff16c-f480-4c73-a6e0-aa4423d2069d";

  const handleSendLink = async () => {
    setLoading(true);

    try {
      // Génération d’un token unique à chaque envoi
      const token = uuidv4();

      // Création du suivi
      const { error } = await supabase.from("suivis").insert([
        {
          user_id: userId,
          token,
          created_at: new Date(),
          type: type, // on garde une trace du type : membre ou evangelise
        },
      ]);

      if (error) throw error;

      // Définir le bon lien selon le type
      const pagePath =
        type === "evangelise" ? `/add-evangelise/${token}` : `/access/${token}`;

      // Envoi du lien par WhatsApp
      const link = `${window.location.origin}${pagePath}`;
      window.open(
        `https://api.whatsapp.com/send?text=${encodeURIComponent(link)}`,
        "_blank"
      );
    } catch (err) {
      console.error("Erreur SendAppLink :", err);
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
