//components/SendLinkPopup.js/
"use client";

import { useState, useEffect } from "react";
import supabase from "../lib/supabaseClient";

export default function SendLinkPopup({ label, type, buttonColor }) {
  const [showPopup, setShowPopup] = useState(false);
  const [phone, setPhone] = useState("");
  const [token, setToken] = useState(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (type === "voir_copier") return;

    const fetchToken = async () => {
      const { data, error } = await supabase
        .from("access_tokens")
        .select("*")
        .eq("access_type", type)
        .limit(1)
        .single();

      if (!error && data) setToken(data.token);
    };

    fetchToken();
  }, [type]);

  const handleSend = async () => {
    if (!phone) return alert("Veuillez entrer un numéro WhatsApp.");

    setSending(true);

    try {
      // 1️⃣ Vérifier si le membre existe déjà
      const { data: existingMember } = await supabase
        .from("membres")
        .select("*")
        .eq("telephone", phone.trim())
        .single();

      let memberId;
      if (!existingMember) {
        // Créer le membre si inexistant
        const { data: newMember, error: insertError } = await supabase
          .from("membres")
          .insert([{ telephone: phone.trim(), statut: "actif", created_at: new Date() }])
          .select()
          .single();

        if (insertError) throw insertError;

        memberId = newMember.id;
      } else {
        memberId = existingMember.id;
        // Mettre à jour le statut existant
        await supabase
          .from("membres")
          .update({ statut: "actif" })
          .eq("id", memberId);
      }

      // 2️⃣ Créer un suivi si inexistant
      const { data: existingSuivi, error: errCheck } = await supabase
        .from("suivis_membres")
        .select("*")
        .eq("membre_id", memberId)
        .single();

      if (errCheck && errCheck.code !== "PGRST116") throw errCheck;

      if (!existingSuivi) {
        const { error: insertSuiviError } = await supabase.from("suivis_membres").insert([
          {
            membre_id: memberId,
            statut: "envoye",
            created_at: new Date(),
          },
        ]);

        if (insertSuiviError) throw insertSuiviError;
      }

      // 3️⃣ Préparer le lien WhatsApp
      const message =
        type === "ajouter_membre"
          ? `Voici le lien pour ajouter un nouveau membre : 👉 ${window.location.origin}/access/${token}`
          : `Voici le lien pour ajouter un nouveau évangélisé : 👉 ${window.location.origin}/access/${token}`;

      const waUrl = `https://wa.me/${phone.replace(/\D/g, "")}?text=${encodeURIComponent(
        message
      )}`;
      window.open(waUrl, "_blank");

      setPhone("");
      setShowPopup(false);
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'envoi du lien et création du suivi.");
    } finally {
      setSending(false);
    }
  };

  if ((type === "ajouter_membre" || type === "ajouter_evangelise") && !token) {
    return (
      <button
        className={`w-full py-3 rounded-2xl text-white font-bold ${buttonColor} cursor-not-allowed`}
        disabled
      >
        {label} - Token introuvable
      </button>
    );
  }

  return (
    <div className="relative w-full">
      <button
        onClick={() => setShowPopup(true)}
        className={`w-full py-3 rounded-2xl text-white font-bold bg-gradient-to-r ${buttonColor} transition-all duration-200`}
      >
        {label}
      </button>

      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-lg flex flex-col gap-4">
            <h3 className="text-lg font-bold">{label}</h3>
            {type !== "voir_copier" && (
              <p className="text-sm text-gray-700">
                Laissez vide pour sélectionner un contact existant sur WhatsApp
              </p>
            )}
            <input
              type="text"
              placeholder="Numéro WhatsApp avec indicatif"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="border rounded-xl px-3 py-2 w-full"
            />
            <div className="flex justify-end gap-2 mt-2">
              <button
                onClick={() => setShowPopup(false)}
                className="px-4 py-2 rounded-xl bg-gray-300 text-gray-800 font-bold"
              >
                Annuler
              </button>
              <button
                onClick={handleSend}
                disabled={sending}
                className="px-4 py-2 rounded-xl text-white font-bold bg-gradient-to-r from-green-400 via-green-500 to-green-600"
              >
                {sending ? "Envoi..." : "Envoyer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
