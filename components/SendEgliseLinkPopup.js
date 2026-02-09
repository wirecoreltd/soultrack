"use client";

import { useState, useEffect } from "react";
import supabase from "../lib/supabaseClient";
import { v4 as uuidv4 } from "uuid";

export default function SendEgliseLinkPopup({ label, type, superviseur, eglise }) {
  const [showPopup, setShowPopup] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [token, setToken] = useState("");

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

      if (!error && data) setToken(data.token);
      else {
        const newToken = uuidv4();
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
        await supabase.from("access_tokens").insert([{ token: newToken, access_type: type, expires_at: expiresAt }]);
        setToken(newToken);
      }
    };
    fetchOrCreateToken();
  }, [type]);

  const getLink = () => `${window.location.origin}/accept-invitation?token=${token}`;

  const handleSend = () => {
    const link = getLink();
    if (type === "whatsapp") {
      const whatsappLink = phoneNumber
        ? `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent(
            `🙏 Bonjour, vous êtes invité(e) à être relié(e) à votre superviseur.\n\n📖 Responsable : ${superviseur.prenom} ${superviseur.nom}\n⛪ Église : ${eglise.nom}\n🌍 Branche / Région : ${eglise.branche || "—"}\n\nLien : ${link}`
          )}`
        : `https://api.whatsapp.com/send?text=${encodeURIComponent(
            `🙏 Bonjour, vous êtes invité(e) à être relié(e) à votre superviseur.\n\n📖 Responsable : ${superviseur.prenom} ${superviseur.nom}\n⛪ Église : ${eglise.nom}\n🌍 Branche / Région : ${eglise.branche || "—"}\n\nLien : ${link}`
          )}`;
      window.open(whatsappLink, "_blank");
    } else if (type === "email") {
      const subject = "Invitation à se relier à votre superviseur spirituel";
      const body = `🙏 Bonjour,\n\nVous êtes invité(e) à être relié(e) à votre superviseur.\n\n📖 Responsable : ${superviseur.prenom} ${superviseur.nom}\n⛪ Église : ${eglise.nom}\n🌍 Branche / Région : ${eglise.branche || "—"}\n\nLien : ${link}\n\nQue Dieu vous bénisse.`;
      window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }
    setShowPopup(false);
    setPhoneNumber("");
  };

  return (
    <>
      <button
        onClick={() => setShowPopup(true)}
        className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-[#09203F] to-[#537895] hover:opacity-90 transition"
      >
        {label}
      </button>

      {showPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-xl relative">
            <h2 className="text-xl font-bold mb-3">{label}</h2>
            {type === "whatsapp" && (
              <>
                <p className="text-gray-700 mb-4">
                  Cliquez sur <span className="font-semibold">Envoyer</span> pour ouvrir WhatsApp, ou saisissez un numéro manuellement.
                </p>
                <input
                  type="text"
                  placeholder="Numéro WhatsApp (+2305xxxxxx)"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </>
            )}
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowPopup(false)}
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
