//SendWhatsappLink.js
"use client";
import { useState, useEffect } from "react";
import supabase from "../lib/supabaseClient";

export default function SendWhatsappLink({ type, label, buttonColor = "bg-green-500" }) {
  const [showPopup, setShowPopup] = useState(false);
  const [phone, setPhone] = useState("");
  const [sending, setSending] = useState(false);
  const [token, setToken] = useState(null);

  useEffect(() => {
    if (type === "voir_copier") return;

    const fetchToken = async () => {
      const { data, error } = await supabase
        .from("access_tokens")
        .select("token")
        .eq("access_type", type)
        .limit(1)
        .single();

      if (!error && data) setToken(data.token);
    };

    fetchToken();
  }, [type]);

  const handleSend = async () => {
    if (!phone) return alert("Veuillez saisir un numéro WhatsApp.");

    setSending(true);

    try {
      // ✅ Crée le membre s'il n'existe pas
      const { data: existingMember } = await supabase
        .from("membres")
        .select("*")
        .eq("telephone", phone.trim())
        .single();

      let memberId;
      if (!existingMember) {
        const { data: newMember, error: insertError } = await supabase
          .from("membres")
          .insert([{ telephone: phone.trim(), statut: "visiteur", created_at: new Date() }])
          .select()
          .single();
        if (insertError) throw insertError;
        memberId = newMember.id;
      } else {
        memberId = existingMember.id;
      }

      // ✅ Crée un suivi "envoye"
      await supabase.from("suivis_membres").insert([
        { membre_id: memberId, statut: "envoye", created_at: new Date() },
      ]);

      // ✅ Préparer le message WhatsApp
      let message;
      if (type === "ajouter_membre") {
        message = `Voici le lien pour ajouter un nouveau membre : 👉 ${window.location.origin}/access/${token}`;
      } else if (type === "ajouter_evangelise") {
        message = `Voici le lien pour ajouter un nouveau évangélisé : 👉 ${window.location.origin}/access/${token}`;
      } else {
        message = `Voici le lien : 👉 ${window.location.origin}/access/${token || type}`;
      }

      const waUrl = `https://wa.me/${phone.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;
      window.open(waUrl, "_blank");

      setPhone("");
      setShowPopup(false);
    } catch (err) {
      console.error("Erreur envoi WhatsApp :", err);
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
    <div className="w-full">
      <button
        onClick={() => setShowPopup(true)}
        className={`w-full py-3 rounded-2xl text-white font-bold ${buttonColor} transition-all duration-200`}
      >
        {label}
      </button>

      {showPopup && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-lg flex flex-col gap-4">
            <h3 className="text-lg font-bold text-center">{label}</h3>
            <p className="text-sm text-gray-700 text-center mb-2">
              Saisir le numéro WhatsApp avec indicatif (laisser vide pour choisir un contact existant)
            </p>
            <input
              type="tel"
              placeholder="+230XXXXXXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="border rounded-xl px-3 py-2 w-full text-center"
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
