"use client";

import { useState, useEffect } from "react";
import supabase from "../../lib/supabaseClient";
import HeaderPages from "../../components/HeaderPages";
import ProtectedRoute from "../../components/ProtectedRoute";
import { v4 as uuidv4 } from "uuid";

export default function LinkEglise() {
  return (
    <ProtectedRoute allowedRoles={["Administrateur", "ResponsableEvangelisation"]}>
      <LinkEgliseContent />
    </ProtectedRoute>
  );
}

function LinkEgliseContent() {
  const [showPopup, setShowPopup] = useState(false);
  const [contact, setContact] = useState(""); // Pour saisir manuellement
  const [token, setToken] = useState("");

  // Crée ou récupère un token pour le lien
  useEffect(() => {
    const fetchOrCreateToken = async () => {
      const now = new Date().toISOString();
      let { data, error } = await supabase
        .from("access_tokens")
        .select("*")
        .eq("access_type", "link_eglise")
        .gte("expires_at", now)
        .order("expires_at", { ascending: false })
        .limit(1)
        .single();

      if (!error && data) {
        setToken(data.token);
      } else {
        const newToken = uuidv4();
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
        await supabase
          .from("access_tokens")
          .insert([{ token: newToken, access_type: "link_eglise", expires_at: expiresAt }]);
        setToken(newToken);
      }
    };

    fetchOrCreateToken();
  }, []);

  const getLink = () => {
    return `${window.location.origin}/accept-invitation?token=${token}`;
  };

  const handleSendWhatsapp = () => {
    const link = getLink();
    const whatsappLink = contact
      ? `https://api.whatsapp.com/send?phone=${contact}&text=${encodeURIComponent(link)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(link)}`;
    window.open(whatsappLink, "_blank");
    setShowPopup(false);
    setContact("");
  };

  const handleSendEmail = () => {
    const link = getLink();
    const mailtoLink = `mailto:${contact}?subject=Invitation&body=${encodeURIComponent(
      "Bonjour 🙏\n\nVous êtes invité(e) à relier votre église.\nCliquez ici : " + link
    )}`;
    window.open(mailtoLink, "_blank");
    setShowPopup(false);
    setContact("");
  };

  return (
    <div className="min-h-screen bg-[#333699] text-white p-6 flex flex-col items-center">
      <HeaderPages />
      <h1 className="text-4xl font-bold mb-6 text-center">Relier une Église</h1>

      <button
        onClick={() => setShowPopup(true)}
        className="bg-blue-600 px-6 py-3 rounded-xl font-semibold text-white hover:bg-blue-700 transition mb-10"
      >
        📤 Envoyer l’invitation à
      </button>

      {showPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-xl relative text-black">
            <h2 className="text-xl font-bold mb-3">Envoyer l’invitation</h2>
            <p className="mb-4 text-gray-700">
              Saisissez un numéro ou une adresse email pour envoyer l’invitation, 
              ou laissez vide pour choisir directement dans WhatsApp/Email.
            </p>

            <input
              type="text"
              placeholder="Numéro WhatsApp ou Email"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />

            <div className="flex gap-3 justify-between">
              <button
                onClick={() => { setShowPopup(false); setContact(""); }}
                className="flex-1 py-3 bg-gray-300 hover:bg-gray-400 rounded-2xl font-semibold transition"
              >
                Annuler
              </button>
              <button
                onClick={handleSendWhatsapp}
                className="flex-1 py-3 bg-green-500 hover:bg-green-600 text-white rounded-2xl font-semibold transition"
              >
                📱 WhatsApp
              </button>
              <button
                onClick={handleSendEmail}
                className="flex-1 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl font-semibold transition"
              >
                ✉️ Email
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
