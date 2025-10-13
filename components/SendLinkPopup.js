// components/SendLinkPopup.js
"use client";

import { useState } from "react";
import supabase from "../lib/supabaseClient";

export default function SendLinkPopup({ label, type, buttonColor, userId }) {
  const [loading, setLoading] = useState(false);

  const handleSendLink = async () => {
    setLoading(true);
    try {
      // Vérification du userId
      if (!userId) throw new Error("Utilisateur non connecté");

      // 1️⃣ Récupérer le token existant pour cet utilisateur et type
      const { data: tokenData, error: tokenError } = await supabase
        .from("access_tokens")
        .select("*")
        .eq("user_id", userId)
        .eq("access_type", type)
        .single();

      if (tokenError || !tokenData) {
        console.error("Token non trouvé pour cet utilisateur et type :", tokenError);
        throw new Error("Token non trouvé pour cet utilisateur et type");
      }

      console.log("Token récupéré :", tokenData.token);

      // 2️⃣ Créer le suivi (ajuste le nom de ta table si besoin)
      const { data: suiviData, error: suiviError } = await supabase
        .from("suivis") // <-- remplace par ta table réelle
        .insert([
          {
            user_id: userId,
            token: tokenData.token,
            created_at: new Date(),
          },
        ])
        .select();

      if (suiviError) {
        console.error("Erreur lors de la création du suivi :", suiviError);
        throw suiviError;
      }

      console.log("Suivi créé avec succès :", suiviData);

      // 3️⃣ Générer le lien WhatsApp
      const link = `${window.location.origin}/access/${tokenData.token}`;
      console.log("Lien WhatsApp généré :", link);
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(link)}`, "_blank");

      alert("Lien envoyé avec succès !");
    } catch (err) {
      console.error("Erreur lors de l'envoi du lien et création du suivi :", err);
      alert("Erreur lors de l'envoi du lien et création du suivi. Vérifie la console pour détails.");
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
