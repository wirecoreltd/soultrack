"use client";

import { useState, useEffect } from "react";
import supabase from "../lib/supabaseClient";

export default function SendLinkPopup({ label, type, buttonColor, celluleId = null }) {
  const [showPopup, setShowPopup] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [churchName, setChurchName] = useState("");
  const [egliseId, setEgliseId] = useState(null);
  const [cellules, setCellules] = useState([]);
  const [selectedCelluleId, setSelectedCelluleId] = useState(celluleId || "");
  const [selectedCelluleName, setSelectedCelluleName] = useState("");

  const isFamilleType = type === "ajouter_membre_famille" || type === "ajouter_evangelise_famille";
  const isCelluleType = type === "ajouter_membre_cellule" || type === "ajouter_evangelise_cellule";

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("eglise_id")
          .eq("id", user.id)
          .single();

        if (profileError || !profile) return;

        setEgliseId(profile.eglise_id);

        // Nom de l'église
        const { data: churchData } = await supabase
          .from("eglises")
          .select("nom")
          .eq("id", profile.eglise_id)
          .single();
        if (churchData) setChurchName(churchData.nom);

        // Cellules du responsable
        if (isCelluleType && !celluleId) {
          const { data: cellulesData } = await supabase
            .from("cellules")
            .select("id, ville, cellule")
            .eq("responsable_id", user.id)
            .eq("eglise_id", profile.eglise_id);

          if (cellulesData && cellulesData.length > 0) {
            setCellules(cellulesData);
            if (cellulesData.length === 1) {
              setSelectedCelluleId(cellulesData[0].id);
              setSelectedCelluleName(`${cellulesData[0].ville} - ${cellulesData[0].cellule}`);
            }
          }
        }

        // Familles du responsable
        if (isFamilleType && !celluleId) {
          const { data: famillesData } = await supabase
            .from("familles")
            .select("id, famille_full")
            .eq("responsable_id", user.id)
            .eq("eglise_id", profile.eglise_id);

          if (famillesData && famillesData.length > 0) {
            // Normalise au même format que cellules pour réutiliser le même state
            setCellules(famillesData.map(f => ({ id: f.id, ville: f.famille_full, cellule: "" })));
            if (famillesData.length === 1) {
              setSelectedCelluleId(famillesData[0].id);
              setSelectedCelluleName(famillesData[0].famille_full);
            }
          }
        }

        // Si celluleId passé en prop → récupérer le nom (cellule)
        if (celluleId && isCelluleType) {
          const { data: celluleData } = await supabase
            .from("cellules")
            .select("ville, cellule")
            .eq("id", celluleId)
            .single();
          if (celluleData) {
            setSelectedCelluleName(`${celluleData.ville} - ${celluleData.cellule}`);
          }
        }

        // Si celluleId passé en prop → récupérer le nom (famille)
        if (celluleId && isFamilleType) {
          const { data: familleData } = await supabase
            .from("familles")
            .select("famille_full")
            .eq("id", celluleId)
            .single();
          if (familleData) {
            setSelectedCelluleName(familleData.famille_full);
          }
        }
      } catch (err) {
        console.error("Erreur fetchUserData :", err.message);
      }
    };

    fetchUserData();
  }, [type, celluleId]);

  const getLink = () => {
    const base = window.location.origin;
    const cid = celluleId || selectedCelluleId;

    if (type === "ajouter_membre") {
      return `${base}/add-member?eglise_id=${egliseId}`;
    }

    if (type === "ajouter_membre_cellule") {
      return `${base}/ajouter-membre-cellule?eglise_id=${egliseId}&cellule_id=${cid}`;
    }

    if (type === "ajouter_evangelise") {
      return `${base}/add-evangelise?eglise_id=${egliseId}`;
    }

    if (type === "ajouter_evangelise_cellule") {
      return `${base}/add-evangelise?eglise_id=${egliseId}&cellule_id=${cid}`;
    }

    if (type === "ajouter_membre_famille") {
      return `${base}/ajouter-membre-famille?eglise_id=${egliseId}&famille_id=${cid}`;
    }

    if (type === "ajouter_evangelise_famille") {
      return `${base}/add-evangelise?eglise_id=${egliseId}&famille_id=${cid}`;
    }

    return base;
  };

  const handleSend = () => {
    if ((isCelluleType || isFamilleType) && !celluleId && !selectedCelluleId) {
      alert(isFamilleType ? "Veuillez sélectionner une famille." : "Veuillez sélectionner une cellule.");
      return;
    }

    const link = getLink();
    const celluleName = selectedCelluleName || "";

    const message =
      type === "ajouter_evangelise_cellule"
        ? `Bonjour 👋\n\nVoici le lien pour enregistrer une personne rencontrée lors de l'évangélisation.\n\nCellule : ${celluleName}\n\nCliquez ici :\n${link}\n\nMerci 🙏`
      : type === "ajouter_membre_cellule"
        ? `Bonjour 👋\n\nVoici le lien pour ajouter un nouveau membre à la cellule.\n\nCellule : ${celluleName}\n\nCliquez ici :\n${link}\n\nMerci 🙏`
      : type === "ajouter_membre_famille"
        ? `Bonjour 👋\n\nVoici le lien pour ajouter un nouveau membre à la famille.\n\nFamille : ${celluleName}\n\nCliquez ici :\n${link}\n\nMerci 🙏`
      : type === "ajouter_evangelise_famille"
        ? `Bonjour 👋\n\nVoici le lien pour enregistrer une personne rencontrée lors de l'évangélisation.\n\nFamille : ${celluleName}\n\nCliquez ici :\n${link}\n\nMerci 🙏`
      : type === "ajouter_membre"
        ? `Bonjour 👋\n\nVoici le lien pour ajouter un nouveau membre.\n\nÉglise : ${churchName}\n\nCliquez ici :\n${link}\n\nMerci 🙏`
        : `Bonjour 👋\n\nVoici le lien pour enregistrer une personne rencontrée lors de l'évangélisation.\n\nÉglise : ${churchName}\n\nCliquez ici :\n${link}\n\nMerci 🙏`;

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

            {/* Select cellule ou famille si plusieurs disponibles */}
            {(isCelluleType || isFamilleType) && !celluleId && cellules.length > 1 && (
              <select
                value={selectedCelluleId}
                onChange={(e) => {
                  setSelectedCelluleId(e.target.value);
                  const found = cellules.find(c => c.id === e.target.value);
                  if (found) {
                    setSelectedCelluleName(found.cellule ? `${found.ville} - ${found.cellule}` : found.ville);
                  }
                }}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-orange-400"
                required
              >
                <option value="">-- Choisir {isFamilleType ? "une famille" : "une cellule"} --</option>
                {cellules.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.cellule ? `${c.ville} - ${c.cellule}` : c.ville}
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
