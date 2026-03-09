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

  const fetchOrCreateToken = async () => {

    try {

      let church_id = null;
      let branch_id = null;

      // 🔹 récupérer profil utilisateur
      if (userId) {

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("eglise_id, branche_id")
          .eq("id", userId)
          .single();

        if (profileError) {
          console.error(profileError);
          return;
        }

        church_id = profile.eglise_id;
        branch_id = profile.branche_id;

        // 🔹 récupérer nom église
        const { data: church } = await supabase
          .from("eglises")
          .select("nom")
          .eq("id", church_id)
          .single();

        if (church) setChurchName(church.nom);

        // 🔹 récupérer nom branche
        const { data: branch } = await supabase
          .from("branches")
          .select("nom")
          .eq("id", branch_id)
          .single();

        if (branch) setBranchName(branch.nom);
      }

      const now = new Date().toISOString();

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

      // 🔹 créer nouveau token
      const newToken = uuidv4();

      const expiresAt = new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000
      ).toISOString();

      const { error: insertError } = await supabase
        .from("access_tokens")
        .insert([
          {
            token: newToken,
            access_type: type,
            expires_at: expiresAt,
            church_id,
            branch_id,
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

      const getLink = () => {
      if (typeof window === "undefined") return "";
    
      if (!token) return window.location.origin;
    
      if (type === "ajouter_membre") {
        return `${window.location.origin}/add-member?token=${token}`;
      }
    
      if (type === "ajouter_evangelise") {
        return `${window.location.origin}/add-evangelise?token=${token}`;
      }
    
      return window.location.origin;
    };

  const handleSend = () => {

    const link = getLink();

    let message = "";

if (type === "ajouter_membre") {
  message = `Bonjour 👋

      Voici le lien pour ajouter un nouveau membre.
      
      Église : ${churchName}
      Branche : ${branchName}
      
      Merci de prendre quelques instants pour remplir ce formulaire.
      
      Cliquez ici :
      ${link}
      
      Merci pour votre service 🙏`;
      }
      
      if (type === "ajouter_evangelise") {
        message = `Bonjour 👋
      
      Voici le lien pour enregistrer une personne rencontrée lors de l'évangélisation.
      
      Église : ${churchName}
      Branche : ${branchName}
      
      Merci de remplir ce formulaire après votre rencontre.
      
      Cliquez ici :
      ${link}
      
      Merci pour votre engagement dans l'œuvre 🙏`;
      }

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

            <h2 className="text-xl font-bold mb-3">
              {label}
            </h2>

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
