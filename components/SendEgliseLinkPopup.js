"use client";

import { useState, useEffect } from "react";
import supabase from "../../lib/supabaseClient";
import { v4 as uuidv4 } from "uuid";

export default function SendEgliseLinkPopup({ label, type, buttonColor, eglise, superviseur }) {
  const [showPopup, setShowPopup] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [token, setToken] = useState("");

  // ✅ Récupérer ou créer token
  useEffect(() => {
    const fetchOrCreateToken = async () => {
      const now = new Date().toISOString();

      // Vérifier s’il existe un token actif
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
        // Créer un nouveau token avec expiration 7 jours
        const newToken = uuidv4();
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

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
    const base = window.location.origin;
    if (!token) return base;
    if (type === "ajouter_membre") return `${base}/add-member?token=${token}`;
    if (type === "ajouter_evangelise") return `${base}/add-evangelise?token=${token}`;
    return base;
  };

  const handleSendWhatsApp = () => {
    const link = getLink();
    const whatsappLink = phoneNumber
      ? `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent(link)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(link)}`;

    window.open(whatsappLink, "_blank");
    setShowPopup(false);
    setPhoneNumber("");
  };

  const handleSendEmail = () => {
    const link = getLink();
    const subject = "Invitation à être relié(e) à votre superviseur spirituel";
    const body = `
Bonjour,

Vous êtes invité(e) à être relié(e) à votre superviseur spirituel.

📖 Responsable : ${superviseur.prenom} ${superviseur.nom}
⛪ Église : ${eglise.nom}
🌍 Branche / Région : ${eglise.branche || "—"}

Nous vous encourageons à accepter cette invitation afin de rester connecté(e) et guidé(e) dans votre parcours spirituel.
Pour accepter ou refuser l’invitation, cliquez sur le lien ci-dessous :

${link}

Que Dieu bénisse votre engagement et votre chemin dans la foi.

Cordialement,
L’équipe de SoulTrack
    `;
    window.location.href = `mailto:${emailAddress}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setShowPopup(false);
    setEmailAddress("");
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
            <p className="text-gray-700 mb-4">
              Choisissez comment envoyer l'invitation : WhatsApp ou Email.
            </p>

            {/* 📱 WhatsApp */}
            <input
              type="text"
              placeholder="Numéro WhatsApp (facultatif)"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            <button
              onClick={handleSendWhatsApp}
              className="w-full py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold mb-4 transition"
            >
              Envoyer via WhatsApp
            </button>

            {/* 📧 Email */}
            <input
              type="email"
              placeholder="Adresse Email"
              value={emailAddress}
              onChange={(e) => setEmailAddress(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            <button
              onClick={handleSendEmail}
              disabled={!emailAddress}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold mb-3 transition disabled:opacity-50"
            >
              Envoyer via Email
            </button>

            <button
              onClick={() => { setShowPopup(false); setPhoneNumber(""); setEmailAddress(""); }}
              className="w-full py-3 bg-gray-300 hover:bg-gray-400 rounded-xl font-semibold transition"
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </>
  );
}
