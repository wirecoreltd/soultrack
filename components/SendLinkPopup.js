// components/SendLinkPopup.js
"use client";

import { useState } from "react";
import supabase from "../lib/supabaseClient";

export default function SendLinkPopup({ label, type, buttonColor, userId }) {
  const [loading, setLoading] = useState(false);

  const handleSendLink = async () => {
    setLoading(true);

    try {
      console.log("=== Début SendLinkPopup ===");
      console.log("User ID :", userId, "Type :", type);

      if (!userId) throw new Error("Utilisateur non connecté");

      // 1️⃣ Vérifier le token existant
      const { data: tokenData, error: tokenError } = await supabase
        .from("access_tokens")
        .select("*")
        .eq("user_id", userId)
        .eq("access_type", type)
        .single();

      console.log("Token récupéré :", tokenData);
      console.log("Erreur token :", tokenError);

      if (tokenError || !tokenData) {
        throw new Error("Token non trouvé pour cet utilisateur et type");
      }

      // 2️⃣ Créer le suivi
      const suiviInsert = {
        user_id: userId,
        token: tokenData.token,
        created_at: new Date(),
      };

      console.log("Insertion suivi :", suiviInsert);

      const { data: suiviData, error: suiviError } = await supabase
        .from("suivis")
        .insert([suiviInsert])
        .select();

      console.log("Suivi créé :", suiviData);
      console.log("Erreur suivi :", suiviError);

      if (suiviError) throw suiviError;

      // 3️⃣ Générer le lien WhatsApp
      const link = `${window.location.origin}/access/${tokenData.token}`;
      console.log("Lien WhatsApp :", link);

      // Ouvrir WhatsApp
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(link)}`, "_blank");

      alert("Lien envoyé avec succès !");

    } catch (err) {
      console.error("=== Erreur SendLinkPopup ===", err);
      alert(`Erreur lors de l'envoi du lien et création du suivi : ${err.message}`);
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
