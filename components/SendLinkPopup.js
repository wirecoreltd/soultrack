"use client";

import { useState, useEffect } from "react";
import supabase from "../lib/supabaseClient";
import { useLang } from "../../hooks/useLang";

const translations = {
  fr: {
    send: "Envoyer",
    cancel: "Annuler",
    clickSend: "Cliquez sur",
    bold_send: "Envoyer",
    ifContact: "si le contact figure déjà dans WhatsApp, ou saisissez un numéro manuellement.",
    chooseCellule: "-- Choisir une cellule --",
    chooseFamille: "-- Choisir une famille --",
    selectCellule: "Veuillez sélectionner une cellule.",
    selectFamille: "Veuillez sélectionner une famille.",
    phonePlaceholder: "Numéro (ex: +2305xxxxxxx)",
    // WhatsApp messages
    msgEvangeliseCellule: (groupeName, link) =>
      `Bonjour 👋\n\nVoici le lien pour enregistrer une personne rencontrée lors de l'évangélisation.\n\nCellule : ${groupeName}\n\nCliquez ici :\n${link}\n\nMerci 🙏`,
    msgMembreCellule: (groupeName, link) =>
      `Bonjour 👋\n\nVoici le lien pour ajouter un nouveau membre à la cellule.\n\nCellule : ${groupeName}\n\nCliquez ici :\n${link}\n\nMerci 🙏`,
    msgEvangeliseFamille: (groupeName, link) =>
      `Bonjour 👋\n\nVoici le lien pour enregistrer une personne rencontrée lors de l'évangélisation.\n\nFamille : ${groupeName}\n\nCliquez ici :\n${link}\n\nMerci 🙏`,
    msgMembreFamille: (groupeName, link) =>
      `Bonjour 👋\n\nVoici le lien pour ajouter un nouveau membre à la famille.\n\nFamille : ${groupeName}\n\nCliquez ici :\n${link}\n\nMerci 🙏`,
    msgMembre: (churchName, link) =>
      `Bonjour 👋\n\nVoici le lien pour ajouter un nouveau membre.\n\nÉglise : ${churchName}\n\nCliquez ici :\n${link}\n\nMerci 🙏`,
    msgEvangelise: (churchName, link) =>
      `Bonjour 👋\n\nVoici le lien pour enregistrer une personne rencontrée lors de l'évangélisation.\n\nÉglise : ${churchName}\n\nCliquez ici :\n${link}\n\nMerci 🙏`,
  },
  en: {
    send: "Send",
    cancel: "Cancel",
    clickSend: "Click",
    bold_send: "Send",
    ifContact: "if the contact is already in WhatsApp, or enter a number manually.",
    chooseCellule: "-- Choose a cell group --",
    chooseFamille: "-- Choose a family --",
    selectCellule: "Please select a cell group.",
    selectFamille: "Please select a family.",
    phonePlaceholder: "Number (e.g. +2305xxxxxxx)",
    // WhatsApp messages
    msgEvangeliseCellule: (groupeName, link) =>
      `Hello 👋\n\nHere is the link to register a person met during outreach.\n\nCell group: ${groupeName}\n\nClick here:\n${link}\n\nThank you 🙏`,
    msgMembreCellule: (groupeName, link) =>
      `Hello 👋\n\nHere is the link to add a new member to the cell group.\n\nCell group: ${groupeName}\n\nClick here:\n${link}\n\nThank you 🙏`,
    msgEvangeliseFamille: (groupeName, link) =>
      `Hello 👋\n\nHere is the link to register a person met during outreach.\n\nFamily: ${groupeName}\n\nClick here:\n${link}\n\nThank you 🙏`,
    msgMembreFamille: (groupeName, link) =>
      `Hello 👋\n\nHere is the link to add a new member to the family.\n\nFamily: ${groupeName}\n\nClick here:\n${link}\n\nThank you 🙏`,
    msgMembre: (churchName, link) =>
      `Hello 👋\n\nHere is the link to add a new member.\n\nChurch: ${churchName}\n\nClick here:\n${link}\n\nThank you 🙏`,
    msgEvangelise: (churchName, link) =>
      `Hello 👋\n\nHere is the link to register a person met during outreach.\n\nChurch: ${churchName}\n\nClick here:\n${link}\n\nThank you 🙏`,
  },
};

export default function SendLinkPopup({ label, type, buttonColor, celluleId = null }) {
  const { lang } = useLang();
  const t = translations[lang] || translations.fr;

  const [showPopup, setShowPopup] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [churchName, setChurchName] = useState("");
  const [egliseId, setEgliseId] = useState(null);

  const [groupes, setGroupes] = useState([]);
  const [selectedGroupeId, setSelectedGroupeId] = useState(celluleId || "");
  const [selectedGroupeName, setSelectedGroupeName] = useState("");

  const isFamille = type.includes("famille");
  const isCellule = type.includes("cellule");
  const table = isFamille ? "familles" : "cellules";
  const nameField = isFamille ? "famille" : "cellule";

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

        const { data: churchData } = await supabase
          .from("eglises")
          .select("nom")
          .eq("id", profile.eglise_id)
          .single();
        if (churchData) setChurchName(churchData.nom);

        if ((isCellule || isFamille) && !celluleId) {
          const { data: groupesData } = await supabase
            .from(table)
            .select(`id, ville, ${nameField}`)
            .eq("responsable_id", user.id)
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

        if (celluleId) {
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

  // ✅ cid passé en paramètre — ne dépend plus du state React
  const getLink = (cid) => {
    const base = window.location.origin;

    if (type === "ajouter_membre") {
      return `${base}/add-member?eglise_id=${egliseId}&lang=${lang}`;
    }
    if (type === "ajouter_membre_cellule") {
      return `${base}/ajouter-membre-cellule?eglise_id=${egliseId}&cellule_id=${cid}&lang=${lang}`;
    }
    if (type === "ajouter_membre_famille") {
      return `${base}/famille/ajouter-membre-famille?eglise_id=${egliseId}&famille_id=${cid}&lang=${lang}`;
    }
    if (type === "ajouter_evangelise") {
      return `${base}/add-evangelise?eglise_id=${egliseId}&lang=${lang}`;
    }
    if (type === "ajouter_evangelise_cellule") {
      return `${base}/add-evangelise?eglise_id=${egliseId}&cellule_id=${cid}&lang=${lang}`;
    }
    if (type === "ajouter_evangelise_famille") {
      return `${base}/add-evangelise?eglise_id=${egliseId}&famille_id=${cid}&lang=${lang}`;
    }

    return base;
  };

  const handleSend = () => {
    const needsGroupe = isCellule || isFamille;

    // ✅ cid calculé une seule fois ici et passé directement à getLink
    const cid = celluleId || selectedGroupeId || (groupes.length === 1 ? groupes[0].id : "");

    if (needsGroupe && !cid) {
      alert(isFamille ? t.selectFamille : t.selectCellule);
      return;
    }

    const link = getLink(cid);
    const groupeName = selectedGroupeName || groupes[0]?.label || "";

    let message = "";
    if (type === "ajouter_evangelise_cellule") {
      message = t.msgEvangeliseCellule(groupeName, link);
    } else if (type === "ajouter_membre_cellule") {
      message = t.msgMembreCellule(groupeName, link);
    } else if (type === "ajouter_evangelise_famille") {
      message = t.msgEvangeliseFamille(groupeName, link);
    } else if (type === "ajouter_membre_famille") {
      message = t.msgMembreFamille(groupeName, link);
    } else if (type === "ajouter_membre") {
      message = t.msgMembre(churchName, link);
    } else {
      message = t.msgEvangelise(churchName, link);
    }

    const whatsappLink = phoneNumber
      ? `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;

    window.open(whatsappLink, "_blank");
    setShowPopup(false);
    setPhoneNumber("");
  };

  const needsGroupe = isCellule || isFamille;
  const selectLabel = isFamille ? t.chooseFamille : t.chooseCellule;

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
              {t.clickSend} <b>{t.bold_send}</b> {t.ifContact}
            </p>

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
              placeholder={t.phonePlaceholder}
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-orange-400"
            />

            <div className="flex gap-3">
              <button
                onClick={() => { setShowPopup(false); setPhoneNumber(""); }}
                className="flex-1 py-3 bg-gray-300 hover:bg-gray-400 rounded-2xl font-semibold"
              >
                {t.cancel}
              </button>
              <button
                onClick={handleSend}
                className="flex-1 py-3 bg-green-500 hover:bg-green-600 text-white rounded-2xl font-semibold"
              >
                {t.send}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
