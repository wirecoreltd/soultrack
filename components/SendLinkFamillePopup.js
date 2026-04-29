"use client";

import { useState, useEffect } from "react";
import supabase from "../lib/supabaseClient";


export default function SendLinkFamillePopup({ label, type, buttonColor }) {
  const [showPopup, setShowPopup] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [egliseId, setEgliseId] = useState(null);
  const [familles, setFamilles] = useState([]);
  const [selectedFamilleId, setSelectedFamilleId] = useState("");
  const [selectedFamilleNom, setSelectedFamilleNom] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile } = await supabase
          .from("profiles")
          .select("eglise_id")
          .eq("id", user.id)
          .single();

        if (!profile) return;
        setEgliseId(profile.eglise_id);

        const { data: famillesData } = await supabase
          .from("familles")
          .select("id, ville, famille")
          .eq("responsable_id", user.id)
          .eq("eglise_id", profile.eglise_id);

        if (famillesData && famillesData.length > 0) {
          setFamilles(famillesData);
          if (famillesData.length === 1) {
            setSelectedFamilleId(famillesData[0].id);
            setSelectedFamilleNom(`${famillesData[0].ville} - ${famillesData[0].famille}`);
          }
        }
      } catch (err) {
        console.error("Erreur fetchData:", err.message);
      }
    };

    fetchData();
  }, []);

  const handleSend = () => {
    const familleId = selectedFamilleId || (familles.length === 1 ? familles[0].id : "");
    const familleNom = selectedFamilleNom || (familles.length === 1 ? `${familles[0].ville} - ${familles[0].famille}` : "");

    if (!familleId) {
      alert("Veuillez sélectionner une famille.");
      return;
    }

    if (!egliseId) {
      alert("Église introuvable.");
      return;
    }

    const base = window.location.origin;

    let link = "";
    let message = "";

    if (type === "ajouter_membre_famille") {
      link = `${base}/famille/ajouter-membre-famille?eglise_id=${egliseId}&famille_id=${familleId}`;
      message = `Bonjour 👋\n\nVoici le lien pour ajouter un nouveau membre à la famille.\n\nFamille : ${familleNom}\n\nCliquez ici :\n${link}\n\nMerci 🙏`;
    } else if (type === "ajouter_evangelise_famille") {
      link = `${base}/add-evangelise?eglise_id=${egliseId}&famille_id=${familleId}`;
      message = `Bonjour 👋\n\nVoici le lien pour enregistrer une personne rencontrée lors de l'évangélisation.\n\nFamille : ${familleNom}\n\nCliquez ici :\n${link}\n\nMerci 🙏`;
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
            <h2 className="text-xl font-bold mb-3">{label}</h2>
            <p className="text-gray-700 mb-4">
              Cliquez sur <b>Envoyer</b> si le contact figure déjà dans WhatsApp,
              ou saisissez un numéro manuellement.
            </p>

            {/* Select famille — affiché seulement si plusieurs familles */}
            {familles.length > 1 && (
              <select
                value={selectedFamilleId}
                onChange={(e) => {
                  const id = e.target.value;
                  setSelectedFamilleId(id);
                  const found = familles.find((f) => f.id === id);
                  setSelectedFamilleNom(found ? `${found.ville} - ${found.famille}` : "");
                }}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-orange-400"
                required
              >
                <option value="">-- Choisir une famille --</option>
                {familles.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.ville} - {f.famille}
                  </option>
                ))}
              </select>
            )}

            <input
              type="text"
              placeholder="Numéro (ex: +2305xxxxxxx)"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-orange-400"
            />

            <div className="flex gap-3">
              <button
                onClick={() => { setShowPopup(false); setPhoneNumber(""); }}
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
