//components/SendAppLink.js
"use client";

import { useState } from "react";
import supabase from "../lib/supabaseClient";

// Générateur simple de token unique sans 'uuid'
function generateToken() {
  return "token-" + Math.random().toString(36).substring(2, 15)
    + Math.random().toString(36).substring(2, 15);
}

export default function SendAppLink({ label, buttonColor, type }) {
  const [loading, setLoading] = useState(false);

  const handleSendLink = async () => {
    setLoading(true);

    try {
      // Récupère l'utilisateur connecté
      const userId = localStorage.getItem("userId");
      if (!userId) {
        alert("Utilisateur non connecté !");
        setLoading(false);
        return;
      }

      // Génère un token unique
      const token = generateToken();

      // Enregistre dans la table 'suivis'
      const { error } = await supabase.from("suivis").insert({
        user_id: userId,
        token: token,
        created_at: new Date(),
        type: type === "evangelise" ? "evangelisation" : "membre"
      });

      if (error) throw error;

      // Détermine le lien selon le type
      const linkPath =
        type === "evangelise" ? `/add-evangelise/${token}` : `/access/${token}`;
      const fullLink = `${window.location.origin}${linkPath}`;

      // Ouvre WhatsApp avec le lien
      window.open(
        `https://api.whatsapp.com/send?text=${encodeURIComponent(fullLink)}`,
        "_blank"
      );
    } catch (err) {
      console.error("Erreur SendAppLink :", err);
      alert("Erreur lors de l’envoi du lien et création du suivi.");
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

