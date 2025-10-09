//components/SendWhatsappButtons.js/
"use client";
import { useState } from "react";
import supabase from "../lib/supabaseClient";

export default function SendWhatsappButtons({ type }) {
  const [showPopup, setShowPopup] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!phoneNumber) return alert("Veuillez saisir un numéro de téléphone.");

    setSending(true);

    try {
      // 1️⃣ Vérifier si le membre existe déjà
      const { data: existingMember } = await supabase
        .from("membres")
        .select("*")
        .eq("telephone", phoneNumber.trim())
        .single();

      let memberId;
      if (!existingMember) {
        const { data: newMember, error: insertError } = await supabase
          .from("membres")
          .insert([{ telephone: phoneNumber.trim(), statut: "actif", created_at: new Date() }])
          .select()
          .single();
        if (insertError) throw insertError;
        memberId = newMember.id;
      } else {
        memberId = existingMember.id;
        await supabase.from("membres").update({ statut: "actif" }).eq("id", memberId);
      }

      // 2️⃣ Créer un suivi si inexistant
      const { data: existingFollow } = await supabase
        .from("suivis_membres")
        .select("*")
        .eq("membre_id", memberId);

      if (!existingFollow || existingFollow.length === 0) {
        const { error: insertSuiviError } = await supabase.from("suivis_membres").insert([
          { membre_id: memberId, statut: "envoye", created_at: new Date() },
        ]);
        if (insertSuiviError) throw insertSuiviError;
      }

      // 3️⃣ Préparer le lien WhatsApp
      const link = `https://soultrack-beta.vercel.app/access/${type}`;
      const waUrl = `https://wa.me/${phoneNumber.replace(/\D/g, "")}?text=${encodeURIComponent(link)}`;
      window.open(waUrl, "_blank");

      setPhoneNumber("");
      setShowPopup(false);
    } catch (err) {
      console.error("Erreur envoi WhatsApp:", err);
      alert("Erreur lors de l'envoi du lien et création du suivi.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col items-center w-full">
      <button
        onClick={() => setShowPopup(true)}
        className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-xl transition-all duration-200 w-full"
      >
        {type === "ajouter_membre" ? "Envoyer l'appli – Nouveau membre" : "Envoyer l'appli – Évangélisé"}
      </button>

      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-6 w-80 relative flex flex-col gap-4 shadow-lg">
            <button
              onClick={() => setShowPopup(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-xl"
            >
              ❌
            </button>

            <h3 className="text-lg font-semibold text-gray-800 text-center">Saisir le numéro WhatsApp</h3>
            <input
              type="tel"
              placeholder="+230XXXXXXXX"
              className="border p-2 rounded w-full text-center"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
            <button
              onClick={handleSend}
              disabled={sending}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-xl transition-all duration-200 w-full"
            >
              {sending ? "Envoi..." : "Envoyer"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
