"use client";

import { useState, useEffect } from "react";
import supabase from "../lib/supabaseClient";
import { v4 as uuidv4 } from "uuid";

export default function SendLinkPopup({ label, type, buttonColor, userId }) {
  const [showPopup, setShowPopup] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [token, setToken] = useState("");

  // ✅ Fonction pour récupérer ou créer le token
  const fetchOrCreateToken = async () => {
    try {
      // Par défaut, token vide pour revenir au lien principal si échec
      setToken("");

      // 1️⃣ Récupérer l'église et la branche de l'utilisateur si userId fourni
      let church_id = null;
      let branch_id = null;

      if (userId) {
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("eglise_id, branche_id")
          .eq("id", userId)
          .single();

        if (!profileError && profile) {
          church_id = profile.eglise_id;
          branch_id = profile.branche_id;
        }
      }

      const now = new Date().toISOString();

      // 2️⃣ Vérifier s’il existe un token actif pour ce type et cette église
      let query = supabase
        .from("access_tokens")
        .select("*")
        .eq("access_type", type)
        .gte("expires_at", now)
        .order("expires_at", { ascending: false })
        .limit(1)
        .single();

      if (church_id) query = query.eq("church_id", church_id);
      if (branch_id) query = query.eq("branch_id", branch_id);

      const { data, error } = await query;

      if (!error && data) {
        setToken(data.token);
        return;
      }

      // 3️⃣ Créer un nouveau token avec expiration 7 jours
      const newToken = uuidv4();
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

      const { error: insertError } = await supabase
        .from("access_tokens")
        .insert([{
          token: newToken,
          access_type: type,
          expires_at: expiresAt,
          church_id,
          branch_id
        }]);

      if (!insertError) setToken(newToken);

    } catch (err) {
      console.error("Erreur récupération/creation token :", err.message);
      setToken(""); // lien fallback
    }
  };

  useEffect(() => {
    fetchOrCreateToken();
  }, [type, userId]);

  const getLink = () => {
    return token
      ? `${window.location.origin}/add-member?token=${token}`
      : window.location.origin; // fallback si pas de token
  };

  const handleSend = () => {
    const link = getLink();

    const message = `Bonjour 👋

Voici le lien pour accueillir un nouveau venu à l'église.

Merci de prendre quelques instants pour remplir ce formulaire afin que nous puissions mieux accompagner cette personne.

Cliquez ici :
${link}

Merci pour votre service 🙏`;

    const whatsappLink = phoneNumber
      ? `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;

    window.open(whatsappLink, "_blank");
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
