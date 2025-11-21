"use client";

import { useState, useEffect } from "react";
import supabase from "../lib/supabaseClient"; // Assure-toi que supabase est importé

export default function SendLinkPopup({ label, type, buttonColor }) {
  const [showPopup, setShowPopup] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [token, setToken] = useState("");

  // Récupère le dernier token actif pour ce type
  useEffect(() => {
    const fetchToken = async () => {
      const { data, error } = await supabase
        .from("access_tokens")
        .select("token")
        .eq("access_type", type)
        .order("expires_at", { ascending: false })
        .limit(1)
        .single();

      if (!error && data) setToken(data.token);
    };

    fetchToken();
  }, [type]);

  const getLink = () => {
    const base = window.location.origin;
    if (!token) return base; // fallback
    if (type === "ajouter_membre") return `${base}/add-member?token=${token}`;
    if (type === "ajouter_evangelise") return `${base}/add-evangelise?token=${token}`;
    return base;
  };

  const handleSend = () => {
    const link = getLink();

    if (!phoneNumber) {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(link)}`, "_blank");
    } else {
      window.open(
        `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent(link)}`,
        "_blank"
      );
    }

    setShowPopup(false);
    setPhoneNumber("");
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
              Cliquez sur <span className="font-semibold">Envoyer</span> si le contact figure déjà dans votre liste WhatsApp,
              ou saisissez un numéro manuellement.
            </p>

            <input
              type="text"
              placeholder="Saisir le numéro manuellement (ex: +2305xxxxxx)"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => { setShowPopup(false); setPhoneNumber(""); }}
                className="flex-1 py-3 bg-gray-300 hover:bg-gray-400 rounded-2xl font-semibold transition"
              >
                Annuler
              </button>
              <button
                onClick={handleSend}
                className="flex-1 py-3 bg-green-500 hover:bg-green-600 text-white rounded-2xl font-semibold transition"
              >
                Envoyer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
