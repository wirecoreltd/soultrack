"use client";

import { useState, useEffect } from "react";
import supabase from "../lib/supabaseClient";

export default function SendLinkPopup({ label, type, buttonColor, celluleId = null }) {
  const [showPopup, setShowPopup] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [churchName, setChurchName] = useState("");
  const [egliseId, setEgliseId] = useState(null);

  // ✅ States génériques pour cellule ET famille
  const [groupes, setGroupes] = useState([]);
  const [selectedGroupeId, setSelectedGroupeId] = useState(celluleId || "");
  const [selectedGroupeName, setSelectedGroupeName] = useState("");

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

        const isCellule = type.includes("cellule");
        const isFamille = type.includes("famille");

        // ✅ Fetch cellules OU familles selon le type, seulement si pas de celluleId fixe
        if ((isCellule || isFamille) && !celluleId) {
          const userId = user.id;
          const table = isFamille ? "familles" : "cellules";
          const nameField = isFamille ? "famille" : "cellule";

          const { data: groupesData } = await supabase
            .from(table)
            .select(`id, ville, ${nameField}`)
            .eq("responsable_id", userId)
            .eq("eglise_id", profile.eglise_id);

          if (groupesData && groupesData.length > 0) {
            const mapped = groupesData.map((d) => ({
              id: d.id,
              label: `${d.ville} - ${d[nameField]}`,
            }));
            setGroupes(mapped);
            if (groupesData.length === 1) {
              setSelectedGroupeId(groupesData[0].id);
              setSelectedGroupeName(`${groupesData[0].ville} - ${groupesData[0][nameField]}`);
            }
          }
        }

        // ✅ Si celluleId est passé en prop, récupérer son nom depuis la bonne table
        if (celluleId) {
          const isFamille = type.includes("famille");
          const table = isFamille ? "familles" : "cellules";
          const nameField = isFamille ? "famille" : "cellule";

          const { data: groupeData } = await supabase
            .from(table)
            .select(`ville, ${nameField}`)
            .eq("id", celluleId)
            .single();

          if (groupeData) {
            setSelectedGroupeName(`${groupeData.ville} - ${groupeData[nameField]}`);
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
    const cid = celluleId || selectedGroupeId;

    if (type === "ajouter_membre") {
      return `${base}/add-member?eglise_id=${egliseId}`;
    }

    if (type === "ajouter_membre_cellule") {
      return `${base}/ajouter-membre-cellule?eglise_id=${egliseId}&cellule_id=${cid}`;
    }

    if (type === "ajouter_membre_famille") {
      return `${base}/ajouter-membre-famille?eglise_id=${egliseId}&famille_id=${cid}`;
    }

    if (type === "ajouter_evangelise") {
      return `${base}/add-evangelise?eglise_id=${egliseId}`;
    }

    if (type === "ajouter_evangelise_cellule") {
      return `${base}/add-evangelise?eglise_id=${egliseId}&cellule_id=${cid}`;
    }

    if (type === "ajouter_evangelise_famille") {
      return `${base}/add-evangelise?eglise_id=${egliseId}&famille_id=${cid}`;
    }

    return base;
  };

  const handleSend = () => {
    // ✅ Vérifier qu'un groupe est sélectionné si nécessaire
    const needsGroupe =
      type === "ajouter_membre_cellule" ||
      type === "ajouter_evangelise_cellule" ||
      type === "ajouter_membre_famille" ||
      type === "ajouter_evangelise_famille";

    if (needsGroupe && !celluleId && !selectedGroupeId) {
      const label = type.includes("famille") ? "une famille" : "une cellule";
      alert(`Veuillez sélectionner ${label}.`);
      return;
    }

    const link = getLink();
    const groupeName = selectedGroupeName || "";

    const message =
      type === "ajouter_evangelise_cellule"
        ? `Bonjour 👋\n\nVoici le lien pour enregistrer une personne rencontrée lors de l'évangélisation.\n\nCellule : ${groupeName}\n\nCliquez ici :\n${link}\n\nMerci 🙏`
        : type === "ajouter_membre_cellule"
        ? `Bonjour 👋\n\nVoici le lien pour ajouter un nouveau membre à la cellule.\n\nCellule : ${groupeName}\n\nCliquez ici :\n${link}\n\nMerci 🙏`
        : type === "ajouter_evangelise_famille"
        ? `Bonjour 👋\n\nVoici le lien pour enregistrer une personne rencontrée lors de l'évangélisation.\n\nFamille : ${groupeName}\n\nCliquez ici :\n${link}\n\nMerci 🙏`
        : type === "ajouter_membre_famille"
        ? `Bonjour 👋\n\nVoici le lien pour ajouter un nouveau membre à la famille.\n\nFamille : ${groupeName}\n\nCliquez ici :\n${link}\n\nMerci 🙏`
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

  // ✅ Afficher le select si plusieurs groupes ET pas de celluleId fixe
  const needsGroupe =
    type === "ajouter_membre_cellule" ||
    type === "ajouter_evangelise_cellule" ||
    type === "ajouter_membre_famille" ||
    type === "ajouter_evangelise_famille";

  const selectLabel = type.includes("famille")
    ? "-- Choisir une famille --"
    : "-- Choisir une cellule --";

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

            {/* ✅ Sélecteur générique cellule / famille */}
            {needsGroupe && !celluleId && groupes.length > 1 && (
              <select
                value={selectedGroupeId}
                onChange={(e) => {
                  setSelectedGroupeId(e.target.value);
                  const found = groupes.find((g) => g.id === e.target.value);
                  setSelectedGroupeName(found?.label || "");
                }}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-orange-400"
                required
              >
                <option value="">{selectLabel}</option>
                {groupes.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.label}
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
