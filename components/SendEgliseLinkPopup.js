"use client";

import { useState, useEffect } from "react";
import supabase from "../lib/supabaseClient";
import { v4 as uuidv4 } from "uuid";

export default function SendEgliseLinkPopup({ label, type, superviseur, eglise, branche, buttonColor }) {
  const [showPopup, setShowPopup] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");

  // ✅ Créer ou récupérer un token actif
  useEffect(() => {
    const fetchOrCreateToken = async () => {
      const now = new Date().toISOString();

      let { data, error } = await supabase
        .from("access_tokens")
        .select("*")
        .eq("access_type", type)
        .gte("expires_at", now)
        .order("expires_at", { ascending: false })
        .limit(1)
        .single();

      if (!error && data) {
        setToken(data.token);
      } else {
        const newToken = uuidv4();
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 jours

        const { error: insertError } = await supabase
          .from("access_tokens")
          .insert([{ token: newToken, access_type: type, expires_at: expiresAt }]);

        if (insertError) {
          console.error("Erreur création token :", insertError.message);
          return;
        }

        setToken(newToken);
      }
    };

    fetchOrCreateToken();
  }, [type]);

  const getLink = () => {
    if (!token) return window.location.origin;
    return `${window.location.origin}/accept-invitation?token=${token}`;
  };

  const handleSendWhatsApp = () => {
    const link = getLink();
    const message = `🙏 Bonjour,

Vous êtes invité(e) à être relié(e) à votre superviseur spirituel.

📖 Responsable : ${superviseur.prenom} ${superviseur.nom}
⛪ Église : ${eglise.nom}
🌍 Branche / Région : ${branche || "—"}

Pour accepter l'invitation, cliquez ici : ${link}

Que Dieu vous bénisse abondamment dans cette relation de guidance spirituelle.`;

    const waLink = phoneNumber
      ? `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;

    window.open(waLink, "_blank");
    setShowPopup(false);
    setPhoneNumber("");
  };

  const handleSendEmail = () => {
    const link = getLink();
    const subject = "Invitation à rejoindre votre superviseur spirituel";
    const body = `🙏 Bonjour,

Vous êtes invité(e) à être relié(e) à votre superviseur spirituel.

📖 Responsable : ${superviseur.prenom} ${superviseur.nom}
⛪ Église : ${eglise.nom}
🌍 Branche / Région : ${branche || "—"}

Pour accepter l'invitation, cliquez ici : ${link}

Que Dieu vous bénisse abondamment dans cette relation de guidance spirituelle.`;

    const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoLink, "_blank");
    setShowPopup(false);
    setEmail("");
  };

  return (
    <>
      <button
        onClick={() => setShowPopup(true)}
        className={`w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r ${buttonColor} hover:opacity-90 transition`}
      >
        {label}
      </button>

      {showPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-xl relative">
            <h2 className="text-xl font-bold mb-3">{label}</h2>

            <div className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="Numéro WhatsApp (ex: +2305xxxxxx) ou laisser vide"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />

              <input
                type="email"
                placeholder="Email (optionnel)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>

            <div className="flex gap-3 justify-end mt-4">
              <button
                onClick={() => { setShowPopup(false); setPhoneNumber(""); setEmail(""); }}
                className="flex-1 py-3 bg-gray-300 hover:bg-gray-400 rounded-2xl font-semibold transition"
              >
                Annuler
              </button>

              <button
                onClick={handleSendWhatsApp}
                className="flex-1 py-3 bg-green-500 hover:bg-green-600 text-white rounded-2xl font-semibold transition"
              >
                Envoyer via WhatsApp
              </button>

              <button
                onClick={handleSendEmail}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-semibold transition"
              >
                Envoyer par Email
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
