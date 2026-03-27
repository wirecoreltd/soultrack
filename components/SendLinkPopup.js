"use client";

import { useState, useEffect } from "react";
import supabase from "../lib/supabaseClient";
import { v4 as uuidv4 } from "uuid";

export default function SendLinkPopup({ label, type, buttonColor, userId }) {
  const [showPopup, setShowPopup] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [token, setToken] = useState("");
  const [churchName, setChurchName] = useState("");
  const [branchName, setBranchName] = useState("");

  // 🔹 Récupère l'église et la branche de l'utilisateur
  const fetchUserChurchAndBranch = async (userId) => {
    if (!userId) return { churchId: null, branchId: null };

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("eglise_id, branche_id")
      .eq("id", userId)
      .single();

    if (profileError || !profile) return { churchId: null, branchId: null };

    const { eglise_id, branche_id } = profile;

    // Récupération des noms
    const { data: churchData } = await supabase
      .from("eglises")
      .select("nom")
      .eq("id", eglise_id)
      .single();
    if (churchData) setChurchName(churchData.nom);

    const { data: branchData } = await supabase
      .from("branches")
      .select("nom")
      .eq("id", branche_id)
      .single();
    if (branchData) setBranchName(branchData.nom);

    return { churchId: eglise_id, branchId: branche_id };
  };

  // 🔹 Récupère ou crée un token
  const fetchOrCreateToken = async () => {
    try {
      const { churchId, branchId } = await fetchUserChurchAndBranch(userId);

      const now = new Date().toISOString();

      let query = supabase
        .from("access_tokens")
        .select("*")
        .eq("access_type", type)
        .gte("expires_at", now)
        .order("expires_at", { ascending: false })
        .limit(1)
        .single();

      if (churchId) query = query.eq("church_id", churchId);
      if (branchId) query = query.eq("branch_id", branchId);

      const { data, error } = await query;

      if (!error && data) {
        setToken(data.token);
        return;
      }

      // Crée un nouveau token si aucun existant
      const newToken = uuidv4();
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

      const { error: insertError } = await supabase
        .from("access_tokens")
        .insert([
          {
            token: newToken,
            access_type: type,
            expires_at: expiresAt,
            church_id: churchId,
            branch_id: branchId,
          },
        ]);

      if (!insertError) setToken(newToken);
    } catch (err) {
      console.error("Erreur token :", err.message);
    }
  };

  useEffect(() => {
    fetchOrCreateToken();
  }, [type, userId]);

  // 🔹 Génère le lien
  const getLink = () => {
    if (!token || typeof window === "undefined") return window.location.origin;

    if (type === "ajouter_membre") return `${window.location.origin}/add-member?token=${token}`;
    if (type === "ajouter_evangelise") return `${window.location.origin}/add-evangelise?token=${token}`;

    return window.location.origin;
  };

  // 🔹 Envoi WhatsApp
  const handleSend = () => {
    const link = getLink();

    const message = type === "ajouter_membre"
      ? `Bonjour 👋

Voici le lien pour ajouter un nouveau membre.

Église : ${churchName}
Branche : ${branchName}

Merci de prendre quelques instants pour remplir ce formulaire.

Cliquez ici :
${link}

Merci pour votre service 🙏`
      : `Bonjour 👋

Voici le lien pour enregistrer une personne rencontrée lors de l'évangélisation.

Église : ${churchName}
Branche : ${branchName}

Merci de remplir ce formulaire après votre rencontre.

Cliquez ici :
${link}

Merci pour votre engagement dans l'œuvre 🙏`;

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
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-xl">
            <h2 className="text-xl font-bold mb-3">{label}</h2>
            <p className="text-gray-700 mb-4">
              Cliquez sur <b>Envoyer</b> si le contact figure déjà dans WhatsApp,
              ou saisissez un numéro manuellement.
            </p>

            <input
              type="text"
              placeholder="Numéro (ex: +2305xxxxxxx)"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowPopup(false);
                  setPhoneNumber("");
                }}
                className="flex-1 py-3 bg-gray-300 hover:bg-gray-400 rounded-2xl font-semibold"
              >
                Annuler
              </button>

              <button
                onClick={handleSend}
                className="flex-1 py-3 bg-green-500 hover:bg-green-600 text-white rounded-2xl font-semibold"
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
